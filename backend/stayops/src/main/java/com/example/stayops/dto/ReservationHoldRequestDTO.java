package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationHoldRequestDTO {

    private String sessionId;
    private String guestId;
    private Set<Long> roomIds;
    private String roomType;  // Alternative: hold at room type level
    private Integer numberOfRooms;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private String notes;
    private Integer ttlMinutes;  // Time-to-live in minutes (default 15)
}