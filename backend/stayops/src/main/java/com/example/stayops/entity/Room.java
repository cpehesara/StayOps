package com.example.stayops.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String roomNumber;

    @NotBlank
    private String type;

    @Min(1)
    private int capacity;

    private Double pricePerNight;

    @NotBlank
    private String availabilityStatus;

    private String floorNumber;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = true) // Made optional
    @JoinColumn(name = "hotel_id", nullable = true) // Made nullable
    @JsonBackReference
    private Hotel hotel;

    @ManyToMany
    @JoinTable(
            name = "room_reservations",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "reservation_id")
    )
    @JsonIgnore
    private List<Reservation> reservations;

}
