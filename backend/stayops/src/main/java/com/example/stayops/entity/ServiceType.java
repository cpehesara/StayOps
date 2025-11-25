package com.example.stayops.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "service_types", indexes = {
        @Index(name = "idx_service_type_code", columnList = "code")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_service_type_code", columnNames = {"code"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    @NotBlank
    @Size(max = 120)
    private String name;

    @Column(nullable = false, length = 20, unique = true)
    @NotBlank
    @Size(max = 20)
    private String code; // e.g. "ROOM_CLEAN", "LATE_CHECKOUT"

    @Column(name = "default_charge", precision = 12, scale = 2, nullable = false)
    private BigDecimal defaultCharge;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
