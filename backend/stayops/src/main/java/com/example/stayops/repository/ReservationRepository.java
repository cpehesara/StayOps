package com.example.stayops.repository;

import com.example.stayops.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

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
}