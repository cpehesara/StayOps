package com.example.stayops.dto;

import com.example.stayops.enums.HoldStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationHoldResponseDTO {

    private Long holdId;
    private String holdToken;
    private String sessionId;
    private String guestId;
    private Set<Long> roomIds;
    private String roomType;
    private Integer numberOfRooms;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private HoldStatus status;
    private Instant expiresAt;
    private Long secondsRemaining;  // Calculated field
    private Instant createdAt;
}