package com.example.stayops.entity;

import com.example.stayops.enums.ReservationStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@ToString(exclude = {"guest", "rooms", "reservationDetails", "history", "roomBlock"})
@EqualsAndHashCode(exclude = {"guest", "rooms", "reservationDetails", "history", "roomBlock"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @JsonIgnoreProperties({"qrCodeImage"})
    private Guest guest;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "room_reservations",
            joinColumns = @JoinColumn(name = "reservation_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    @JsonIgnoreProperties({"reservations", "hotel"})
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("reservation")
    private ReservationDetails reservationDetails;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("reservation")
    @Builder.Default
    private List<ReservationHistory> history = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_block_id")
    @JsonIgnoreProperties({"reservations", "hotel"})
    private RoomBlock roomBlock;

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
        if (this.rooms != null) {
            this.rooms.forEach(room -> room.getReservations().remove(this));
        }
        this.rooms = newRooms != null ? newRooms : new HashSet<>();
        this.rooms.forEach(room -> room.getReservations().add(this));
    }
}