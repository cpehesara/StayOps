package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {

    private Long id;
    private String serviceType;  // HOUSEKEEPING, ROOM_SERVICE, MAINTENANCE, LAUNDRY
    private String description;
    private String status;  // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    private String requestedBy;  // Guest ID or name
    private String priority;  // LOW, MEDIUM, HIGH, URGENT
    private Long reservationId;
    private Long roomId;
    private String roomNumber;  // For display purposes
    private String assignedTo;  // Staff member assigned
    private Instant completedAt;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}