// RoomStatusDTO.java
package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStatusDTO {
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private LocalDate date;
    private String status; // AVAILABLE, OCCUPIED, RESERVED, DEPARTING, ARRIVING, MAINTENANCE
    private Long reservationId;
    private String guestId;
    private String guestName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String reservationStatus;
}