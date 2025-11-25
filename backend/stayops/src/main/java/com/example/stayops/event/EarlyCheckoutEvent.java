package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Event triggered when a guest checks out early
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarlyCheckoutEvent {
    private Long reservationId;
    private LocalDate originalCheckoutDate;
    private LocalDate actualCheckoutDate;
    private Instant eventTime;
}