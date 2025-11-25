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
public class OccupancyStatsDTO {
    private LocalDate date;
    private Integer totalRooms;
    private Integer occupiedRooms;
    private Integer availableRooms;
    private Integer reservedRooms;
    private Double occupancyRate;
    private Integer totalGuests;
}