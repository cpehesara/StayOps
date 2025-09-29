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

    private Long reservationId;
    private String guestId;
    private Long roomId;
    private Integer adults;
    private Integer kids;
    private String roomType;
    private String mealPlan;
    private String specialRequests;
    private String amenities;
    private String additionalNotes;
}
