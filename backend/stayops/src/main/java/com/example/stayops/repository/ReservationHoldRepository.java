package com.example.stayops.repository;

import com.example.stayops.entity.ReservationHold;
import com.example.stayops.enums.HoldStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationHoldRepository extends JpaRepository<ReservationHold, Long> {

    Optional<ReservationHold> findByHoldToken(String holdToken);

    List<ReservationHold> findBySessionId(String sessionId);

    List<ReservationHold> findByStatus(HoldStatus status);

    // Find expired active holds
    @Query("SELECT h FROM ReservationHold h WHERE h.status = 'ACTIVE' AND h.expiresAt < :currentTime")
    List<ReservationHold> findExpiredActiveHolds(@Param("currentTime") Instant currentTime);

    // Find holds overlapping with a date range for a specific room
    @Query("SELECT h FROM ReservationHold h " +
            "JOIN h.rooms r " +
            "WHERE r.id = :roomId " +
            "AND h.status = 'ACTIVE' " +
            "AND h.checkInDate < :checkOutDate " +
            "AND h.checkOutDate > :checkInDate")
    List<ReservationHold> findActiveHoldsForRoom(
            @Param("roomId") Long roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    // Find active holds by guest
    List<ReservationHold> findByGuestGuestIdAndStatus(String guestId, HoldStatus status);

    // Find holds that will expire soon (for notifications)
    @Query("SELECT h FROM ReservationHold h " +
            "WHERE h.status = 'ACTIVE' " +
            "AND h.expiresAt BETWEEN :now AND :threshold")
    List<ReservationHold> findHoldsExpiringSoon(
            @Param("now") Instant now,
            @Param("threshold") Instant threshold
    );
}