package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationStatusDTO {
    private Long roomId;
    private String roomNumber;
    private Long reservationId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String status;
}
