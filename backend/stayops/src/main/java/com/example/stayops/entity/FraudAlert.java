package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "fraud_alerts", indexes = {
        @Index(name = "idx_fraud_reservation", columnList = "reservation_id"),
        @Index(name = "idx_fraud_status", columnList = "status"),
        @Index(name = "idx_fraud_severity", columnList = "severity")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(length = 50)
    private String guestEmail;

    @Column(length = 100)
    private String ipAddress;

    @Column(nullable = false, length = 50)
    private String alertType; // MULTIPLE_FAILED_CARDS, SUSPICIOUS_PATTERN, IP_MISMATCH, VELOCITY_CHECK

    @Column(nullable = false, length = 20)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, REVIEWED, CONFIRMED_FRAUD, FALSE_POSITIVE

    @Column(columnDefinition = "TEXT")
    private String details;

    private Integer riskScore; // 0-100

    @Column(length = 100)
    private String reviewedBy;

    private Instant reviewedAt;

    @Column(length = 500)
    private String reviewNotes;

    @CreationTimestamp
    private Instant createdAt;
}