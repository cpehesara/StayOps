// ========== 2. ReservationRequestDTO.java (ENHANCED) ==========
package com.example.stayops.dto;

import com.example.stayops.enums.ReservationStatus;
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
public class ReservationRequestDTO {
    private String guestId;
    private Set<Long> roomIds;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private ReservationStatus status;

    // Additional fields for reservation details
    private Integer adults;
    private Integer kids;
    private String mealPlan;
    private String amenities;
    private String specialRequests;
    private String additionalNotes;
}