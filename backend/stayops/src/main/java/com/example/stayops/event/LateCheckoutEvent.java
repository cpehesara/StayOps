package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Event triggered when a guest checks out late
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LateCheckoutEvent {
    private Long reservationId;
    private int hoursLate;
    private Instant eventTime;
}