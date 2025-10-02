package com.example.stayops.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hotel", "reservations"})
@EqualsAndHashCode(exclude = {"hotel", "reservations"})
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

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "hotel_id", nullable = true)
    @JsonBackReference
    private Hotel hotel;

    // Room is NOT the owning side - Reservation owns the relationship
    @ManyToMany(mappedBy = "rooms", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();
}
