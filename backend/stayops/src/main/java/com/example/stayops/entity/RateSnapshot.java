package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "rate_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"reservation"})
@EqualsAndHashCode(exclude = {"reservation"})
public class RateSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(length = 50)
    private String ratePlanCode;  // Reference to rate plan used

    @Column(length = 100)
    private String ratePlanName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRatePerNight;

    @Column(precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal serviceFeeAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 3)
    private String currency;

    private Integer numberOfNights;

    @Column(length = 100)
    private String promoCode;

    @Column(precision = 5, scale = 2)
    private BigDecimal taxRate;  // Tax percentage

    // Cancellation policy snapshot
    @Column(length = 50)
    private String cancellationPolicyCode;

    @Column(length = 1000)
    private String cancellationPolicyText;

    private LocalDate freeCancellationUntil;

    @Column(precision = 10, scale = 2)
    private BigDecimal cancellationFee;

    // Per-night breakdown stored as JSON or separate table if needed
    @Column(columnDefinition = "TEXT")
    private String perNightBreakdown;  // JSON format: [{date, rate, taxes}, ...]

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    private Instant createdAt;
}