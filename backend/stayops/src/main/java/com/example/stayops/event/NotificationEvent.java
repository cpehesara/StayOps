package com.example.stayops.event;

import com.example.stayops.enums.NotificationType;
import com.example.stayops.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Base event class for all notification-triggering events
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    // Event metadata
    private String eventType; // RESERVATION_CREATED, PAYMENT_SUCCESS, etc.
    private String entityType; // RESERVATION, PAYMENT, COMPLAINT, etc.
    private Long entityId;

    // Notification content
    private String title;
    private String message;
    private NotificationType notificationType;

    // Target users
    private List<NotificationTarget> targets;

    // Optional: Link to related resource
    private String link;

    // Optional: Additional data for templates
    private Map<String, Object> additionalData;

    // Actor information (who triggered the event)
    private Long actorId;
    private String actorName;
    private UserType actorType;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationTarget {
        private Long userId;
        private UserType userType;
        private String role; // For filtering (e.g., "MANAGER", "RECEPTIONIST")
    }
}