package com.example.stayops.automation;

import com.example.stayops.enums.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Template engine for generating notification content
 */
@Service
@Slf4j
public class NotificationTemplateEngine {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    /**
     * Generate notification content based on event type and data
     */
    public NotificationContent generate(String eventType, Map<String, Object> data) {
        switch (eventType) {
            // ========== RESERVATION EVENTS ==========
            case "RESERVATION_CREATED":
                return reservationCreated(data);
            case "RESERVATION_CONFIRMED":
                return reservationConfirmed(data);
            case "RESERVATION_CANCELLED":
                return reservationCancelled(data);
            case "RESERVATION_CHECKED_IN":
                return reservationCheckedIn(data);
            case "RESERVATION_CHECKED_OUT":
                return reservationCheckedOut(data);
            case "RESERVATION_NO_SHOW":
                return reservationNoShow(data);
            case "RESERVATION_MODIFIED":
                return reservationModified(data);

            // ========== PAYMENT EVENTS ==========
            case "PAYMENT_SUCCESS":
                return paymentSuccess(data);
            case "PAYMENT_FAILED":
                return paymentFailed(data);
            case "PAYMENT_REFUNDED":
                return paymentRefunded(data);
            case "PAYMENT_PENDING":
                return paymentPending(data);

            // ========== ROOM EVENTS ==========
            case "ROOM_ASSIGNED":
                return roomAssigned(data);
            case "ROOM_READY":
                return roomReady(data);
            case "ROOM_CLEANING_REQUIRED":
                return roomCleaningRequired(data);
            case "ROOM_MAINTENANCE_REQUIRED":
                return roomMaintenanceRequired(data);

            // ========== SERVICE REQUEST EVENTS ==========
            case "SERVICE_REQUEST_CREATED":
                return serviceRequestCreated(data);
            case "SERVICE_REQUEST_ASSIGNED":
                return serviceRequestAssigned(data);
            case "SERVICE_REQUEST_COMPLETED":
                return serviceRequestCompleted(data);
            case "SERVICE_REQUEST_URGENT":
                return serviceRequestUrgent(data);

            // ========== COMPLAINT EVENTS ==========
            case "COMPLAINT_SUBMITTED":
                return complaintSubmitted(data);
            case "COMPLAINT_ACKNOWLEDGED":
                return complaintAcknowledged(data);
            case "COMPLAINT_RESOLVED":
                return complaintResolved(data);
            case "COMPLAINT_ESCALATED":
                return complaintEscalated(data);

            // ========== HOUSEKEEPING EVENTS ==========
            case "HOUSEKEEPING_TASK_ASSIGNED":
                return housekeepingTaskAssigned(data);
            case "HOUSEKEEPING_TASK_OVERDUE":
                return housekeepingTaskOverdue(data);
            case "HOUSEKEEPING_TASK_COMPLETED":
                return housekeepingTaskCompleted(data);

            // ========== STAFF EVENTS ==========
            case "STAFF_CREATED":
                return staffCreated(data);
            case "STAFF_PERFORMANCE_LOW":
                return staffPerformanceLow(data);
            case "STAFF_SHIFT_REMINDER":
                return staffShiftReminder(data);

            // ========== GUEST EVENTS ==========
            case "GUEST_REGISTERED":
                return guestRegistered(data);
            case "GUEST_BIRTHDAY":
                return guestBirthday(data);
            case "GUEST_LOYALTY_MILESTONE":
                return guestLoyaltyMilestone(data);

            // ========== FRAUD & SECURITY ==========
            case "FRAUD_ALERT_HIGH":
                return fraudAlertHigh(data);
            case "FRAUD_ALERT_MEDIUM":
                return fraudAlertMedium(data);
            case "MULTIPLE_FAILED_PAYMENTS":
                return multipleFailedPayments(data);

            // ========== SYSTEM EVENTS ==========
            case "SYSTEM_MAINTENANCE":
                return systemMaintenance(data);
            case "BACKUP_COMPLETED":
                return backupCompleted(data);
            case "AUTOMATION_ERROR":
                return automationError(data);

            default:
                log.warn("Unknown event type: {}", eventType);
                return defaultNotification(eventType, data);
        }
    }

    // ========== RESERVATION TEMPLATES ==========

