package com.example.stayops.repository;

import com.example.stayops.entity.RatePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RatePlanRepository extends JpaRepository<RatePlan, Long> {

    Optional<RatePlan> findByRatePlanCode(String ratePlanCode);

    List<RatePlan> findByHotelIdAndIsActive(Long hotelId, Boolean isActive);

    Optional<RatePlan> findByPromoCode(String promoCode);

    // Find applicable rate plans for a date range and room type
    @Query("SELECT r FROM RatePlan r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.isActive = true " +
            "AND (r.roomType IS NULL OR r.roomType = :roomType) " +
            "AND (r.validFrom IS NULL OR r.validFrom <= :checkInDate) " +
            "AND (r.validUntil IS NULL OR r.validUntil >= :checkOutDate) " +
            "ORDER BY r.priority ASC")
    List<RatePlan> findApplicableRatePlans(
            @Param("hotelId") Long hotelId,
            @Param("roomType") String roomType,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    // Find rate plan by promo code for specific dates
    @Query("SELECT r FROM RatePlan r " +
            "WHERE r.promoCode = :promoCode " +
            "AND r.isActive = true " +
            "AND (r.validFrom IS NULL OR r.validFrom <= :date) " +
            "AND (r.validUntil IS NULL OR r.validUntil >= :date)")
    Optional<RatePlan> findByPromoCodeAndDate(
            @Param("promoCode") String promoCode,
            @Param("date") LocalDate date
    );

    // Find channel-specific rates
    List<RatePlan> findByChannelCodeAndIsActive(String channelCode, Boolean isActive);
}