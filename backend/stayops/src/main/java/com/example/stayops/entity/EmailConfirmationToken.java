package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "email_confirmation_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailConfirmationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "guest_id", nullable = false)
    private String guestId;

    @Column(name = "used", nullable = false)
    private boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    // Constructor that automatically sets expiry to 24 hours from now
    public EmailConfirmationToken(String token, String email, String guestId) {
        this.token = token;
        this.email = email;
        this.guestId = guestId;
        this.used = false;
        this.expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}