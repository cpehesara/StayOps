package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "folio_line_items", indexes = {
        @Index(name = "idx_line_item_date", columnList = "transactionDate"),
        @Index(name = "idx_line_item_type", columnList = "itemType")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"folio"})
@EqualsAndHashCode(exclude = {"folio"})
public class FolioLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folio_id", nullable = false)
    private GuestFolio folio;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false, length = 50)
    private String itemType;  // ROOM_CHARGE, MINIBAR, LAUNDRY, PAYMENT, TAX, SERVICE_FEE, etc.

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;  // Positive for charges, negative for payments

    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 50)
    private String reference;  // Reference to service request, payment transaction, etc.

    @Column(length = 50)
    private String postedBy;  // Staff or system who posted the charge

    @Column(length = 100)
    private String department;  // FRONT_DESK, HOUSEKEEPING, F&B, etc.

    @Column(length = 500)
    private String notes;

    private Boolean isVoided;

    @Column(length = 50)
    private String voidedBy;

    private Instant voidedAt;

    @Column(length = 200)
    private String voidReason;

    @CreationTimestamp
    private Instant createdAt;
}