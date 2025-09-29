package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relation to Guest (assuming Guest entity exists)
    @OneToOne
    @JoinColumn(name = "guest_id", nullable = false, unique = true)
    private Guest guest;

    @Column(nullable = false)
    private Integer points = 0; // default 0

    private String membershipLevel; // e.g., Silver, Gold, Platinum
}
