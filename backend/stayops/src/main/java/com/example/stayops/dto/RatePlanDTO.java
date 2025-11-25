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
public class RatePlanDTO {

    private Long id;
    private Long hotelId;
    private String ratePlanCode;
    private String name;
    private String description;
    private BigDecimal baseRate;
    private String roomType;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private Integer minAdvanceBookingDays;
    private Integer maxAdvanceBookingDays;
    private Integer minLengthOfStay;
    private Integer maxLengthOfStay;
    private BigDecimal discountPercentage;
    private String promoCode;
    private Boolean isRefundable;
    private Boolean requiresPrepayment;
    private String cancellationPolicyCode;
    private Boolean isActive;
    private Integer priority;
    private String channelCode;
}