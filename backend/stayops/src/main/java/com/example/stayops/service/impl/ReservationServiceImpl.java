package com.example.stayops.service.impl;

import com.example.stayops.dto.*;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.ReservationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;

    @Override
    public ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO) {
        validateDates(requestDTO.getCheckInDate(), requestDTO.getCheckOutDate());

        Guest guest = guestRepository.findById(requestDTO.getGuestId())
                .orElseThrow(() -> new EntityNotFoundException("Guest not found: " + requestDTO.getGuestId()));

        List<Room> rooms = fetchRoomsOrThrow(requestDTO.getRoomIds());
        checkRoomAvailability(rooms, requestDTO.getCheckInDate(), requestDTO.getCheckOutDate(), null);

        Reservation reservation = Reservation.builder()
                .checkInDate(requestDTO.getCheckInDate())
                .checkOutDate(requestDTO.getCheckOutDate())
                .status(requestDTO.getStatus() != null ? requestDTO.getStatus() : ReservationStatus.PENDING)
                .guest(guest)
                .rooms(rooms)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // Update rooms with bidirectional mapping
        for (Room room : rooms) {
            if (room.getReservations() == null) room.setReservations(new ArrayList<>());
            room.getReservations().add(saved);
        }
        roomRepository.saveAll(rooms);

        return mapToResponseDTO(saved);
    }

    @Override
    public ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO requestDTO) {
        validateDates(requestDTO.getCheckInDate(), requestDTO.getCheckOutDate());

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        Guest guest = guestRepository.findById(requestDTO.getGuestId())
                .orElseThrow(() -> new EntityNotFoundException("Guest not found: " + requestDTO.getGuestId()));

        List<Room> newRooms = fetchRoomsOrThrow(requestDTO.getRoomIds());
        checkRoomAvailability(newRooms, requestDTO.getCheckInDate(), requestDTO.getCheckOutDate(), reservationId);

        // Handle bidirectional relationship updates
        updateRoomMappings(reservation, newRooms);

        reservation.setCheckInDate(requestDTO.getCheckInDate());
        reservation.setCheckOutDate(requestDTO.getCheckOutDate());
        reservation.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : reservation.getStatus());
        reservation.setGuest(guest);
        reservation.setRooms(newRooms);

        Reservation saved = reservationRepository.save(reservation);
        roomRepository.saveAll(newRooms);

        return mapToResponseDTO(saved);
    }

    @Override
    public void deleteReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        List<Room> rooms = reservation.getRooms() != null ? reservation.getRooms() : Collections.emptyList();
        for (Room room : rooms) {
            if (room.getReservations() != null) room.getReservations().remove(reservation);
        }
        if (!rooms.isEmpty()) roomRepository.saveAll(rooms);

        reservationRepository.delete(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDTO getReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));
        return mapToResponseDTO(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationSummaryDTO> getMonthlySummary(int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(firstDay, lastDay);

        Map<LocalDate, ReservationSummaryDTO> map = new LinkedHashMap<>();
        IntStream.rangeClosed(1, firstDay.lengthOfMonth())
                .forEach(d -> map.put(firstDay.withDayOfMonth(d),
                        ReservationSummaryDTO.builder()
                                .date(firstDay.withDayOfMonth(d))
                                .checkIns(0)
                                .checkOuts(0)
                                .totalReservations(0)
                                .build()));

        for (Reservation r : reservations) {
            LocalDate start = r.getCheckInDate();
            LocalDate end = r.getCheckOutDate();

            if (!start.isBefore(firstDay) && !start.isAfter(lastDay)) map.get(start).incrementCheckIns();
            if (!end.isBefore(firstDay) && !end.isAfter(lastDay)) map.get(end).incrementCheckOuts();

            LocalDate iter = start.isBefore(firstDay) ? firstDay : start;
            LocalDate iterEnd = end.isAfter(lastDay) ? lastDay : end;

            while (!iter.isAfter(iterEnd)) {
                map.get(iter).incrementTotalReservations();
                iter = iter.plusDays(1);
            }
        }

        return new ArrayList<>(map.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllRoomReservationStatuses() {
        return reservationRepository.findAllRoomReservationStatuses();
    }

    // Also add this method to get reservations within a date range
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsInDateRange(LocalDate startDate, LocalDate endDate) {
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(startDate, endDate);
        return reservations.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDayDetailDTO> getReservationsForDate(LocalDate date) {
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        return reservations.stream().map(r -> ReservationDayDetailDTO.builder()
                        .reservationId(r.getReservationId())
                        .guestId(r.getGuest() != null ? r.getGuest().getGuestId() : null)
                        .roomIds(r.getRooms() != null
                                ? r.getRooms().stream().map(Room::getId).collect(Collectors.toSet())
                                : Collections.emptySet())
                        .checkInDate(r.getCheckInDate())
                        .checkOutDate(r.getCheckOutDate())
                        .status(r.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    /* ---------- Helper Methods ---------- */

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) throw new IllegalArgumentException("Dates must not be null");
        if (checkOut.isBefore(checkIn)) throw new IllegalArgumentException("checkOutDate must be after checkInDate");
    }

    private List<Room> fetchRoomsOrThrow(Set<Long> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) throw new IllegalArgumentException("roomIds cannot be empty");
        List<Room> rooms = roomRepository.findAllById(roomIds);
        Set<Long> foundIds = rooms.stream().map(Room::getId).collect(Collectors.toSet());
        Set<Long> missing = roomIds.stream().filter(id -> !foundIds.contains(id)).collect(Collectors.toSet());
        if (!missing.isEmpty()) throw new EntityNotFoundException("Rooms not found: " + missing);
        return rooms;
    }

    private void checkRoomAvailability(List<Room> rooms, LocalDate start, LocalDate end, Long excludeReservationId) {
        for (Room room : rooms) {
            List<Reservation> conflicts = excludeReservationId == null
                    ? reservationRepository.findOverlappingReservationsForRoom(room.getId(), start, end)
                    : reservationRepository.findOverlappingReservationsForRoomExcludingReservation(room.getId(), excludeReservationId, start, end);
            boolean hasActive = conflicts.stream().anyMatch(r -> r.getStatus() != ReservationStatus.CANCELLED);
            if (hasActive) throw new IllegalStateException("Room " + room.getRoomNumber() + " is not available between " + start + " and " + end);
        }
    }

    private void updateRoomMappings(Reservation reservation, List<Room> newRooms) {
        List<Room> oldRooms = reservation.getRooms() != null ? reservation.getRooms() : new ArrayList<>();
        Set<Long> newIds = newRooms.stream().map(Room::getId).collect(Collectors.toSet());

        for (Room old : oldRooms) {
            if (!newIds.contains(old.getId()) && old.getReservations() != null) old.getReservations().remove(reservation);
        }

        for (Room r : newRooms) {
            if (r.getReservations() == null) r.setReservations(new ArrayList<>());
            if (!r.getReservations().contains(reservation)) r.getReservations().add(reservation);
        }
    }

    private ReservationResponseDTO mapToResponseDTO(Reservation r) {
        return ReservationResponseDTO.builder()
                .reservationId(r.getReservationId())
                .guestId(r.getGuest() != null ? r.getGuest().getGuestId() : null)
                .roomIds(r.getRooms() != null
                        ? r.getRooms().stream().map(Room::getId).collect(Collectors.toSet())
                        : Collections.emptySet())
                .checkInDate(r.getCheckInDate())
                .checkOutDate(r.getCheckOutDate())
                .status(r.getStatus() != null ? r.getStatus() : ReservationStatus.PENDING)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
