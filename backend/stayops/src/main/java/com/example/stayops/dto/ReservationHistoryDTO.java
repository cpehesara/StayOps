package com.example.stayops.dto;

import com.example.stayops.enums.ReservationStatus;
import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationHistoryDTO {
    private Long historyId;
    private Long reservationId;
    private ReservationStatus previousStatus;
    private ReservationStatus newStatus;
    private String changedBy;
    private String notes;
    private Instant changedAt;
}
