// DailyOperationsSummaryDTO.java
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
public class DailyOperationsSummaryDTO {
    private LocalDate date;
    private Integer totalRooms;
    private Integer occupiedRooms;
    private Integer availableRooms;
    private Integer expectedArrivals;
    private Integer expectedDepartures;
    private Integer inHouseGuests;
    private Double occupancyRate;
    private Integer pendingReservations;
    private Integer confirmedReservations;
}