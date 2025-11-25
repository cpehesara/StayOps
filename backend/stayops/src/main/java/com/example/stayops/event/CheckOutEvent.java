package com.example.stayops.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Event triggered when a guest checks out
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckOutEvent {
    private Long reservationId;
    private String guestId;
    private LocalDate checkOutDate;
    private Instant eventTime;
}