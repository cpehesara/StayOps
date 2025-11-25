package com.example.stayops.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String type;
    private int capacity;
    private Double pricePerNight;
    private String availabilityStatus;
    private String floorNumber;
    private String description;
    private Long hotelId; // Flatten relation
}
