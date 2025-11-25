package com.example.stayops.entity;

import com.example.stayops.enums.FolioStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guest_folios", indexes = {
        @Index(name = "idx_folio_number", columnList = "folioNumber"),
        @Index(name = "idx_folio_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"reservation", "lineItems"})
@EqualsAndHashCode(exclude = {"reservation", "lineItems"})
public class GuestFolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String folioNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FolioStatus status = FolioStatus.OPEN;

    @OneToMany(mappedBy = "folio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FolioLineItem> lineItems = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalCharges = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalPayments = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(length = 3)
    private String currency;

    @Column(precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal incidentalDeposit;

    private Instant settledAt;

    private Instant closedAt;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public void addLineItem(FolioLineItem item) {
        lineItems.add(item);
        item.setFolio(this);
        recalculateBalance();
    }

    public void recalculateBalance() {
        this.totalCharges = lineItems.stream()
                .filter(item -> !item.getIsVoided())
                .filter(item -> item.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(FolioLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalPayments = lineItems.stream()
                .filter(item -> !item.getIsVoided())
                .filter(item -> item.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .map(FolioLineItem::getAmount)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.balance = totalCharges.subtract(totalPayments);
    }
}