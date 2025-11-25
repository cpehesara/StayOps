package com.example.stayops.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "folio_line_items", indexes = {
        @Index(name = "idx_line_item_folio", columnList = "folio_id"),
        @Index(name = "idx_line_item_date", columnList = "transactionDate"),
        @Index(name = "idx_line_item_voided", columnList = "isVoided")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"folio"})
@EqualsAndHashCode(exclude = {"folio"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    private String itemType;  // ROOM_CHARGE, TAX, SERVICE, PAYMENT, etc.

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;  // Positive for charges, negative for payments

    @Column
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 50)
    private String reference;  // Transaction reference number

    @Column(length = 100)
    private String postedBy;  // User who posted the charge

    @Column(length = 50)
    private String department;  // Department that generated the charge

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVoided = false;

    @Column(length = 100)
    private String voidedBy;

    private Instant voidedAt;

    @Column(length = 200)
    private String voidReason;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}