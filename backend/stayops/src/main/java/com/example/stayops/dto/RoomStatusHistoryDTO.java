package com.example.stayops.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStatusHistoryDTO {
    private Long id;
    private Long roomId;
    private String previousStatus;
    private String newStatus;
    private LocalDateTime changedAt;
}
