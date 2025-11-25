package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingRequestDTO {
    private Long reservationId;
    private Integer overallRating;
    private Integer cleanlinessRating;
    private Integer serviceRating;
    private Integer amenitiesRating;
    private Integer valueRating;
    private Integer locationRating;
    private String comment;
    private String highlights;
    private String improvements;
}