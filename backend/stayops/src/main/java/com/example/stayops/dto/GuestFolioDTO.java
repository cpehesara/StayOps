package com.example.stayops.dto;

import com.example.stayops.enums.FolioStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestFolioDTO {

    private Long id;
    private String folioNumber;
    private Long reservationId;
    private String guestId;  // Added field
    private String guestName;  // Added field
    private FolioStatus status;
    private List<FolioLineItemDTO> lineItems;
    private BigDecimal totalCharges;
    private BigDecimal totalPayments;
    private BigDecimal balance;
    private String currency;
    private BigDecimal depositAmount;
    private BigDecimal incidentalDeposit;
    private Instant settledAt;
    private Instant closedAt;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}