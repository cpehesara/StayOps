package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDTO {
    private Long id;
    private String guestId;
    private String guestName;
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
    private Boolean isVerified;
    private Boolean isPublished;
    private LocalDateTime createdAt;
}