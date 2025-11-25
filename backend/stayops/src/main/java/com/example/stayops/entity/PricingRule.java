package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "pricing_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String ruleName;

    @Column(nullable = false, length = 50)
    private String ruleType; // DEMAND_BASED, SEASONAL, LAST_MINUTE, EARLY_BIRD, OCCUPANCY_BASED

    @Column(nullable = false)
    private Boolean isActive;

    private Integer priority; // Lower number = higher priority

    // Conditions
    private Integer minDaysToArrival;
    private Integer maxDaysToArrival;
    private BigDecimal minOccupancyPercent;
    private BigDecimal maxOccupancyPercent;
    private LocalDate seasonStartDate;
    private LocalDate seasonEndDate;
    private String dayOfWeek; // MONDAY, TUESDAY, etc. or ALL

    // Adjustments (LKR)
    private BigDecimal priceMultiplier; // e.g., 1.2 for 20% increase
    private BigDecimal priceAddition; // Fixed amount to add in LKR
    private BigDecimal priceReduction; // Fixed amount to reduce in LKR
    private BigDecimal minPrice; // Floor price in LKR
    private BigDecimal maxPrice; // Ceiling price in LKR

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}