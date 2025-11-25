package com.example.stayops.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyPointsDTO {
    private Long id;
    private String guestId;
    private Integer points;
    private String membershipLevel;
}
