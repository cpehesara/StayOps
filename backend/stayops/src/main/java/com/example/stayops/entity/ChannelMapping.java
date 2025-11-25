package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "channel_mappings", indexes = {
        @Index(name = "idx_channel_booking_id", columnList = "externalBookingId"),
        @Index(name = "idx_channel_code", columnList = "channelCode")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChannelMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false, length = 50)
    private String channelCode;  // OTA identifier: BOOKING_COM, EXPEDIA, AGODA, etc.

    @Column(nullable = false, unique = true, length = 100)
    private String externalBookingId;  // OTA's booking reference

    @Column(length = 100)
    private String externalReservationNumber;  // OTA's reservation number

    @Column(columnDefinition = "TEXT")
    private String channelData;  // JSON payload from OTA for reference

    @Column(length = 100)
    private String guestNameFromChannel;  // Guest name as provided by OTA

    @Column(length = 100)
    private String guestEmailFromChannel;

    private Boolean isChannelCollectedPayment;  // True if OTA collected payment

    @Column(length = 50)
    private String channelCommissionType;  // PERCENTAGE, FIXED

    @Column(precision = 5, scale = 2)
    private java.math.BigDecimal commissionRate;

    private Instant lastSyncedAt;

    @Column(length = 500)
    private String syncNotes;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}