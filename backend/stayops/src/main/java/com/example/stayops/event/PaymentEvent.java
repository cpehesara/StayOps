package com.example.stayops.event;

import com.example.stayops.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private Long paymentId;
    private Long reservationId;
    private PaymentStatus status;
    private BigDecimal amount;
    private String eventType; // SUCCESS, FAILED, REFUNDED, AUTHORIZED
    private Instant eventTime;
    private String providerTransactionId;
}