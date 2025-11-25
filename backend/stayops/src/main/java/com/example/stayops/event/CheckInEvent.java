package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Event triggered when a guest checks in
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInEvent {
    private Long reservationId;
    private String guestId;
    private LocalDate checkInDate;
    private Instant eventTime;
}