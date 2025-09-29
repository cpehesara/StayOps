package com.example.stayops.entity;

import com.example.stayops.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "reservation_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    private ReservationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    private ReservationStatus newStatus;

    private String changedBy; // staff username/system

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    private Instant changedAt;
}
