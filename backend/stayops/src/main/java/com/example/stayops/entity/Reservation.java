package com.example.stayops.entity;

import com.example.stayops.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"guest", "rooms", "reservationDetails", "history"})
@EqualsAndHashCode(exclude = {"guest", "rooms", "reservationDetails", "history"})
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservationId;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    // Reservation is the owning side of the many-to-many relationship
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "room_reservations",
            joinColumns = @JoinColumn(name = "reservation_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ReservationDetails reservationDetails;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReservationHistory> history = new ArrayList<>();

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Helper methods for managing bidirectional relationships
    public void addRoom(Room room) {
        this.rooms.add(room);
        room.getReservations().add(this);
    }

    public void removeRoom(Room room) {
        this.rooms.remove(room);
        room.getReservations().remove(this);
    }

    public void setRoomsCollection(Set<Room> newRooms) {
        // Clear existing relationships
        if (this.rooms != null) {
            this.rooms.forEach(room -> room.getReservations().remove(this));
        }
        this.rooms = newRooms != null ? newRooms : new HashSet<>();
        // Set new relationships
        this.rooms.forEach(room -> room.getReservations().add(this));
    }
}