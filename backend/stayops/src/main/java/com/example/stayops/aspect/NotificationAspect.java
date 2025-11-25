package com.example.stayops.aspect;

import com.example.stayops.automation.NotificationPublisher;
import com.example.stayops.entity.*;
import com.example.stayops.enums.ReservationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * AOP Aspect to automatically trigger notifications for service method calls
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationAspect {

    private final NotificationPublisher notificationPublisher;

    // ========== RESERVATION NOTIFICATIONS ==========

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ReservationService.createReservation(..))",
            returning = "result"
    )
    public void afterReservationCreated(JoinPoint joinPoint, Object result) {
        try {
            if (result instanceof com.example.stayops.dto.ReservationResponseDTO) {
                log.info("Triggering notification for reservation creation");
                // You'll need to fetch the full reservation entity to send notification
                // notificationPublisher.notifyReservationCreated(reservation);
            }
        } catch (Exception e) {
            log.error("Failed to send notification for reservation creation: {}", e.getMessage());
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ReservationService.updateReservationStatus(..)) && args(reservationId, status)",
            returning = "result"
    )
    public void afterReservationStatusUpdate(JoinPoint joinPoint, Object result,
                                             Long reservationId, String status) {
        try {
            log.info("Reservation {} status updated to: {}", reservationId, status);
            // Trigger appropriate notification based on status
            // You'll need to fetch the reservation entity and call the appropriate method
        } catch (Exception e) {
            log.error("Failed to send notification for status update: {}", e.getMessage());
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ReservationService.checkInReservation(..))",
            returning = "result"
    )
    public void afterCheckIn(JoinPoint joinPoint, Object result) {
        try {
            log.info("Triggering notification for check-in");
            // notificationPublisher.notifyReservationCheckedIn(reservation, roomNumber);
        } catch (Exception e) {
            log.error("Failed to send check-in notification: {}", e.getMessage());
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ReservationService.checkOutReservation(..))",
            returning = "result"
    )
    public void afterCheckOut(JoinPoint joinPoint, Object result) {
        try {
            log.info("Triggering notification for check-out");
            // notificationPublisher.notifyReservationCheckedOut(reservation);
        } catch (Exception e) {
            log.error("Failed to send check-out notification: {}", e.getMessage());
        }
    }

    // ========== PAYMENT NOTIFICATIONS ==========

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.PaymentService.capturePayment(..))",
            returning = "result"
    )
    public void afterPaymentCapture(JoinPoint joinPoint, Object result) {
        try {
            log.info("Triggering notification for payment capture");
            // notificationPublisher.notifyPaymentSuccess(payment);
        } catch (Exception e) {
            log.error("Failed to send payment notification: {}", e.getMessage());
        }
    }

    // ========== SERVICE REQUEST NOTIFICATIONS ==========

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ServiceRequestService.createServiceRequest(..))",
            returning = "result"
    )
    public void afterServiceRequestCreated(JoinPoint joinPoint, Object result) {
        try {
            log.info("Triggering notification for service request creation");
            // notificationPublisher.notifyServiceRequestCreated(request);
        } catch (Exception e) {
            log.error("Failed to send service request notification: {}", e.getMessage());
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ServiceRequestService.assignToStaff(..))",
            returning = "result"
    )
    public void afterServiceRequestAssigned(JoinPoint joinPoint, Object result) {
        try {
            log.info("Triggering notification for service request assignment");
            // notificationPublisher.notifyServiceRequestAssigned(request, staffName);
        } catch (Exception e) {
            log.error("Failed to send assignment notification: {}", e.getMessage());
        }
    }

    // ========== COMPLAINT NOTIFICATIONS ==========

    @AfterReturning(
            pointcut = "execution(* com.example.stayops.service.ComplaintService.createComplaint(..))",
            returning = "result"
    )
    public void afterComplaintCreated(JoinPoint joinPoint, Object result) {
        try {
            log.info("Triggering notification for complaint submission");
            // notificationPublisher.notifyComplaintSubmitted(complaint);
        } catch (Exception e) {
            log.error("Failed to send complaint notification: {}", e.getMessage());
        }
    }
}