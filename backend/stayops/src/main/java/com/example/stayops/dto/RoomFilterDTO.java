package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomFilterDTO {
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String roomType;
    private Integer guestId;
    private boolean active;
}