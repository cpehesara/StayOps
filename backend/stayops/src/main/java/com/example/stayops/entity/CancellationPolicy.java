package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cancellation_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hotel"})
@EqualsAndHashCode(exclude = {"hotel"})
public class CancellationPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false, unique = true, length = 50)
    private String policyCode;  // e.g., FLEXIBLE, MODERATE, STRICT, NON_REFUNDABLE

    @Column(nullable = false, length = 100)
    private String policyName;

    @Column(length = 1000)
    private String description;

    // Hours before check-in for free cancellation
    private Integer freeCancellationHours;  // e.g., 24, 48, 72 hours

    // Cancellation fee structure
    @Column(precision = 5, scale = 2)
    private BigDecimal cancellationFeePercentage;  // % of total booking

    @Column(precision = 10, scale = 2)
    private BigDecimal cancellationFeeFixed;  // Fixed fee amount

    // No-show policy
    @Column(precision = 5, scale = 2)
    private BigDecimal noShowFeePercentage;

    @Column(precision = 10, scale = 2)
    private BigDecimal noShowFeeFixed;

    // For tiered policies: different fees for different time windows
    @Column(columnDefinition = "TEXT")
    private String tieredRules;  // JSON: [{hoursBeforeCheckin: 48, feePercent: 0}, {hoursBeforeCheckin: 24, feePercent: 50}, ...]

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private Integer displayOrder;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}