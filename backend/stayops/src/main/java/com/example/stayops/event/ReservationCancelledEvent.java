package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Event triggered when a reservation is cancelled
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationCancelledEvent {
    private Long reservationId;
    private String cancellationReason;
    private Instant eventTime;
}