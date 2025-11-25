package com.example.stayops.entity;

import com.example.stayops.enums.HoldStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "reservation_holds", indexes = {
        @Index(name = "idx_hold_expires_at", columnList = "expiresAt"),
        @Index(name = "idx_hold_status", columnList = "status"),
        @Index(name = "idx_hold_session", columnList = "sessionId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"guest", "rooms"})
@EqualsAndHashCode(exclude = {"guest", "rooms"})
public class ReservationHold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long holdId;

    @Column(nullable = false, unique = true, length = 100)
    private String holdToken;  // Idempotency token

    @Column(length = 100)
    private String sessionId;  // User session identifier

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "hold_rooms",
            joinColumns = @JoinColumn(name = "hold_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private HoldStatus status = HoldStatus.ACTIVE;

    @Column(nullable = false)
    private Instant expiresAt;  // TTL expiry timestamp

    @Column(length = 20)
    private String roomType;  // If hold is at room type level

    private Integer numberOfRooms;  // Number of rooms in hold

    private Integer numberOfGuests;

    @Column(length = 500)
    private String notes;

    // Link to reservation if converted
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Helper method to check if hold is expired
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    // Helper method to check if hold is active
    public boolean isActive() {
        return status == HoldStatus.ACTIVE && !isExpired();
    }
}