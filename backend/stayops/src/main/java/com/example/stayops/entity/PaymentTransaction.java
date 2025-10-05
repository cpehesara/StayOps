package com.example.stayops.entity;

import com.example.stayops.enums.PaymentMethod;
import com.example.stayops.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_payment_transaction_id", columnList = "providerTransactionId"),
        @Index(name = "idx_payment_idempotency", columnList = "idempotencyKey"),
        @Index(name = "idx_payment_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"reservation"})
@EqualsAndHashCode(exclude = {"reservation"})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false, unique = true, length = 100)
    private String idempotencyKey;  // Prevent duplicate transactions

    @Column(length = 100)
    private String providerTransactionId;  // Payment gateway transaction ID

    @Column(length = 100)
    private String paymentIntentId;  // Payment intent/session ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency;  // ISO currency code (USD, EUR, etc.)

    @Column(length = 20)
    private String cardLast4;  // Masked card number (last 4 digits)

    @Column(length = 50)
    private String cardBrand;  // Visa, Mastercard, etc.

    @Column(length = 100)
    private String cardToken;  // Tokenized card for future use

    @Column(length = 500)
    private String failureReason;

    @Column(length = 1000)
    private String webhookPayload;  // Store webhook data for debugging

    private Instant processedAt;

    @Column(length = 50)
    private String processedBy;  // Staff or system identifier

    @Column(length = 500)
    private String notes;

    // Refund related fields
    private Boolean isRefund;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refund_of_transaction_id")
    private PaymentTransaction refundOfTransaction;  // Link to original transaction if this is a refund

    @Column(precision = 10, scale = 2)
    private BigDecimal refundedAmount;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}