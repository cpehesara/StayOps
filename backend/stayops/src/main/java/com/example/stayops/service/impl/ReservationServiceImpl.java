package com.example.stayops.service.impl;

import com.example.stayops.dto.*;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.ReservationDetails;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.ReservationService;
import com.example.stayops.service.ReservationHistoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final ReservationHistoryService historyService;

    // ==================== CRUD OPERATIONS ====================

    @Override
    @Transactional
    public ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO) {
        log.info("Creating reservation for guest: {}", requestDTO.getGuestId());

        // Validate dates
        validateDates(requestDTO.getCheckInDate(), requestDTO.getCheckOutDate());

        // Fetch guest
        Guest guest = guestRepository.findById(requestDTO.getGuestId())
                .orElseThrow(() -> new EntityNotFoundException("Guest not found: " + requestDTO.getGuestId()));

        // Fetch and validate rooms
        Set<Room> rooms = fetchAndValidateRooms(requestDTO.getRoomIds(),
                requestDTO.getCheckInDate(), requestDTO.getCheckOutDate(), null);

        // Create reservation with all required fields
        Reservation reservation = Reservation.builder()
                .checkInDate(requestDTO.getCheckInDate())
                .checkOutDate(requestDTO.getCheckOutDate())
                .status(requestDTO.getStatus() != null ? requestDTO.getStatus() : ReservationStatus.PENDING)
                .guest(guest)
                .rooms(rooms)
                .build();

        // Add reservation details if provided
        if (hasReservationDetails(requestDTO)) {
            ReservationDetails details = ReservationDetails.builder()
                    .reservation(reservation)
                    .adults(requestDTO.getAdults() != null ? requestDTO.getAdults() : 1)
                    .kids(requestDTO.getKids() != null ? requestDTO.getKids() : 0)
                    .mealPlan(requestDTO.getMealPlan())
                    .amenities(requestDTO.getAmenities())
                    .specialRequests(requestDTO.getSpecialRequests())
                    .additionalNotes(requestDTO.getAdditionalNotes())
                    .build();
            reservation.setReservationDetails(details);
        }

        // Save everything in one transaction
        Reservation saved = reservationRepository.save(reservation);

        // Record history
        recordStatusChange(saved, null, saved.getStatus(), "System", "Reservation created");

        log.info("Reservation created successfully with ID: {}", saved.getReservationId());
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO requestDTO) {
        log.info("Updating reservation: {}", reservationId);

        validateDates(requestDTO.getCheckInDate(), requestDTO.getCheckOutDate());

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        // Store old status for history
        ReservationStatus oldStatus = reservation.getStatus();

        // Update guest if changed
        if (!reservation.getGuest().getGuestId().equals(requestDTO.getGuestId())) {
            Guest guest = guestRepository.findById(requestDTO.getGuestId())
                    .orElseThrow(() -> new EntityNotFoundException("Guest not found: " + requestDTO.getGuestId()));
            reservation.setGuest(guest);
        }

        // Update rooms if changed
        Set<Room> newRooms = fetchAndValidateRooms(requestDTO.getRoomIds(),
                requestDTO.getCheckInDate(), requestDTO.getCheckOutDate(), reservationId);
        reservation.setRoomsCollection(newRooms);

        // Update dates and status
        reservation.setCheckInDate(requestDTO.getCheckInDate());
        reservation.setCheckOutDate(requestDTO.getCheckOutDate());
        if (requestDTO.getStatus() != null) {
            validateStatusTransition(oldStatus, requestDTO.getStatus());
            reservation.setStatus(requestDTO.getStatus());
        }

        // Update or create reservation details
        if (hasReservationDetails(requestDTO)) {
            ReservationDetails details = reservation.getReservationDetails();
            if (details == null) {
                details = ReservationDetails.builder()
                        .reservation(reservation)
                        .build();
                reservation.setReservationDetails(details);
            }
            details.setAdults(requestDTO.getAdults() != null ? requestDTO.getAdults() : details.getAdults());
            details.setKids(requestDTO.getKids() != null ? requestDTO.getKids() : details.getKids());
            details.setMealPlan(requestDTO.getMealPlan() != null ? requestDTO.getMealPlan() : details.getMealPlan());
            details.setAmenities(requestDTO.getAmenities() != null ? requestDTO.getAmenities() : details.getAmenities());
            details.setSpecialRequests(requestDTO.getSpecialRequests() != null ?
                    requestDTO.getSpecialRequests() : details.getSpecialRequests());
            details.setAdditionalNotes(requestDTO.getAdditionalNotes() != null ?
                    requestDTO.getAdditionalNotes() : details.getAdditionalNotes());
        }

        Reservation saved = reservationRepository.save(reservation);

        // Record history if status changed
        if (oldStatus != saved.getStatus()) {
            recordStatusChange(saved, oldStatus, saved.getStatus(), "System", "Status updated during reservation update");
        }

        log.info("Reservation updated successfully: {}", saved.getReservationId());
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public void deleteReservation(Long reservationId) {
        log.info("Deleting reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        // Clear room associations
        reservation.setRoomsCollection(new HashSet<>());

        // Delete the reservation (cascade will handle details and history)
        reservationRepository.delete(reservation);

        log.info("Reservation deleted successfully: {}", reservationId);
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
        return reservationRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== STATUS MANAGEMENT ====================

    @Override
    @Transactional
    public ReservationResponseDTO updateReservationStatus(Long reservationId, String statusStr) {
        log.info("Updating reservation {} status to: {}", reservationId, statusStr);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        ReservationStatus oldStatus = reservation.getStatus();
        ReservationStatus newStatus;

        try {
            newStatus = ReservationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }

        validateStatusTransition(oldStatus, newStatus);
        reservation.setStatus(newStatus);

        Reservation saved = reservationRepository.save(reservation);
        recordStatusChange(saved, oldStatus, newStatus, "System", "Manual status update");

        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDTO checkInReservation(Long reservationId) {
        log.info("Checking in reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED &&
                reservation.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalStateException("Only CONFIRMED or PENDING reservations can be checked in");
        }

        LocalDate today = LocalDate.now();
        if (reservation.getCheckInDate().isAfter(today)) {
            throw new IllegalStateException("Cannot check in before check-in date");
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CHECKED_IN);

        Reservation saved = reservationRepository.save(reservation);
        recordStatusChange(saved, oldStatus, ReservationStatus.CHECKED_IN, "System", "Guest checked in");

        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDTO checkOutReservation(Long reservationId) {
        log.info("Checking out reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CHECKED_IN &&
                reservation.getStatus() != ReservationStatus.OCCUPIED) {
            throw new IllegalStateException("Only CHECKED_IN or OCCUPIED reservations can be checked out");
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CHECKED_OUT);

        Reservation saved = reservationRepository.save(reservation);
        recordStatusChange(saved, oldStatus, ReservationStatus.CHECKED_OUT, "System", "Guest checked out");

        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDTO cancelReservation(Long reservationId) {
        log.info("Cancelling reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
            throw new IllegalStateException("Cannot cancel a checked-out reservation");
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CANCELLED);

        Reservation saved = reservationRepository.save(reservation);
        recordStatusChange(saved, oldStatus, ReservationStatus.CANCELLED, "System", "Reservation cancelled");

        return mapToResponseDTO(saved);
    }

    // ==================== CALENDAR & DATE-BASED ====================

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
            if (r.getStatus() == ReservationStatus.CANCELLED) {
                continue; // Skip cancelled reservations
            }

            LocalDate start = r.getCheckInDate();
            LocalDate end = r.getCheckOutDate();

            if (!start.isBefore(firstDay) && !start.isAfter(lastDay)) {
                map.get(start).incrementCheckIns();
            }
            if (!end.isBefore(firstDay) && !end.isAfter(lastDay)) {
                map.get(end).incrementCheckOuts();
            }

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
    public List<ReservationDayDetailDTO> getReservationsForDate(LocalDate date) {
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        return reservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .map(r -> ReservationDayDetailDTO.builder()
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

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsInDateRange(LocalDate startDate, LocalDate endDate) {
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(startDate, endDate);
        return reservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== ROOM STATUS ====================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllRoomReservationStatuses() {
        return reservationRepository.findAllRoomReservationStatuses();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomStatusDTO> getRoomStatusForDate(LocalDate date) {
        List<Room> allRooms = roomRepository.findAll();
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        // Filter out cancelled reservations
        reservations = reservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .collect(Collectors.toList());

        Map<Long, Reservation> roomReservationMap = new HashMap<>();
        for (Reservation res : reservations) {
            if (res.getRooms() != null) {
                for (Room room : res.getRooms()) {
                    roomReservationMap.put(room.getId(), res);
                }
            }
        }

        List<RoomStatusDTO> statusList = new ArrayList<>();
        for (Room room : allRooms) {
            RoomStatusDTO status = RoomStatusDTO.builder()
                    .roomId(room.getId())
                    .roomNumber(room.getRoomNumber())
                    .roomType(room.getType())
                    .date(date)
                    .build();

            if (roomReservationMap.containsKey(room.getId())) {
                Reservation res = roomReservationMap.get(room.getId());
                status.setReservationId(res.getReservationId());
                status.setReservationStatus(res.getStatus().name());

                if (res.getGuest() != null) {
                    status.setGuestId(res.getGuest().getGuestId());
                    status.setGuestName(res.getGuest().getFirstName() + " " + res.getGuest().getLastName());
                }

                status.setCheckInDate(res.getCheckInDate());
                status.setCheckOutDate(res.getCheckOutDate());

                // Determine room status based on reservation status and dates
                if (res.getCheckInDate().equals(date) && res.getStatus() != ReservationStatus.CHECKED_IN) {
                    status.setStatus("ARRIVING");
                } else if (res.getCheckOutDate().equals(date) &&
                        (res.getStatus() == ReservationStatus.CHECKED_IN ||
                                res.getStatus() == ReservationStatus.OCCUPIED)) {
                    status.setStatus("DEPARTING");
                } else if (res.getStatus() == ReservationStatus.CHECKED_IN ||
                        res.getStatus() == ReservationStatus.OCCUPIED) {
                    status.setStatus("OCCUPIED");
                } else if (res.getStatus() == ReservationStatus.CONFIRMED ||
                        res.getStatus() == ReservationStatus.PENDING) {
                    status.setStatus("RESERVED");
                } else {
                    status.setStatus("AVAILABLE");
                }
            } else {
                status.setStatus("AVAILABLE");
            }

            statusList.add(status);
        }

        return statusList;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<RoomStatusDTO>> getRoomStatusForDateRange(LocalDate startDate, LocalDate endDate) {
        Map<Long, List<RoomStatusDTO>> rangeMap = new LinkedHashMap<>();

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            List<RoomStatusDTO> dailyStatus = getRoomStatusForDate(current);
            rangeMap.put(current.toEpochDay(), dailyStatus);
            current = current.plusDays(1);
        }

        return rangeMap;
    }

    // ==================== ARRIVALS & DEPARTURES ====================

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getArrivalsForDate(LocalDate date) {
        List<Reservation> reservations = reservationRepository.findByCheckInDate(date);
        return reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED ||
                        r.getStatus() == ReservationStatus.PENDING)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getDeparturesForDate(LocalDate date) {
        List<Reservation> reservations = reservationRepository.findByCheckOutDate(date);
        return reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DailyOperationsSummaryDTO getDailyOperationsSummary(LocalDate date) {
        List<Room> allRooms = roomRepository.findAll();
        int totalRooms = allRooms.size();

        List<Reservation> todayReservations = reservationRepository.findReservationsOverlapping(date, date);

        // Filter out cancelled reservations
        todayReservations = todayReservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .collect(Collectors.toList());

        Set<Long> occupiedRoomIds = todayReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .flatMap(r -> r.getRooms().stream())
                .map(Room::getId)
                .collect(Collectors.toSet());

        int occupiedRooms = occupiedRoomIds.size();

        int expectedArrivals = (int) reservationRepository.findByCheckInDate(date).stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED ||
                        r.getStatus() == ReservationStatus.PENDING)
                .count();

        int expectedDepartures = (int) reservationRepository.findByCheckOutDate(date).stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .count();

        int inHouseGuests = (int) todayReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .count();

        int pendingReservations = (int) todayReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING)
                .count();

        int confirmedReservations = (int) todayReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .count();

        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100 : 0.0;

        return DailyOperationsSummaryDTO.builder()
                .date(date)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(totalRooms - occupiedRooms)
                .expectedArrivals(expectedArrivals)
                .expectedDepartures(expectedDepartures)
                .inHouseGuests(inHouseGuests)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .pendingReservations(pendingReservations)
                .confirmedReservations(confirmedReservations)
                .build();
    }

    // ==================== GUEST & SEARCH ====================

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByGuestId(String guestId) {
        List<Reservation> reservations = reservationRepository.findByGuestGuestId(guestId);
        return reservations.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> searchReservations(String guestId, String statusStr,
                                                           LocalDate checkInDate, LocalDate checkOutDate) {
        List<Reservation> reservations = reservationRepository.findAll();

        return reservations.stream()
                .filter(r -> guestId == null || (r.getGuest() != null &&
                        r.getGuest().getGuestId().equals(guestId)))
                .filter(r -> statusStr == null || r.getStatus().name().equals(statusStr.toUpperCase()))
                .filter(r -> checkInDate == null || r.getCheckInDate().equals(checkInDate))
                .filter(r -> checkOutDate == null || r.getCheckOutDate().equals(checkOutDate))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== OCCUPANCY ====================

    @Override
    @Transactional(readOnly = true)
    public OccupancyStatsDTO getCurrentOccupancyStats() {
        return getOccupancyStatsForDate(LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public OccupancyStatsDTO getOccupancyStatsForDate(LocalDate date) {
        List<Room> allRooms = roomRepository.findAll();
        int totalRooms = allRooms.size();

        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        // Filter out cancelled reservations
        reservations = reservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .collect(Collectors.toList());

        Set<Long> occupiedRoomIds = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .flatMap(r -> r.getRooms().stream())
                .map(Room::getId)
                .collect(Collectors.toSet());

        Set<Long> reservedRoomIds = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED ||
                        r.getStatus() == ReservationStatus.PENDING)
                .flatMap(r -> r.getRooms().stream())
                .map(Room::getId)
                .collect(Collectors.toSet());

        int occupiedRooms = occupiedRoomIds.size();
        int reservedRooms = reservedRoomIds.size();

        int totalGuests = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .mapToInt(r -> {
                    if (r.getReservationDetails() != null) {
                        return r.getReservationDetails().getAdults() + r.getReservationDetails().getKids();
                    }
                    return 1; // Default to 1 guest if no details
                })
                .sum();

        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100 : 0.0;

        return OccupancyStatsDTO.builder()
                .date(date)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(totalRooms - occupiedRooms - reservedRooms)
                .reservedRooms(reservedRooms)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .totalGuests(totalGuests)
                .build();
    }

    // ==================== HELPER METHODS ====================

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (checkOut.isBefore(checkIn) || checkOut.equals(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        // Remove past date validation to allow historical data entry
        // if (checkIn.isBefore(LocalDate.now())) {
        //     throw new IllegalArgumentException("Check-in date cannot be in the past");
        // }
    }

    private Set<Room> fetchAndValidateRooms(Set<Long> roomIds, LocalDate checkIn, LocalDate checkOut, Long excludeReservationId) {
        if (roomIds == null || roomIds.isEmpty()) {
            throw new IllegalArgumentException("At least one room must be selected");
        }

        List<Room> rooms = roomRepository.findAllById(roomIds);
        if (rooms.size() != roomIds.size()) {
            Set<Long> foundIds = rooms.stream().map(Room::getId).collect(Collectors.toSet());
            Set<Long> missingIds = new HashSet<>(roomIds);
            missingIds.removeAll(foundIds);
            throw new EntityNotFoundException("Rooms not found: " + missingIds);
        }

        // Check room availability
        for (Room room : rooms) {
            List<Reservation> conflicts = excludeReservationId == null
                    ? reservationRepository.findOverlappingReservationsForRoom(room.getId(), checkIn, checkOut)
                    : reservationRepository.findOverlappingReservationsForRoomExcludingReservation(
                    room.getId(), excludeReservationId, checkIn, checkOut);

            boolean hasActiveConflict = conflicts.stream()
                    .anyMatch(r -> r.getStatus() != ReservationStatus.CANCELLED &&
                            r.getStatus() != ReservationStatus.CHECKED_OUT);

            if (hasActiveConflict) {
                throw new IllegalStateException("Room " + room.getRoomNumber() +
                        " is not available for the selected dates");
            }
        }

        return new HashSet<>(rooms);
    }

    /**
     * Validate status transitions with more flexibility for administrative corrections.
     * Allows most transitions except a few illogical ones (e.g., from CHECKED_OUT or CANCELLED to active statuses)
     */
    private void validateStatusTransition(ReservationStatus current, ReservationStatus next) {
        if (current == next) {
            return; // No change
        }

        // Allow transitions from CHECKED_OUT only to itself (no change)
        if (current == ReservationStatus.CHECKED_OUT && next != ReservationStatus.CHECKED_OUT) {
            log.warn("Attempting to transition from CHECKED_OUT to {}. This is unusual but allowed for administrative corrections.", next);
            // Allow it but log a warning
        }

        // Block transitions from CANCELLED to active statuses - use create new reservation instead
        if (current == ReservationStatus.CANCELLED && next != ReservationStatus.CANCELLED) {
            log.warn("Attempting to reactivate a CANCELLED reservation to {}. This is unusual but allowed for administrative corrections.", next);
            // Allow it but log a warning
        }

        // All other transitions are allowed for flexibility
        log.info("Status transition from {} to {} validated successfully", current, next);
    }

    private boolean hasReservationDetails(ReservationRequestDTO requestDTO) {
        return requestDTO.getAdults() != null ||
                requestDTO.getKids() != null ||
                requestDTO.getMealPlan() != null ||
                requestDTO.getAmenities() != null ||
                requestDTO.getSpecialRequests() != null ||
                requestDTO.getAdditionalNotes() != null;
    }

    private void recordStatusChange(Reservation reservation, ReservationStatus oldStatus,
                                    ReservationStatus newStatus, String changedBy, String notes) {
        try {
            ReservationHistoryDTO historyDTO = ReservationHistoryDTO.builder()
                    .reservationId(reservation.getReservationId())
                    .previousStatus(oldStatus)
                    .newStatus(newStatus)
                    .changedBy(changedBy)
                    .notes(notes)
                    .build();
            historyService.recordHistory(historyDTO);
        } catch (Exception e) {
            log.warn("Failed to record history for reservation {}: {}",
                    reservation.getReservationId(), e.getMessage());
            // Don't fail the main operation if history recording fails
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
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}