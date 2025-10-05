package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolioLineItemDTO {

    private Long id;
    private Long folioId;
    private LocalDate transactionDate;
    private String itemType;
    private String description;
    private BigDecimal amount;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String reference;
    private String postedBy;
    private String department;
    private String notes;
    private Boolean isVoided;
    private String voidedBy;
    private Instant voidedAt;
    private String voidReason;
    private Instant createdAt;
}