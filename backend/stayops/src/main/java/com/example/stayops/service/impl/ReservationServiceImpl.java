package com.example.stayops.service.impl;

import com.example.stayops.dto.*;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.ReservationDetails;
import com.example.stayops.entity.ReservationHistory;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.exception.ValidationException;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.ReservationDetailsRepository;
import com.example.stayops.repository.ReservationHistoryRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final ReservationDetailsRepository reservationDetailsRepository;
    private final ReservationHistoryRepository reservationHistoryRepository;

    // ==================== CRUD OPERATIONS ====================

    @Override
    public ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO) {
        log.info("Creating new reservation for guest: {}", requestDTO.getGuestId());

        // Validate dates
        validateDates(requestDTO.getCheckInDate(), requestDTO.getCheckOutDate());

        // Find guest
        Guest guest = guestRepository.findByGuestId(requestDTO.getGuestId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with ID: " + requestDTO.getGuestId()));

        // Find and validate rooms
        List<Room> rooms = validateAndGetRooms(requestDTO.getRoomIds());

        // Check room availability
        checkRoomAvailability(rooms, requestDTO.getCheckInDate(), requestDTO.getCheckOutDate(), null);

        // Create reservation
        Reservation reservation = new Reservation();
        reservation.setGuest(guest);

        // Use the proper method to set rooms with bidirectional relationship
        reservation.setRooms(new HashSet<>(rooms));

        reservation.setCheckInDate(requestDTO.getCheckInDate());
        reservation.setCheckOutDate(requestDTO.getCheckOutDate());

        // Use status from DTO if provided, otherwise default to CONFIRMED
        if (requestDTO.getStatus() != null) {
            reservation.setStatus(requestDTO.getStatus());
        } else {
            reservation.setStatus(ReservationStatus.CONFIRMED);
        }

        // Save reservation first to get the ID
        Reservation savedReservation = reservationRepository.save(reservation);

        // Create reservation details
        createReservationDetails(savedReservation, requestDTO);

        // Add history entry
        addHistoryEntry(savedReservation, "Reservation created", null, savedReservation.getStatus());

        log.info("Reservation created successfully with ID: {}", savedReservation.getReservationId());
        return mapToResponseDTO(savedReservation);
    }

    @Override
    public ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO requestDTO) {
        log.info("Updating reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        // Validate dates
        validateDates(requestDTO.getCheckInDate(), requestDTO.getCheckOutDate());

        // Find and validate rooms
        List<Room> rooms = validateAndGetRooms(requestDTO.getRoomIds());

        // Check room availability (excluding current reservation)
        checkRoomAvailability(rooms, requestDTO.getCheckInDate(), requestDTO.getCheckOutDate(), reservationId);

        // Update reservation fields
        ReservationStatus oldStatus = reservation.getStatus();

        // Update rooms collection
        reservation.setRooms(new HashSet<>(rooms));

        reservation.setCheckInDate(requestDTO.getCheckInDate());
        reservation.setCheckOutDate(requestDTO.getCheckOutDate());

        // Update status if provided
        if (requestDTO.getStatus() != null) {
            reservation.setStatus(requestDTO.getStatus());
        }

        // Save updated reservation
        Reservation updatedReservation = reservationRepository.save(reservation);

        // Update reservation details
        updateReservationDetails(updatedReservation, requestDTO);

        // Add history entry
        addHistoryEntry(updatedReservation, "Reservation updated", oldStatus, reservation.getStatus());

        log.info("Reservation updated successfully: {}", reservationId);
        return mapToResponseDTO(updatedReservation);
    }

    @Override
    public void deleteReservation(Long reservationId) {
        log.info("Deleting reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        reservationRepository.delete(reservation);
        log.info("Reservation deleted successfully: {}", reservationId);
    }

    @Override
    public ReservationResponseDTO getReservationById(Long reservationId) {
        log.info("Fetching reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        return mapToResponseDTO(reservation);
    }

    @Override
    public List<ReservationResponseDTO> getAllReservations() {
        log.info("Fetching all reservations");

        List<Reservation> reservations = reservationRepository.findAll();
        return reservations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== CALENDAR & DATE-BASED ====================

    @Override
    public List<ReservationSummaryDTO> getMonthlySummary(int year, int month) {
        log.info("Fetching monthly summary for {}-{}", year, month);

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        Map<LocalDate, ReservationSummaryDTO> summaryMap = new LinkedHashMap<>();

        // Initialize all days in the month
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            ReservationSummaryDTO summary = ReservationSummaryDTO.builder()
                    .date(currentDate)
                    .checkIns(0)
                    .checkOuts(0)
                    .totalReservations(0)
                    .build();
            summaryMap.put(currentDate, summary);
            currentDate = currentDate.plusDays(1);
        }

        // Get all reservations for the month
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(startDate, endDate);

        // Count check-ins, check-outs, and total reservations per day
        for (Reservation reservation : reservations) {
            // Count check-ins
            if (!reservation.getCheckInDate().isBefore(startDate) &&
                    !reservation.getCheckInDate().isAfter(endDate)) {
                ReservationSummaryDTO summary = summaryMap.get(reservation.getCheckInDate());
                if (summary != null) {
                    summary.incrementCheckIns();
                }
            }

            // Count check-outs
            if (!reservation.getCheckOutDate().isBefore(startDate) &&
                    !reservation.getCheckOutDate().isAfter(endDate)) {
                ReservationSummaryDTO summary = summaryMap.get(reservation.getCheckOutDate());
                if (summary != null) {
                    summary.incrementCheckOuts();
                }
            }

            // Count total reservations for each day
            currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                if (!currentDate.isBefore(reservation.getCheckInDate()) &&
                        currentDate.isBefore(reservation.getCheckOutDate())) {
                    ReservationSummaryDTO summary = summaryMap.get(currentDate);
                    if (summary != null) {
                        summary.incrementTotalReservations();
                    }
                }
                currentDate = currentDate.plusDays(1);
            }
        }

        return new ArrayList<>(summaryMap.values());
    }

    @Override
    public List<ReservationDayDetailDTO> getReservationsForDate(LocalDate date) {
        log.info("Fetching reservations for date: {}", date);

        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);
        return reservations.stream()
                .map(this::mapToDayDetailDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationResponseDTO> getReservationsInDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching reservations in date range: {} to {}", startDate, endDate);

        validateDates(startDate, endDate);

        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(startDate, endDate);
        return reservations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== ROOM STATUS & AVAILABILITY ====================

    @Override
    public List<Map<String, Object>> getAllRoomReservationStatuses() {
        log.info("Fetching all room reservation statuses");

        LocalDate today = LocalDate.now();
        List<Room> allRooms = roomRepository.findAll();
        List<Reservation> todayReservations = reservationRepository.findReservationsOverlapping(today, today);

        List<Map<String, Object>> statusList = new ArrayList<>();

        for (Room room : allRooms) {
            Map<String, Object> roomStatus = new HashMap<>();
            roomStatus.put("roomId", room.getId());
            roomStatus.put("roomNumber", room.getRoomNumber());
            roomStatus.put("roomType", room.getType() != null ? room.getType() : "UNKNOWN");

            // Find if room has a reservation for today
            Optional<Reservation> activeReservation = todayReservations.stream()
                    .filter(r -> r.getRooms() != null && r.getRooms().stream()
                            .anyMatch(rm -> rm.getId().equals(room.getId())))
                    .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED ||
                            r.getStatus() == ReservationStatus.CHECKED_IN)
                    .findFirst();

            if (activeReservation.isPresent()) {
                Reservation reservation = activeReservation.get();
                roomStatus.put("status", "OCCUPIED");
                roomStatus.put("reservationId", reservation.getReservationId());
                roomStatus.put("reservationStatus", reservation.getStatus().name());

                Guest guest = reservation.getGuest();
                if (guest != null) {
                    roomStatus.put("guestId", guest.getGuestId());
                    String firstName = guest.getFirstName() != null ? guest.getFirstName() : "";
                    String lastName = guest.getLastName() != null ? guest.getLastName() : "";
                    roomStatus.put("guestName", (firstName + " " + lastName).trim());
                } else {
                    roomStatus.put("guestId", null);
                    roomStatus.put("guestName", "Unknown Guest");
                }

                roomStatus.put("checkInDate", reservation.getCheckInDate());
                roomStatus.put("checkOutDate", reservation.getCheckOutDate());
            } else {
                roomStatus.put("status", "AVAILABLE");
                roomStatus.put("reservationId", null);
                roomStatus.put("reservationStatus", null);
                roomStatus.put("guestId", null);
                roomStatus.put("guestName", null);
                roomStatus.put("checkInDate", null);
                roomStatus.put("checkOutDate", null);
            }

            statusList.add(roomStatus);
        }

        return statusList;
    }

    @Override
    public List<RoomStatusDTO> getRoomStatusForDate(LocalDate date) {
        log.info("Fetching room status for date: {}", date);

        // Get all rooms
        List<Room> allRooms = roomRepository.findAll();

        // Get all reservations for the date
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        // Build status for each room
        return allRooms.stream()
                .map(room -> buildRoomStatusDTO(room, reservations, date))
                .collect(Collectors.toList());
    }

    @Override
    public Map<Long, List<RoomStatusDTO>> getRoomStatusForDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching room status for date range: {} to {}", startDate, endDate);

        validateDates(startDate, endDate);

        Map<Long, List<RoomStatusDTO>> roomStatusMap = new HashMap<>();

        // Get all rooms
        List<Room> allRooms = roomRepository.findAll();

        // Iterate through each date in the range
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            // Get reservations for this date
            List<Reservation> reservations = reservationRepository.findReservationsOverlapping(currentDate, currentDate);

            // Build status for each room on this date
            for (Room room : allRooms) {
                RoomStatusDTO status = buildRoomStatusDTO(room, reservations, currentDate);

                // Add to map - key is roomId, value is list of statuses across dates
                roomStatusMap.computeIfAbsent(room.getId(), k -> new ArrayList<>()).add(status);
            }

            currentDate = currentDate.plusDays(1);
        }

        return roomStatusMap;
    }

    // ==================== ARRIVALS & DEPARTURES ====================

    @Override
    public List<ReservationResponseDTO> getArrivalsForDate(LocalDate date) {
        log.info("Fetching arrivals for date: {}", date);

        List<Reservation> reservations = reservationRepository.findByCheckInDate(date);
        return reservations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationResponseDTO> getDeparturesForDate(LocalDate date) {
        log.info("Fetching departures for date: {}", date);

        List<Reservation> reservations = reservationRepository.findByCheckOutDate(date);
        return reservations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DailyOperationsSummaryDTO getDailyOperationsSummary(LocalDate date) {
        log.info("Fetching daily operations summary for date: {}", date);

        // Get all rooms
        List<Room> allRooms = roomRepository.findAll();
        int totalRooms = allRooms.size();

        // Get reservations for the date
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        // Get arrivals and departures
        List<Reservation> arrivals = reservationRepository.findByCheckInDate(date);
        List<Reservation> departures = reservationRepository.findByCheckOutDate(date);

        // Count occupied rooms and guests
        Set<Long> occupiedRoomIds = new HashSet<>();
        int inHouseGuests = 0;
        int pendingCount = 0;
        int confirmedCount = 0;

        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
                if (reservation.getRooms() != null) {
                    for (Room room : reservation.getRooms()) {
                        occupiedRoomIds.add(room.getId());
                    }
                }
                // Count guests
                if (reservation.getReservationDetails() != null) {
                    ReservationDetails details = reservation.getReservationDetails();
                    inHouseGuests += (details.getAdults() != null ? details.getAdults() : 0) +
                            (details.getKids() != null ? details.getKids() : 0);
                }
            }

            // Count by status
            if (reservation.getStatus() == ReservationStatus.PENDING) {
                pendingCount++;
            } else if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
                confirmedCount++;
            }
        }

        int occupiedRooms = occupiedRoomIds.size();
        int availableRooms = totalRooms - occupiedRooms;
        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100 : 0.0;

        return DailyOperationsSummaryDTO.builder()
                .date(date)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(availableRooms)
                .expectedArrivals(arrivals.size())
                .expectedDepartures(departures.size())
                .inHouseGuests(inHouseGuests)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .pendingReservations(pendingCount)
                .confirmedReservations(confirmedCount)
                .build();
    }

    // ==================== STATUS MANAGEMENT ====================

    @Override
    public ReservationResponseDTO updateReservationStatus(Long reservationId, String status) {
        log.info("Updating reservation {} status to: {}", reservationId, status);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        // Parse and validate status
        ReservationStatus newStatus;
        try {
            newStatus = ReservationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid status: " + status + ". Valid statuses are: " +
                    Arrays.toString(ReservationStatus.values()));
        }

        // Validate status transition
        validateStatusTransition(reservation.getStatus(), newStatus);

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(newStatus);

        Reservation updatedReservation = reservationRepository.save(reservation);

        // Add history entry
        addHistoryEntry(updatedReservation, "Status changed from " + oldStatus + " to " + newStatus,
                oldStatus, newStatus);

        log.info("Reservation {} status updated successfully", reservationId);
        return mapToResponseDTO(updatedReservation);
    }

    @Override
    public ReservationResponseDTO checkInReservation(Long reservationId) {
        log.info("Checking in reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED &&
                reservation.getStatus() != ReservationStatus.PENDING) {
            throw new ValidationException("Only confirmed or pending reservations can be checked in. Current status: " +
                    reservation.getStatus());
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CHECKED_IN);

        Reservation updatedReservation = reservationRepository.save(reservation);

        // Add history entry
        addHistoryEntry(updatedReservation, "Guest checked in", oldStatus, ReservationStatus.CHECKED_IN);

        log.info("Reservation {} checked in successfully", reservationId);
        return mapToResponseDTO(updatedReservation);
    }

    @Override
    public ReservationResponseDTO checkOutReservation(Long reservationId) {
        log.info("Checking out reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new ValidationException("Only checked-in reservations can be checked out. Current status: " +
                    reservation.getStatus());
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CHECKED_OUT);

        Reservation updatedReservation = reservationRepository.save(reservation);

        // Add history entry
        addHistoryEntry(updatedReservation, "Guest checked out", oldStatus, ReservationStatus.CHECKED_OUT);

        log.info("Reservation {} checked out successfully", reservationId);
        return mapToResponseDTO(updatedReservation);
    }

    @Override
    public ReservationResponseDTO cancelReservation(Long reservationId) {
        log.info("Cancelling reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
            throw new ValidationException("Cannot cancel a checked-out reservation");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ValidationException("Reservation is already cancelled");
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CANCELLED);

        Reservation updatedReservation = reservationRepository.save(reservation);

        // Add history entry
        addHistoryEntry(updatedReservation, "Reservation cancelled", oldStatus, ReservationStatus.CANCELLED);

        log.info("Reservation {} cancelled successfully", reservationId);
        return mapToResponseDTO(updatedReservation);
    }

    // ==================== GUEST & SEARCH ====================

    @Override
    public List<ReservationResponseDTO> getReservationsByGuestId(String guestId) {
        log.info("Fetching reservations for guest: {}", guestId);

        List<Reservation> reservations = reservationRepository.findByGuestGuestId(guestId);
        return reservations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationResponseDTO> searchReservations(String guestId, String status,
                                                           LocalDate checkInDate, LocalDate checkOutDate) {
        log.info("Searching reservations with filters - guestId: {}, status: {}, checkIn: {}, checkOut: {}",
                guestId, status, checkInDate, checkOutDate);

        List<Reservation> reservations = reservationRepository.findAll();

        return reservations.stream()
                .filter(r -> guestId == null || guestId.trim().isEmpty() ||
                        (r.getGuest() != null && r.getGuest().getGuestId().equals(guestId)))
                .filter(r -> status == null || status.trim().isEmpty() ||
                        r.getStatus().name().equalsIgnoreCase(status))
                .filter(r -> checkInDate == null || !r.getCheckInDate().isBefore(checkInDate))
                .filter(r -> checkOutDate == null || !r.getCheckOutDate().isAfter(checkOutDate))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== OCCUPANCY ====================

    @Override
    public OccupancyStatsDTO getCurrentOccupancyStats() {
        log.info("Fetching current occupancy stats");
        return getOccupancyStatsForDate(LocalDate.now());
    }

    @Override
    public OccupancyStatsDTO getOccupancyStatsForDate(LocalDate date) {
        log.info("Fetching occupancy stats for date: {}", date);

        // Get all rooms
        List<Room> allRooms = roomRepository.findAll();
        int totalRooms = allRooms.size();

        if (totalRooms == 0) {
            OccupancyStatsDTO stats = new OccupancyStatsDTO();
            stats.setDate(date);
            stats.setTotalRooms(0);
            stats.setOccupiedRooms(0);
            stats.setAvailableRooms(0);
            stats.setReservedRooms(0);
            stats.setOccupancyRate(0.0);
            stats.setTotalGuests(0);
            return stats;
        }

        // Get reservations for the date
        List<Reservation> reservations = reservationRepository.findReservationsOverlapping(date, date);

        // Count occupied rooms (only confirmed and checked-in reservations)
        Set<Long> occupiedRoomIds = new HashSet<>();
        Set<Long> reservedRoomIds = new HashSet<>();
        int totalGuests = 0;

        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
                if (reservation.getRooms() != null) {
                    for (Room room : reservation.getRooms()) {
                        occupiedRoomIds.add(room.getId());
                    }
                }
                // Count guests
                if (reservation.getReservationDetails() != null) {
                    ReservationDetails details = reservation.getReservationDetails();
                    totalGuests += (details.getAdults() != null ? details.getAdults() : 0) +
                            (details.getKids() != null ? details.getKids() : 0);
                }
            } else if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
                if (reservation.getRooms() != null) {
                    for (Room room : reservation.getRooms()) {
                        reservedRoomIds.add(room.getId());
                    }
                }
            }
        }

        int occupiedRooms = occupiedRoomIds.size();
        int reservedRooms = reservedRoomIds.size();
        int availableRooms = totalRooms - occupiedRooms - reservedRooms;
        double occupancyRate = (double) occupiedRooms / totalRooms * 100;

        OccupancyStatsDTO stats = new OccupancyStatsDTO();
        stats.setDate(date);
        stats.setTotalRooms(totalRooms);
        stats.setOccupiedRooms(occupiedRooms);
        stats.setAvailableRooms(availableRooms);
        stats.setReservedRooms(reservedRooms);
        stats.setOccupancyRate(Math.round(occupancyRate * 100.0) / 100.0);
        stats.setTotalGuests(totalGuests);

        return stats;
    }

    // ==================== HELPER METHODS ====================

    private void validateDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            throw new ValidationException("Check-in and check-out dates are required");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.equals(checkInDate)) {
            throw new ValidationException("Check-out date must be after check-in date");
        }
    }

    private List<Room> validateAndGetRooms(Set<Long> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) {
            throw new ValidationException("At least one room must be selected");
        }

        List<Room> rooms = roomRepository.findAllById(roomIds);
        if (rooms.size() != roomIds.size()) {
            throw new ResourceNotFoundException("One or more rooms not found");
        }

        return rooms;
    }

    private void checkRoomAvailability(List<Room> rooms, LocalDate checkInDate,
                                       LocalDate checkOutDate, Long excludeReservationId) {
        for (Room room : rooms) {
            List<Reservation> overlappingReservations;

            if (excludeReservationId != null) {
                overlappingReservations = reservationRepository
                        .findOverlappingReservationsForRoomExcludingReservation(
                                room.getId(), excludeReservationId, checkInDate, checkOutDate);
            } else {
                overlappingReservations = reservationRepository
                        .findOverlappingReservationsForRoom(room.getId(), checkInDate, checkOutDate);
            }

            // Filter out cancelled reservations
            overlappingReservations = overlappingReservations.stream()
                    .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                    .collect(Collectors.toList());

            if (!overlappingReservations.isEmpty()) {
                throw new ValidationException("Room " + room.getRoomNumber() +
                        " is not available for the selected dates");
            }
        }
    }

    private void validateStatusTransition(ReservationStatus currentStatus, ReservationStatus newStatus) {
        // Define valid status transitions
        if (currentStatus == ReservationStatus.CHECKED_OUT && newStatus != ReservationStatus.CHECKED_OUT) {
            throw new ValidationException("Cannot change status of a checked-out reservation");
        }

        if (currentStatus == ReservationStatus.CANCELLED && newStatus != ReservationStatus.CANCELLED) {
            throw new ValidationException("Cannot change status of a cancelled reservation");
        }

        // Add more validation rules as needed
    }

    /**
     * FIXED: Create reservation details with proper default values
     * This ensures NOT NULL constraints are satisfied
     *
     * CRITICAL: When using @MapsId, do NOT manually set the ID.
     * JPA will derive it from the parent Reservation entity.
     */
    private void createReservationDetails(Reservation reservation, ReservationRequestDTO requestDTO) {
        try {
            ReservationDetails details = new ReservationDetails();

            // CRITICAL: With @MapsId, set the relationship ONLY - do NOT set reservationId manually
            // JPA will automatically derive the ID from the Reservation entity
            details.setReservation(reservation);

            // CRITICAL FIX: Set default values to satisfy NOT NULL constraints
            // Always set adults and kids, using defaults if not provided
            details.setAdults(requestDTO.getAdults() != null ? requestDTO.getAdults() : 1);
            details.setKids(requestDTO.getKids() != null ? requestDTO.getKids() : 0);

            // Set optional fields
            if (requestDTO.getMealPlan() != null) {
                details.setMealPlan(requestDTO.getMealPlan());
            }
            if (requestDTO.getAmenities() != null) {
                details.setAmenities(requestDTO.getAmenities());
            }
            if (requestDTO.getSpecialRequests() != null) {
                details.setSpecialRequests(requestDTO.getSpecialRequests());
            }
            if (requestDTO.getAdditionalNotes() != null) {
                details.setAdditionalNotes(requestDTO.getAdditionalNotes());
            }

            reservationDetailsRepository.save(details);

        } catch (Exception e) {
            log.error("Error creating reservation details: {}", e.getMessage(), e);
            // Re-throw exception to ensure proper transaction rollback
            throw new RuntimeException("Failed to create reservation details: " + e.getMessage(), e);
        }
    }

    /**
     * FIXED: Update reservation details with proper null handling
     * Ensures NOT NULL constraints are always satisfied
     *
     * CRITICAL: When using @MapsId, do NOT manually set the ID.
     * JPA will derive it from the parent Reservation entity.
     */
    private void updateReservationDetails(Reservation reservation, ReservationRequestDTO requestDTO) {
        try {
            ReservationDetails details = reservationDetailsRepository.findById(reservation.getReservationId())
                    .orElseGet(() -> {
                        ReservationDetails newDetails = new ReservationDetails();

                        // CRITICAL: With @MapsId, set the relationship ONLY - do NOT set reservationId manually
                        // JPA will automatically derive the ID from the Reservation entity
                        newDetails.setReservation(reservation);

                        // CRITICAL FIX: Set defaults for new record
                        newDetails.setAdults(1);
                        newDetails.setKids(0);
                        return newDetails;
                    });

            // Update fields - ensure NOT NULL fields always have values
            if (requestDTO.getAdults() != null) {
                details.setAdults(requestDTO.getAdults());
            } else if (details.getAdults() == null) {
                // Safety check: ensure defaults if somehow null
                details.setAdults(1);
            }

            if (requestDTO.getKids() != null) {
                details.setKids(requestDTO.getKids());
            } else if (details.getKids() == null) {
                // Safety check: ensure defaults if somehow null
                details.setKids(0);
            }

            // Update optional fields
            if (requestDTO.getMealPlan() != null) {
                details.setMealPlan(requestDTO.getMealPlan());
            }
            if (requestDTO.getAmenities() != null) {
                details.setAmenities(requestDTO.getAmenities());
            }
            if (requestDTO.getSpecialRequests() != null) {
                details.setSpecialRequests(requestDTO.getSpecialRequests());
            }
            if (requestDTO.getAdditionalNotes() != null) {
                details.setAdditionalNotes(requestDTO.getAdditionalNotes());
            }

            reservationDetailsRepository.save(details);

        } catch (Exception e) {
            log.error("Error updating reservation details: {}", e.getMessage(), e);
            // Re-throw exception to ensure proper transaction rollback
            throw new RuntimeException("Failed to update reservation details: " + e.getMessage(), e);
        }
    }

    private void addHistoryEntry(Reservation reservation, String changeDescription,
                                 ReservationStatus oldStatus, ReservationStatus newStatus) {
        try {
            ReservationHistory history = new ReservationHistory();
            history.setReservation(reservation);
            history.setNotes(changeDescription);
            history.setPreviousStatus(oldStatus);
            history.setNewStatus(newStatus);
            history.setChangedBy("SYSTEM"); // TODO: Get actual user from security context

            reservationHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Error adding history entry: {}", e.getMessage(), e);
            // Don't throw exception - history is supplementary
        }
    }

    private RoomStatusDTO buildRoomStatusDTO(Room room, List<Reservation> reservations, LocalDate date) {
        RoomStatusDTO dto = new RoomStatusDTO();
        dto.setRoomId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setDate(date);

        // Room.type is a String, not an enum
        dto.setRoomType(room.getType() != null ? room.getType() : "UNKNOWN");

        // Find if room has a reservation for this date
        Optional<Reservation> activeReservation = reservations.stream()
                .filter(r -> r.getRooms() != null && r.getRooms().stream().anyMatch(rm -> rm.getId().equals(room.getId())))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED ||
                        r.getStatus() == ReservationStatus.CHECKED_IN)
                .findFirst();

        if (activeReservation.isPresent()) {
            Reservation reservation = activeReservation.get();
            dto.setStatus("OCCUPIED");
            dto.setReservationId(reservation.getReservationId());
            dto.setReservationStatus(reservation.getStatus().name());

            Guest guest = reservation.getGuest();
            if (guest != null) {
                dto.setGuestId(guest.getGuestId());
                String firstName = guest.getFirstName() != null ? guest.getFirstName() : "";
                String lastName = guest.getLastName() != null ? guest.getLastName() : "";
                dto.setGuestName((firstName + " " + lastName).trim());
            } else {
                dto.setGuestId(null);
                dto.setGuestName("Unknown Guest");
            }

            dto.setCheckInDate(reservation.getCheckInDate());
            dto.setCheckOutDate(reservation.getCheckOutDate());
        } else {
            dto.setStatus("AVAILABLE");
            dto.setReservationId(null);
            dto.setReservationStatus(null);
            dto.setGuestId(null);
            dto.setGuestName(null);
            dto.setCheckInDate(null);
            dto.setCheckOutDate(null);
        }

        return dto;
    }

    private ReservationResponseDTO mapToResponseDTO(Reservation reservation) {
        ReservationResponseDTO dto = new ReservationResponseDTO();
        dto.setReservationId(reservation.getReservationId());

        // Set guestId
        Guest guest = reservation.getGuest();
        if (guest != null) {
            dto.setGuestId(guest.getGuestId());
        } else {
            dto.setGuestId(null);
        }

        // Convert Set<Room> to Set<Long> for roomIds
        if (reservation.getRooms() != null && !reservation.getRooms().isEmpty()) {
            Set<Long> roomIds = reservation.getRooms().stream()
                    .map(Room::getId)
                    .collect(Collectors.toSet());
            dto.setRoomIds(roomIds);
        } else {
            dto.setRoomIds(new HashSet<>());
        }

        dto.setCheckInDate(reservation.getCheckInDate());
        dto.setCheckOutDate(reservation.getCheckOutDate());
        dto.setStatus(reservation.getStatus());
        dto.setCreatedAt(reservation.getCreatedAt());
        dto.setUpdatedAt(reservation.getUpdatedAt());

        return dto;
    }

    private ReservationDayDetailDTO mapToDayDetailDTO(Reservation reservation) {
        ReservationDayDetailDTO dto = new ReservationDayDetailDTO();
        dto.setReservationId(reservation.getReservationId());

        // Set guestId
        Guest guest = reservation.getGuest();
        if (guest != null) {
            dto.setGuestId(guest.getGuestId());
        } else {
            dto.setGuestId(null);
        }

        // Convert Set<Room> to Set<Long> for roomIds
        if (reservation.getRooms() != null && !reservation.getRooms().isEmpty()) {
            Set<Long> roomIds = reservation.getRooms().stream()
                    .map(Room::getId)
                    .collect(Collectors.toSet());
            dto.setRoomIds(roomIds);
        } else {
            dto.setRoomIds(new HashSet<>());
        }

        dto.setCheckInDate(reservation.getCheckInDate());
        dto.setCheckOutDate(reservation.getCheckOutDate());
        dto.setStatus(reservation.getStatus());

        return dto;
    }
}