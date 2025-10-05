package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomBlockDTO {

    private Long id;
    private Long hotelId;
    private String blockCode;
    private String blockName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfRooms;
    private Integer roomsBooked;
    private Integer availableRooms;  // Calculated field
    private String roomType;
    private BigDecimal groupRate;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String companyName;
    private LocalDate cutOffDate;
    private BigDecimal depositAmount;
    private Boolean depositReceived;
    private String ratePlanCode;
    private String specialRequests;
    private String notes;
    private Boolean isActive;
}