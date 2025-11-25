package com.example.stayops.repository;

import com.example.stayops.entity.GuestFolio;
import com.example.stayops.enums.FolioStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface GuestFolioRepository extends JpaRepository<GuestFolio, Long> {

    Optional<GuestFolio> findByFolioNumber(String folioNumber);

    Optional<GuestFolio> findByReservationReservationId(Long reservationId);

    List<GuestFolio> findByStatus(FolioStatus status);

    /**
     * Find folios with outstanding balance (greater than 0)
     */
    @Query("SELECT f FROM GuestFolio f WHERE f.balance > :minBalance AND f.status = 'OPEN'")
    List<GuestFolio> findFoliosWithOutstandingBalance(@Param("minBalance") BigDecimal minBalance);

    /**
     * Find all open folios with any balance (for payment reminders)
     */
    @Query("SELECT f FROM GuestFolio f WHERE f.status = 'OPEN' AND f.balance > 0")
    List<GuestFolio> findOpenFoliosWithBalance();

    /**
     * Find folios ready for settlement (balance = 0 and open)
     */
    @Query("SELECT f FROM GuestFolio f WHERE f.balance = 0 AND f.status = 'OPEN'")
    List<GuestFolio> findFoliosReadyForSettlement();

    /**
     * Find open folios by hotel
     */
    @Query("SELECT DISTINCT f FROM GuestFolio f " +
            "JOIN f.reservation.rooms r " +
            "WHERE r.hotel.id = :hotelId AND f.status = 'OPEN'")
    List<GuestFolio> findOpenFoliosByHotel(@Param("hotelId") Long hotelId);
}