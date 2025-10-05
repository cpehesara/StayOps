package com.example.stayops.dto;

import com.example.stayops.enums.PaymentMethod;
import com.example.stayops.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionDTO {

    private Long id;
    private Long reservationId;
    private String idempotencyKey;
    private String providerTransactionId;
    private String paymentIntentId;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String currency;
    private String cardLast4;
    private String cardBrand;
    private String cardToken;
    private String failureReason;
    private Instant processedAt;
    private String processedBy;
    private String notes;
    private Boolean isRefund;
    private Long refundOfTransactionId;
    private BigDecimal refundedAmount;
    private Instant createdAt;
    private Instant updatedAt;
}