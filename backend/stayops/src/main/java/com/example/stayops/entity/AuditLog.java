package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entityType,entityId"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_actor", columnList = "actorType,actorId"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String entityType;  // RESERVATION, PAYMENT, HOLD, FOLIO, etc.

    @Column(nullable = false, length = 100)
    private String entityId;  // ID of the entity being audited

    @Column(nullable = false, length = 50)
    private String action;  // CREATE, UPDATE, DELETE, STATUS_CHANGE, PAYMENT, etc.

    @Column(nullable = false, length = 50)
    private String actorType;  // GUEST, STAFF, SYSTEM, WEBHOOK, OTA

    @Column(length = 100)
    private String actorId;  // User ID, system process name, webhook source

    @Column(length = 200)
    private String actorName;  // Human-readable actor name

    @Column(columnDefinition = "TEXT")
    private String oldValue;  // Previous state (JSON or text)

    @Column(columnDefinition = "TEXT")
    private String newValue;  // New state (JSON or text)

    @Column(length = 500)
    private String description;  // Human-readable description

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 100)
    private String requestId;  // Trace request across services

    @Column(length = 100)
    private String sessionId;

    @Column(nullable = false)
    @CreationTimestamp
    private Instant timestamp;

    // For sensitive operations
    private Boolean isSensitive;

    @Column(length = 200)
    private String complianceTag;  // PCI_DSS, GDPR, etc.
}