package com.example.stayops.service.impl;

import com.example.stayops.dto.ReservationHoldRequestDTO;
import com.example.stayops.dto.ReservationHoldResponseDTO;
import com.example.stayops.dto.ReservationRequestDTO;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.ReservationHold;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.HoldStatus;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.ReservationHoldRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.ReservationHoldService;
import com.example.stayops.service.ReservationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationHoldServiceImpl implements ReservationHoldService {

    private final ReservationHoldRepository holdRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;

    private static final int DEFAULT_TTL_MINUTES = 15;

    @Override
    @Transactional
    public ReservationHoldResponseDTO createHold(ReservationHoldRequestDTO request) {
        log.info("Creating reservation hold for guest: {}", request.getGuestId());

        // Validate request
        if (request.getCheckInDate() == null || request.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
                request.getCheckOutDate().equals(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        // Fetch guest if provided
        Guest guest = null;
        if (request.getGuestId() != null) {
            guest = guestRepository.findById(request.getGuestId())
                    .orElseThrow(() -> new EntityNotFoundException("Guest not found: " + request.getGuestId()));
        }

        // Fetch and validate rooms
        Set<Room> rooms = new HashSet<>();
        if (request.getRoomIds() != null && !request.getRoomIds().isEmpty()) {
            List<Room> roomList = roomRepository.findAllById(request.getRoomIds());
            if (roomList.size() != request.getRoomIds().size()) {
                throw new EntityNotFoundException("Some rooms not found");
            }

            // Check room availability (considering existing holds and reservations)
            for (Room room : roomList) {
                if (!isRoomAvailable(room.getId(), request.getCheckInDate(), request.getCheckOutDate())) {
                    throw new IllegalStateException("Room " + room.getRoomNumber() +
                            " is not available for the selected dates");
                }
            }
            rooms.addAll(roomList);
        }

        // Generate hold token (idempotency key)
        String holdToken = UUID.randomUUID().toString();

        // Calculate expiry time
        int ttlMinutes = request.getTtlMinutes() != null ? request.getTtlMinutes() : DEFAULT_TTL_MINUTES;
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(ttlMinutes));

        // Create hold
        ReservationHold hold = ReservationHold.builder()
                .holdToken(holdToken)
                .sessionId(request.getSessionId())
                .guest(guest)
                .rooms(rooms)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .status(HoldStatus.ACTIVE)
                .expiresAt(expiresAt)
                .roomType(request.getRoomType())
                .numberOfRooms(request.getNumberOfRooms())
                .numberOfGuests(request.getNumberOfGuests())
                .notes(request.getNotes())
                .build();

        ReservationHold savedHold = holdRepository.save(hold);

        log.info("Hold created successfully with token: {} (expires at: {})", holdToken, expiresAt);

        return mapToResponseDTO(savedHold);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationHoldResponseDTO getHoldByToken(String holdToken) {
        ReservationHold hold = holdRepository.findByHoldToken(holdToken)
                .orElseThrow(() -> new EntityNotFoundException("Hold not found: " + holdToken));
        return mapToResponseDTO(hold);
    }

    @Override
    @Transactional
    public Long convertHoldToReservation(String holdToken) {
        log.info("Converting hold to reservation: {}", holdToken);

        ReservationHold hold = holdRepository.findByHoldToken(holdToken)
                .orElseThrow(() -> new EntityNotFoundException("Hold not found: " + holdToken));

        // Validate hold is still active
        if (hold.getStatus() != HoldStatus.ACTIVE) {
            throw new IllegalStateException("Hold is not active: " + hold.getStatus());
        }
        if (hold.isExpired()) {
            throw new IllegalStateException("Hold has expired");
        }

        // Double-check room availability
        for (Room room : hold.getRooms()) {
            if (!isRoomAvailable(room.getId(), hold.getCheckInDate(), hold.getCheckOutDate())) {
                throw new IllegalStateException("Room " + room.getRoomNumber() +
                        " is no longer available");
            }
        }

        // Create reservation from hold
        ReservationRequestDTO reservationRequest = ReservationRequestDTO.builder()
                .guestId(hold.getGuest() != null ? hold.getGuest().getGuestId() : null)
                .roomIds(hold.getRooms().stream().map(Room::getId).collect(Collectors.toSet()))
                .checkInDate(hold.getCheckInDate())
                .checkOutDate(hold.getCheckOutDate())
                .status(ReservationStatus.PENDING)  // Start as PENDING until payment
                .build();

        var reservation = reservationService.createReservation(reservationRequest);

        // Update hold status
        hold.setStatus(HoldStatus.CONVERTED);
        holdRepository.save(hold);

        log.info("Hold {} converted to reservation {}", holdToken, reservation.getReservationId());

        return reservation.getReservationId();
    }

    @Override
    @Transactional
    public void cancelHold(String holdToken) {
        log.info("Cancelling hold: {}", holdToken);

        ReservationHold hold = holdRepository.findByHoldToken(holdToken)
                .orElseThrow(() -> new EntityNotFoundException("Hold not found: " + holdToken));

        if (hold.getStatus() != HoldStatus.ACTIVE) {
            throw new IllegalStateException("Hold is not active");
        }

        hold.setStatus(HoldStatus.CANCELLED);
        holdRepository.save(hold);

        log.info("Hold {} cancelled successfully", holdToken);
    }

    @Override
    @Transactional
    public ReservationHoldResponseDTO extendHold(String holdToken, Integer additionalMinutes) {
        log.info("Extending hold {} by {} minutes", holdToken, additionalMinutes);

        ReservationHold hold = holdRepository.findByHoldToken(holdToken)
                .orElseThrow(() -> new EntityNotFoundException("Hold not found: " + holdToken));

        if (hold.getStatus() != HoldStatus.ACTIVE) {
            throw new IllegalStateException("Hold is not active");
        }

        Instant newExpiresAt = hold.getExpiresAt().plus(Duration.ofMinutes(additionalMinutes));
        hold.setExpiresAt(newExpiresAt);

        ReservationHold updated = holdRepository.save(hold);

        log.info("Hold {} extended, new expiry: {}", holdToken, newExpiresAt);

        return mapToResponseDTO(updated);
    }

    @Override
    @Transactional
    public int processExpiredHolds() {
        log.info("Processing expired holds...");

        List<ReservationHold> expiredHolds = holdRepository.findExpiredActiveHolds(Instant.now());

        for (ReservationHold hold : expiredHolds) {
            hold.setStatus(HoldStatus.EXPIRED);
            log.info("Expired hold: {} (token: {})", hold.getHoldId(), hold.getHoldToken());
        }

        holdRepository.saveAll(expiredHolds);

        log.info("Processed {} expired holds", expiredHolds.size());
        return expiredHolds.size();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationHoldResponseDTO> getActiveHoldsByGuest(String guestId) {
        List<ReservationHold> holds = holdRepository.findByGuestGuestIdAndStatus(guestId, HoldStatus.ACTIVE);
        return holds.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // Helper methods

    private boolean isRoomAvailable(Long roomId, java.time.LocalDate checkIn, java.time.LocalDate checkOut) {
        // Check for overlapping active holds
        List<ReservationHold> conflictingHolds = holdRepository.findActiveHoldsForRoom(
                roomId, checkIn, checkOut);

        if (!conflictingHolds.isEmpty()) {
            return false;
        }

        // Check for overlapping reservations
        var conflictingReservations = reservationRepository
                .findOverlappingReservationsForRoom(roomId, checkIn, checkOut);

        boolean hasActiveReservation = conflictingReservations.stream()
                .anyMatch(r -> r.getStatus() != ReservationStatus.CANCELLED &&
                        r.getStatus() != ReservationStatus.CHECKED_OUT);

        return !hasActiveReservation;
    }

    private ReservationHoldResponseDTO mapToResponseDTO(ReservationHold hold) {
        long secondsRemaining = 0;
        if (hold.getStatus() == HoldStatus.ACTIVE) {
            Duration remaining = Duration.between(Instant.now(), hold.getExpiresAt());
            secondsRemaining = Math.max(0, remaining.getSeconds());
        }

        return ReservationHoldResponseDTO.builder()
                .holdId(hold.getHoldId())
                .holdToken(hold.getHoldToken())
                .sessionId(hold.getSessionId())
                .guestId(hold.getGuest() != null ? hold.getGuest().getGuestId() : null)
                .roomIds(hold.getRooms() != null
                        ? hold.getRooms().stream().map(Room::getId).collect(Collectors.toSet())
                        : Collections.emptySet())
                .roomType(hold.getRoomType())
                .numberOfRooms(hold.getNumberOfRooms())
                .checkInDate(hold.getCheckInDate())
                .checkOutDate(hold.getCheckOutDate())
                .status(hold.getStatus())
                .expiresAt(hold.getExpiresAt())
                .secondsRemaining(secondsRemaining)
                .createdAt(hold.getCreatedAt())
                .build();
    }
}