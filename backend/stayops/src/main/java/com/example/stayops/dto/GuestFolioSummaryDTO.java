package com.example.stayops.dto;

import com.example.stayops.enums.FolioStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestFolioSummaryDTO {
    private Long id;
    private String folioNumber;
    private Long reservationId;
    private String guestName;
    private String guestEmail;
    private String roomNumber;
    private FolioStatus status;
    private BigDecimal totalCharges;
    private BigDecimal totalPayments;
    private BigDecimal balance;
    private String currency;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant settledAt;
}