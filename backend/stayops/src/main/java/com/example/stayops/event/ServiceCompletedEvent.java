package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Event triggered when a service request is completed
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCompletedEvent {
    private Long reservationId;
    private Long serviceRequestId;
    private String serviceType;
    private BigDecimal amount;
    private Instant eventTime;
}