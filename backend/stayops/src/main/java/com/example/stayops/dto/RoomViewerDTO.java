package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomViewerDTO {
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private Double pricePerNight;
    private String panoramaUrl;
    private List<String> galleryImages;
    private List<String> amenities;
    private String viewType;
    private Integer squareFootage;
    private String bedType;
    private Integer floorNumber;
    private String status;
    private String description;
}