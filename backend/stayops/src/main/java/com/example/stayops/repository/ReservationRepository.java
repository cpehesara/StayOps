package com.example.stayops.repository;

import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // ==================== BASIC QUERIES ====================

    Optional<Reservation> findByReservationId(Long reservationId);

    /**
     * Find all reservations by status
     */
    List<Reservation> findByStatus(ReservationStatus status);

    // ==================== DATE OVERLAP QUERIES ====================

    /**
     * Find all reservations that overlap with a given date range
     * A reservation overlaps if its checkout is after or on the start date
     * AND its checkin is before or on the end date
     */
    @Query("SELECT r FROM Reservation r WHERE r.checkInDate <= :end AND r.checkOutDate >= :start")
    List<Reservation> findReservationsOverlapping(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * Find overlapping reservations for a specific room
     */
    @Query("SELECT r FROM Reservation r JOIN r.rooms rm WHERE rm.id = :roomId " +
            "AND r.checkInDate <= :end AND r.checkOutDate >= :start")
    List<Reservation> findOverlappingReservationsForRoom(@Param("roomId") Long roomId,
                                                         @Param("start") LocalDate start,
                                                         @Param("end") LocalDate end);

    /**
     * Find overlapping reservations for a specific room, excluding a specific reservation
     * (useful when updating an existing reservation)
     */
    @Query("SELECT r FROM Reservation r JOIN r.rooms rm WHERE rm.id = :roomId " +
            "AND r.reservationId <> :excludeId " +
            "AND r.checkInDate <= :end AND r.checkOutDate >= :start")
    List<Reservation> findOverlappingReservationsForRoomExcludingReservation(
            @Param("roomId") Long roomId,
            @Param("excludeId") Long excludeId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    // ==================== DATE-SPECIFIC QUERIES ====================

    /**
     * Find all reservations checking in on a specific date
     */
    @Query("SELECT r FROM Reservation r WHERE r.checkInDate = :date")
    List<Reservation> findByCheckInDate(@Param("date") LocalDate date);

    /**
     * Find all reservations checking out on a specific date
     */
    @Query("SELECT r FROM Reservation r WHERE r.checkOutDate = :date")
    List<Reservation> findByCheckOutDate(@Param("date") LocalDate date);

    // ==================== GUEST QUERIES ====================

    /**
     * Find all reservations for a specific guest
     */
    @Query("SELECT r FROM Reservation r WHERE r.guest.guestId = :guestId ORDER BY r.checkInDate DESC")
    List<Reservation> findByGuestGuestId(@Param("guestId") String guestId);

    // ==================== BILLING AUTOMATION QUERIES ====================

    /**
     * Find checked-in reservations for a specific date (for daily charges)
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = :status " +
            "AND r.checkInDate <= :date AND r.checkOutDate > :date")
    List<Reservation> findByStatusAndCheckInDateLessThanEqualAndCheckOutDateGreaterThan(
            @Param("status") ReservationStatus status,
            @Param("date") LocalDate date,
            @Param("date") LocalDate dateAgain);

    /**
     * Find no-show candidates (confirmed reservations past check-in date)
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' " +
            "AND r.checkInDate < CURRENT_DATE")
    List<Reservation> findNoShowCandidates();

    /**
     * Find checkouts for a specific date (for sending invoices)
     */
    @Query("SELECT r FROM Reservation r WHERE r.checkOutDate = :date " +
            "AND r.status IN ('CHECKED_IN', 'CHECKED_OUT')")
    List<Reservation> findCheckoutsForDate(@Param("date") LocalDate date);

    // ==================== ROOM STATUS QUERIES ====================

    /**
     * Get room-reservation mapping with status information
     */
    @Query("""
           SELECT new map(
               rm.id as roomId, 
               rm.roomNumber as roomNumber, 
               r.reservationId as reservationId,
               r.checkInDate as checkInDate, 
               r.checkOutDate as checkOutDate, 
               r.status as status
           )
           FROM Reservation r JOIN r.rooms rm
           """)
    List<Map<String, Object>> findAllRoomReservationStatuses();

    /**
     * Find reservations by status and check-in date range
     * Used in: ReservationAutomationService.autoReleaseUnconfirmedReservations()
     */
    List<Reservation> findByStatusAndCheckInDateBetween(
            ReservationStatus status,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find reservations by multiple statuses and check-out date before a specific date
     * Used in: ReservationAutomationService.autoCheckoutOverdueReservations()
     *         ReservationAutomationService.archiveOldReservations()
     */
    List<Reservation> findByStatusInAndCheckOutDateBefore(
            List<ReservationStatus> statuses,
            LocalDate beforeDate
    );

    /**
     * Find reservations by status and specific check-in date
     * Used in: ReservationAutomationService.autoUpdateArrivingGuests()
     *         ReservationAutomationService.sendArrivalReminders()
     */
    List<Reservation> findByStatusAndCheckInDate(
            ReservationStatus status,
            LocalDate checkInDate
    );

    /**
     * Find reservations by status and check-in date before a specific date
     * Used in: ReservationCleanupJobs.autoMarkNoShows()
     */
    List<Reservation> findByStatusAndCheckInDateBefore(
            ReservationStatus status,
            LocalDate beforeDate
    );

    /**
     * Find reservations by status and creation timestamp before a specific instant
     * Used in: ReservationCleanupJobs.autoReleaseStaleReservations()
     */
    List<Reservation> findByStatusAndCreatedAtBefore(
            ReservationStatus status,
            Instant beforeInstant
    );

    /**
     * OPTIONAL: More efficient query with JOIN FETCH to avoid N+1 queries
     * Use this if you need to access guest information in the results
     */
    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.guest " +
            "WHERE r.status = :status AND r.checkInDate = :checkInDate")
    List<Reservation> findByStatusAndCheckInDateWithGuest(
            @Param("status") ReservationStatus status,
            @Param("checkInDate") LocalDate checkInDate
    );

    /**
     * OPTIONAL: Find reservations with room assignments
     * Useful for checking which reservations have rooms assigned
     */
    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.rooms " +
            "WHERE r.status = :status AND r.checkInDate BETWEEN :startDate AND :endDate")
    List<Reservation> findByStatusAndCheckInDateBetweenWithRooms(
            @Param("status") ReservationStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * OPTIONAL: Count overdue reservations (for metrics/monitoring)
     */
    @Query("SELECT COUNT(r) FROM Reservation r " +
            "WHERE r.status IN :statuses AND r.checkOutDate < :today")
    long countOverdueReservations(
            @Param("statuses") List<ReservationStatus> statuses,
            @Param("today") LocalDate today
    );

    /**
     * OPTIONAL: Find reservations that need room assignment
     */
    @Query("SELECT r FROM Reservation r " +
            "WHERE r.status = :status AND r.rooms IS EMPTY")
    List<Reservation> findByStatusWithoutRooms(
            @Param("status") ReservationStatus status
    );
}