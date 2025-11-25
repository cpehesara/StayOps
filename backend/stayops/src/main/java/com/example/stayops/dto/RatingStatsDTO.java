package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingStatsDTO {
    private Double averageOverallRating;
    private Double averageCleanlinessRating;
    private Double averageServiceRating;
    private Double averageAmenitiesRating;
    private Double averageValueRating;
    private Double averageLocationRating;
    private Long totalRatings;
}