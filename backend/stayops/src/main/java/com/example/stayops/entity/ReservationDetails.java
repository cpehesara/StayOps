package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservation_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDetails {

    @Id
    private Long id; // same as reservationId, mapped one-to-one

    @OneToOne
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private Integer adults;
    private Integer kids;
    private String mealPlan;
    private String specialRequests;
    private String amenities;
    private String additionalNotes;
}
