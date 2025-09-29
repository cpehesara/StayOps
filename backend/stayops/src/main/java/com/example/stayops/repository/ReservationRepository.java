package com.example.stayops.repository;

import com.example.stayops.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.checkInDate <= :end AND r.checkOutDate >= :start")
    List<Reservation> findReservationsOverlapping(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT r FROM Reservation r JOIN r.rooms rm WHERE rm.id = :roomId AND r.checkInDate <= :end AND r.checkOutDate >= :start")
    List<Reservation> findOverlappingReservationsForRoom(@Param("roomId") Long roomId,
                                                         @Param("start") LocalDate start,
                                                         @Param("end") LocalDate end);

    @Query("SELECT r FROM Reservation r JOIN r.rooms rm WHERE rm.id = :roomId AND r.reservationId <> :excludeId AND r.checkInDate <= :end AND r.checkOutDate >= :start")
    List<Reservation> findOverlappingReservationsForRoomExcludingReservation(@Param("roomId") Long roomId,
                                                                             @Param("excludeId") Long excludeId,
                                                                             @Param("start") LocalDate start,
                                                                             @Param("end") LocalDate end);

    @Query("""
           SELECT new map(rm.id as roomId, rm.roomNumber as roomNumber, r.reservationId as reservationId,
                           r.checkInDate as checkInDate, r.checkOutDate as checkOutDate, r.status as status)
           FROM Reservation r JOIN r.rooms rm
           """)
    List<Map<String, Object>> findAllRoomReservationStatuses();
}
