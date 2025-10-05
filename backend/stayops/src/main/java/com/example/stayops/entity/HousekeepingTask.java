package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "housekeeping_tasks", indexes = {
        @Index(name = "idx_hk_status", columnList = "status"),
        @Index(name = "idx_hk_scheduled_date", columnList = "scheduledDate"),
        @Index(name = "idx_hk_room", columnList = "room_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"room", "reservation"})
@EqualsAndHashCode(exclude = {"room", "reservation"})
public class HousekeepingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false, length = 50)
    private String taskType; // PRE_ARRIVAL, CHECKOUT_CLEAN, TURNDOWN, MAINTENANCE, DEEP_CLEAN

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(nullable = false)
    private LocalDate scheduledDate;

    @Column(length = 20)
    @Builder.Default
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(length = 100)
    private String assignedTo; // Staff ID

    @Column(length = 1000)
    private String notes;

    private Instant completedAt;

    @Column(length = 100)
    private String completedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}