    private NotificationContent reservationCreated(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String guestName = (String) data.get("guestName");
        LocalDate checkIn = (LocalDate) data.get("checkInDate");
        LocalDate checkOut = (LocalDate) data.get("checkOutDate");

        return NotificationContent.builder()
                .title("New Reservation Created")
                .message(String.format("New reservation #%d for %s from %s to %s",
                        reservationId, guestName,
                        checkIn.format(DATE_FORMATTER),
                        checkOut.format(DATE_FORMATTER)))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent reservationConfirmed(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String guestName = (String) data.get("guestName");

        return NotificationContent.builder()
                .title("Reservation Confirmed")
                .message(String.format("Reservation #%d for %s has been confirmed", reservationId, guestName))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent reservationCancelled(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String guestName = (String) data.get("guestName");
        String reason = (String) data.getOrDefault("reason", "Not specified");

        return NotificationContent.builder()
                .title("Reservation Cancelled")
                .message(String.format("Reservation #%d for %s has been cancelled. Reason: %s",
                        reservationId, guestName, reason))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent reservationCheckedIn(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String guestName = (String) data.get("guestName");
        String roomNumber = (String) data.get("roomNumber");

        return NotificationContent.builder()
                .title("Guest Checked In")
                .message(String.format("%s has checked in to room %s (Reservation #%d)",
                        guestName, roomNumber, reservationId))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent reservationCheckedOut(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String guestName = (String) data.get("guestName");

        return NotificationContent.builder()
                .title("Guest Checked Out")
                .message(String.format("%s has checked out (Reservation #%d)", guestName, reservationId))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent reservationNoShow(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String guestName = (String) data.get("guestName");

        return NotificationContent.builder()
                .title("No-Show Alert")
                .message(String.format("Guest %s did not show up for reservation #%d", guestName, reservationId))
                .type(NotificationType.ALERT)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent reservationModified(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String changes = (String) data.get("changes");

        return NotificationContent.builder()
                .title("Reservation Modified")
                .message(String.format("Reservation #%d has been modified: %s", reservationId, changes))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    // ========== PAYMENT TEMPLATES ==========

    private NotificationContent paymentSuccess(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String amount = (String) data.get("amount");
        String method = (String) data.get("method");

        return NotificationContent.builder()
                .title("Payment Successful")
                .message(String.format("Payment of %s received via %s for reservation #%d",
                        amount, method, reservationId))
                .type(NotificationType.PAYMENT)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent paymentFailed(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String reason = (String) data.get("reason");

        return NotificationContent.builder()
                .title("Payment Failed")
                .message(String.format("Payment failed for reservation #%d. Reason: %s", reservationId, reason))
                .type(NotificationType.ALERT)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent paymentRefunded(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String amount = (String) data.get("amount");

        return NotificationContent.builder()
                .title("Payment Refunded")
                .message(String.format("Refund of %s processed for reservation #%d", amount, reservationId))
                .type(NotificationType.PAYMENT)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent paymentPending(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");

        return NotificationContent.builder()
                .title("Payment Pending")
                .message(String.format("Payment is pending for reservation #%d", reservationId))
                .type(NotificationType.ALERT)
                .link("/reservations/" + reservationId)
                .build();
    }

    // ========== ROOM TEMPLATES ==========

    private NotificationContent roomAssigned(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");
        Long reservationId = (Long) data.get("reservationId");

        return NotificationContent.builder()
                .title("Room Assigned")
                .message(String.format("Room %s has been assigned to reservation #%d", roomNumber, reservationId))
                .type(NotificationType.RESERVATION)
                .link("/reservations/" + reservationId)
                .build();
    }

    private NotificationContent roomReady(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");

        return NotificationContent.builder()
                .title("Room Ready")
                .message(String.format("Room %s is now ready for guest check-in", roomNumber))
                .type(NotificationType.INFO)
                .link("/rooms")
                .build();
    }

    private NotificationContent roomCleaningRequired(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");
        String priority = (String) data.getOrDefault("priority", "NORMAL");

        return NotificationContent.builder()
                .title("Room Cleaning Required")
                .message(String.format("Room %s requires cleaning (Priority: %s)", roomNumber, priority))
                .type(NotificationType.TASK)
                .link("/housekeeping")
                .build();
    }

    private NotificationContent roomMaintenanceRequired(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");
        String issue = (String) data.get("issue");

        return NotificationContent.builder()
                .title("Room Maintenance Required")
                .message(String.format("Room %s requires maintenance: %s", roomNumber, issue))
                .type(NotificationType.ALERT)
                .link("/service-requests")
                .build();
    }

    // ========== SERVICE REQUEST TEMPLATES ==========

    private NotificationContent serviceRequestCreated(Map<String, Object> data) {
        Long requestId = (Long) data.get("requestId");
        String type = (String) data.get("type");
        String roomNumber = (String) data.get("roomNumber");

        return NotificationContent.builder()
                .title("New Service Request")
                .message(String.format("New %s request #%d for room %s", type, requestId, roomNumber))
                .type(NotificationType.TASK)
                .link("/service-requests/" + requestId)
                .build();
    }

    private NotificationContent serviceRequestAssigned(Map<String, Object> data) {
        Long requestId = (Long) data.get("requestId");
        String staffName = (String) data.get("staffName");

        return NotificationContent.builder()
                .title("Service Request Assigned")
                .message(String.format("Service request #%d has been assigned to %s", requestId, staffName))
                .type(NotificationType.TASK)
                .link("/service-requests/" + requestId)
                .build();
    }

    private NotificationContent serviceRequestCompleted(Map<String, Object> data) {
        Long requestId = (Long) data.get("requestId");
        String type = (String) data.get("type");

        return NotificationContent.builder()
                .title("Service Request Completed")
                .message(String.format("%s request #%d has been completed", type, requestId))
                .type(NotificationType.INFO)
                .link("/service-requests/" + requestId)
                .build();
    }

    private NotificationContent serviceRequestUrgent(Map<String, Object> data) {
        Long requestId = (Long) data.get("requestId");
        String type = (String) data.get("type");
        String roomNumber = (String) data.get("roomNumber");

        return NotificationContent.builder()
                .title("🚨 URGENT Service Request")
                .message(String.format("URGENT %s request #%d for room %s requires immediate attention",
                        type, requestId, roomNumber))
                .type(NotificationType.ALERT)
                .link("/service-requests/" + requestId)
                .build();
    }

    // ========== COMPLAINT TEMPLATES ==========

    private NotificationContent complaintSubmitted(Map<String, Object> data) {
        Long complaintId = (Long) data.get("complaintId");
        String category = (String) data.get("category");
        String guestName = (String) data.get("guestName");

        return NotificationContent.builder()
                .title("New Complaint Submitted")
                .message(String.format("New %s complaint #%d from %s", category, complaintId, guestName))
                .type(NotificationType.ALERT)
                .link("/complaints/" + complaintId)
                .build();
    }

    private NotificationContent complaintAcknowledged(Map<String, Object> data) {
        Long complaintId = (Long) data.get("complaintId");

        return NotificationContent.builder()
                .title("Complaint Acknowledged")
                .message(String.format("Your complaint #%d has been acknowledged and is being reviewed", complaintId))
                .type(NotificationType.INFO)
                .link("/complaints/" + complaintId)
                .build();
    }

    private NotificationContent complaintResolved(Map<String, Object> data) {
        Long complaintId = (Long) data.get("complaintId");

        return NotificationContent.builder()
                .title("Complaint Resolved")
                .message(String.format("Complaint #%d has been resolved", complaintId))
                .type(NotificationType.INFO)
                .link("/complaints/" + complaintId)
                .build();
    }

    private NotificationContent complaintEscalated(Map<String, Object> data) {
        Long complaintId = (Long) data.get("complaintId");
        String priority = (String) data.get("priority");

        return NotificationContent.builder()
                .title("Complaint Escalated")
                .message(String.format("Complaint #%d has been escalated to %s priority", complaintId, priority))
                .type(NotificationType.ALERT)
                .link("/complaints/" + complaintId)
                .build();
    }

    // ========== HOUSEKEEPING TEMPLATES ==========

    private NotificationContent housekeepingTaskAssigned(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");
        String taskType = (String) data.get("taskType");

        return NotificationContent.builder()
                .title("Housekeeping Task Assigned")
                .message(String.format("You have been assigned a %s task for room %s", taskType, roomNumber))
                .type(NotificationType.TASK)
                .link("/housekeeping")
                .build();
    }

    private NotificationContent housekeepingTaskOverdue(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");

        return NotificationContent.builder()
                .title("⚠️ Housekeeping Task Overdue")
                .message(String.format("Housekeeping task for room %s is overdue", roomNumber))
                .type(NotificationType.ALERT)
                .link("/housekeeping")
                .build();
    }

    private NotificationContent housekeepingTaskCompleted(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");

        return NotificationContent.builder()
                .title("Housekeeping Task Completed")
                .message(String.format("Room %s has been cleaned and is ready", roomNumber))
                .type(NotificationType.INFO)
                .link("/housekeeping")
                .build();
    }

    // ========== STAFF TEMPLATES ==========

    private NotificationContent staffCreated(Map<String, Object> data) {
        String staffName = (String) data.get("staffName");
        String department = (String) data.get("department");

        return NotificationContent.builder()
                .title("New Staff Member")
                .message(String.format("%s has joined the %s department", staffName, department))
                .type(NotificationType.INFO)
                .link("/staff")
                .build();
    }

    private NotificationContent staffPerformanceLow(Map<String, Object> data) {
        String staffName = (String) data.get("staffName");
        Integer performance = (Integer) data.get("performance");

        return NotificationContent.builder()
                .title("Performance Alert")
                .message(String.format("%s's performance has dropped to %d%%", staffName, performance))
                .type(NotificationType.ALERT)
                .link("/staff")
                .build();
    }

    private NotificationContent staffShiftReminder(Map<String, Object> data) {
        String shiftTime = (String) data.get("shiftTime");

        return NotificationContent.builder()
                .title("Shift Reminder")
                .message(String.format("Your shift starts at %s", shiftTime))
                .type(NotificationType.REMINDER)
                .link("/schedule")
                .build();
    }

    // ========== GUEST TEMPLATES ==========

    private NotificationContent guestRegistered(Map<String, Object> data) {
        String guestName = (String) data.get("guestName");

        return NotificationContent.builder()
                .title("Welcome to StayOps!")
                .message(String.format("Welcome %s! Your account has been successfully created", guestName))
                .type(NotificationType.INFO)
                .link("/profile")
                .build();
    }

    private NotificationContent guestBirthday(Map<String, Object> data) {
        String guestName = (String) data.get("guestName");

        return NotificationContent.builder()
                .title("🎉 Happy Birthday!")
                .message(String.format("Happy Birthday %s! Enjoy a special discount on your next stay", guestName))
                .type(NotificationType.INFO)
                .link("/offers")
                .build();
    }

    private NotificationContent guestLoyaltyMilestone(Map<String, Object> data) {
        String level = (String) data.get("level");
        Integer points = (Integer) data.get("points");

        return NotificationContent.builder()
                .title("🏆 Loyalty Milestone Reached!")
                .message(String.format("Congratulations! You've reached %s level with %d points", level, points))
                .type(NotificationType.INFO)
                .link("/loyalty")
                .build();
    }

    // ========== FRAUD & SECURITY TEMPLATES ==========

    private NotificationContent fraudAlertHigh(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String reason = (String) data.get("reason");

        return NotificationContent.builder()
                .title("🚨 HIGH RISK FRAUD ALERT")
                .message(String.format("High-risk fraud detected for reservation #%d: %s", reservationId, reason))
                .type(NotificationType.ALERT)
                .link("/fraud-alerts")
                .build();
    }

    private NotificationContent fraudAlertMedium(Map<String, Object> data) {
        Long reservationId = (Long) data.get("reservationId");
        String reason = (String) data.get("reason");

        return NotificationContent.builder()
                .title("⚠️ Fraud Alert")
                .message(String.format("Potential fraud detected for reservation #%d: %s", reservationId, reason))
                .type(NotificationType.ALERT)
                .link("/fraud-alerts")
                .build();
    }

    private NotificationContent multipleFailedPayments(Map<String, Object> data) {
        String guestEmail = (String) data.get("guestEmail");
        Integer attempts = (Integer) data.get("attempts");

        return NotificationContent.builder()
                .title("⚠️ Multiple Failed Payments")
                .message(String.format("%d failed payment attempts detected for %s", attempts, guestEmail))
                .type(NotificationType.ALERT)
                .link("/fraud-alerts")
                .build();
    }

    // ========== SYSTEM TEMPLATES ==========

    private NotificationContent systemMaintenance(Map<String, Object> data) {
        String scheduledTime = (String) data.get("scheduledTime");

        return NotificationContent.builder()
                .title("System Maintenance Scheduled")
                .message(String.format("System maintenance is scheduled for %s", scheduledTime))
                .type(NotificationType.INFO)
                .link(null)
                .build();
    }

    private NotificationContent backupCompleted(Map<String, Object> data) {
        return NotificationContent.builder()
                .title("Backup Completed")
                .message("System backup has been completed successfully")
                .type(NotificationType.INFO)
                .link(null)
                .build();
    }

    private NotificationContent automationError(Map<String, Object> data) {
        String errorType = (String) data.get("errorType");
        String details = (String) data.get("details");

        return NotificationContent.builder()
                .title("🚨 Automation Error")
                .message(String.format("Automation error in %s: %s", errorType, details))
                .type(NotificationType.ALERT)
                .link("/system/logs")
                .build();
    }

    // ========== DEFAULT TEMPLATE ==========

    private NotificationContent defaultNotification(String eventType, Map<String, Object> data) {
        return NotificationContent.builder()
                .title("System Notification")
                .message(String.format("Event: %s", eventType))
                .type(NotificationType.INFO)
                .link(null)
                .build();
    }

    // ========== HELPER CLASS ==========

    @lombok.Data
    @lombok.Builder
    public static class NotificationContent {
        private String title;
        private String message;
        private NotificationType type;
        private String link;
    }
}