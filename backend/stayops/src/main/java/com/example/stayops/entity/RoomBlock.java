package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room_blocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hotel", "reservations"})
@EqualsAndHashCode(exclude = {"hotel", "reservations"})
public class RoomBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false, unique = true, length = 50)
    private String blockCode;  // Unique identifier for the block

    @Column(nullable = false, length = 200)
    private String blockName;  // Event/group name

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer numberOfRooms;  // Total rooms in block

    private Integer roomsBooked;  // Rooms already booked from block

    @Column(length = 50)
    private String roomType;  // Specific room type or "MIXED"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal groupRate;  // Special group rate per night

    @Column(length = 100)
    private String contactName;

    @Column(length = 100)
    private String contactEmail;

    @Column(length = 20)
    private String contactPhone;

    @Column(length = 100)
    private String companyName;

    // Cut-off date: when block releases unbooked rooms
    private LocalDate cutOffDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal depositAmount;

    private Boolean depositReceived;

    @Column(length = 50)
    private String ratePlanCode;  // Corporate rate plan if applicable

    @Column(length = 1000)
    private String specialRequests;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Link to individual reservations made from this block
    @OneToMany(mappedBy = "roomBlock", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Helper method to check available rooms in block
    public Integer getAvailableRooms() {
        return numberOfRooms - (roomsBooked != null ? roomsBooked : 0);
    }
}