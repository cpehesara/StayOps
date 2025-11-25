package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", referencedColumnName = "guest_id", nullable = false)
    private Guest guest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false)
    private Integer overallRating; // 1-5

    private Integer cleanlinessRating; // 1-5

    private Integer serviceRating; // 1-5

    private Integer amenitiesRating; // 1-5

    private Integer valueRating; // 1-5

    private Integer locationRating; // 1-5

    @Column(length = 2000)
    private String comment;

    @Column(length = 500)
    private String highlights; // What guest liked most

    @Column(length = 500)
    private String improvements; // What could be better

    @Column(nullable = false)
    private Boolean isVerified = false; // Verified stay

    @Column(nullable = false)
    private Boolean isPublished = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}