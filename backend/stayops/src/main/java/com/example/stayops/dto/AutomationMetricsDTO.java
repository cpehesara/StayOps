package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutomationMetricsDTO {

    // Reservation Automation
    private Integer autoConfirmedReservations;
    private Integer autoAssignedRooms;
    private Integer roomAssignmentFailures;

    // Payment Automation
    private Integer successfulWebhooks;
    private Integer failedWebhooks;
    private Integer timeoutPayments;

    // Housekeeping Automation
    private Integer tasksCreated;
    private Integer tasksCompleted;
    private Integer overdueTasks;

    // No-Show & Cleanup
    private Integer markedNoShows;
    private Integer cancelledStaleReservations;

    // Fraud Detection
    private Integer fraudAlertsCreated;
    private Integer highRiskAlerts;

    // OTA Integration
    private Integer otaBookingsProcessed;
    private Integer availabilitySyncs;
    private Integer rateSyncs;

    private LocalDate date;
    private String period; // DAILY, WEEKLY, MONTHLY
}