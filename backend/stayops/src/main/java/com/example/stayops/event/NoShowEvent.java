package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Event triggered when a guest doesn't show up for their reservation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoShowEvent {
    private Long reservationId;
    private LocalDate expectedCheckInDate;
    private Instant eventTime;
}