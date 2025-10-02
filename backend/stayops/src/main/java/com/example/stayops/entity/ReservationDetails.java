package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservation_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "reservation")
@EqualsAndHashCode(exclude = "reservation")
public class ReservationDetails {

    @Id
    @Column(name = "reservation_id")
    private Long reservationId;  // Use reservation_id as the primary key

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId  // This tells JPA to use the same value for both the PK and FK
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false)
    @Builder.Default
    private Integer adults = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer kids = 0;

    @Column(name = "meal_plan", length = 100)
    private String mealPlan;

    @Column(length = 500)
    private String amenities;

    @Column(name = "special_requests", length = 1000)
    private String specialRequests;

    @Column(name = "additional_notes", length = 1000)
    private String additionalNotes;

    // Ignore the room_id column if it exists in database but not needed
    @Transient
    private Long roomId;
}