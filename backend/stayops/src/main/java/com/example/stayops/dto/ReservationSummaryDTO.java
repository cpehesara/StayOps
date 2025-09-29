package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationSummaryDTO {
    private LocalDate date;
    private int checkIns;
    private int checkOuts;
    private int totalReservations;

    // Increment methods
    public void incrementCheckIns() {
        this.checkIns++;
    }

    public void incrementCheckOuts() {
        this.checkOuts++;
    }

    public void incrementTotalReservations() {
        this.totalReservations++;
    }
}
