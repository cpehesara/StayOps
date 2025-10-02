package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDetailsDTO {

    private Long id;  // Auto-generated ID
    private Long reservationId;  // Foreign key to reservation
    private Integer adults;
    private Integer kids;
    private String mealPlan;
    private String amenities;
    private String specialRequests;
    private String additionalNotes;
}