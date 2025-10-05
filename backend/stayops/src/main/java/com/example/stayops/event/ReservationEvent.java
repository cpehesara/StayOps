package com.example.stayops.event;

import com.example.stayops.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationEvent {
    private Long reservationId;
    private String guestId;
    private ReservationStatus previousStatus;
    private ReservationStatus newStatus;
    private String eventType; // CREATED, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
    private Instant eventTime;
    private String triggeredBy;
}