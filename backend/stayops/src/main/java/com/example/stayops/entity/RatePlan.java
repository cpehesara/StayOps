package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "rate_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hotel"})
@EqualsAndHashCode(exclude = {"hotel"})
public class RatePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false, length = 50)
    private String ratePlanCode;  // Unique code like PROMO2024, CORPORATE, etc.

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;  // Per night base rate

    @Column(length = 20)
    private String roomType;  // Applicable room type

    // Date validity
    private LocalDate validFrom;
    private LocalDate validUntil;

    // Booking window (how far in advance)
    private Integer minAdvanceBookingDays;
    private Integer maxAdvanceBookingDays;

    // Stay requirements
    private Integer minLengthOfStay;
    private Integer maxLengthOfStay;

    // Discounts
    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(length = 50)
    private String promoCode;

    // Refundability
    private Boolean isRefundable;
    private Boolean requiresPrepayment;

    // Cancellation policy reference
    @Column(length = 50)
    private String cancellationPolicyCode;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private Integer priority;  // For rate selection logic (lower = higher priority)

    @Column(length = 50)
    private String channelCode;  // For OTA-specific rates

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}