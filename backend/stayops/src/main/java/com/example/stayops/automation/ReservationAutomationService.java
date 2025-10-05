package com.example.stayops.automation;

import com.example.stayops.entity.AuditLog;
import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.event.EventPublisher;
import com.example.stayops.event.ReservationEvent;
import com.example.stayops.repository.AuditLogRepository;
import com.example.stayops.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationAutomationService {

    private final ReservationRepository reservationRepository;
    private final EventPublisher eventPublisher;
    private final AuditLogRepository auditLogRepository;

    /**
     * REQUIREMENT 1: Auto-cancel reservations not confirmed 3 hours before check-in
     */
    @Transactional
    public int autoReleaseUnconfirmedReservations() {
        log.info("Running auto-release for unconfirmed reservations...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeHoursFromNow = now.plusHours(3);
        LocalDate checkInCutoffDate = threeHoursFromNow.toLocalDate();

        // Find PENDING reservations with check-in today or tomorrow that are within 3 hours
        List<Reservation> pendingReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING)
                .filter(r -> {
                    LocalDate checkIn = r.getCheckInDate();
                    // If check-in is today, check if it's within 3 hours
                    if (checkIn.equals(LocalDate.now())) {
                        return true; // Will be processed
                    }
                    // If check-in is tomorrow and we're within 3 hours of midnight
                    if (checkIn.equals(LocalDate.now().plusDays(1))) {
                        return now.getHour() >= 21; // After 9 PM, it's within 3 hours of next day
                    }
                    return false;
                })
                .toList();

        int cancelledCount = 0;
        for (Reservation reservation : pendingReservations) {
            LocalDateTime checkInDateTime = reservation.getCheckInDate()
                    .atTime(14, 0); // Assume 2 PM check-in time

            // If current time is within 3 hours of check-in
            if (now.plusHours(3).isAfter(checkInDateTime) || now.isAfter(checkInDateTime)) {
                ReservationStatus oldStatus = reservation.getStatus();
                reservation.setStatus(ReservationStatus.CANCELLED);

                // Clear room associations to free up inventory
                if (reservation.getRooms() != null) {
                    reservation.getRooms().clear();
                }

                reservationRepository.save(reservation);

                // Log audit
                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "AUTO_CANCEL_UNCONFIRMED", "SYSTEM", "AUTOMATION",
                        "Auto-cancelled: Not confirmed 3 hours before check-in");

                // Publish event
                eventPublisher.publishReservationEvent(ReservationEvent.builder()
                        .reservationId(reservation.getReservationId())
                        .guestId(reservation.getGuest() != null ?
                                reservation.getGuest().getGuestId() : null)
                        .previousStatus(oldStatus)
                        .newStatus(ReservationStatus.CANCELLED)
                        .eventType("AUTO_CANCELLED_UNCONFIRMED")
                        .eventTime(Instant.now())
                        .triggeredBy("SYSTEM_AUTO_CANCEL_3H")
                        .build());

                cancelledCount++;
                log.info("Auto-cancelled reservation {} - not confirmed before 3-hour deadline",
                        reservation.getReservationId());

                // TODO: Send notification to guest about cancellation
            }
        }

        log.info("Auto-release completed: {} reservations cancelled", cancelledCount);
        return cancelledCount;
    }

    /**
     * REQUIREMENT 2: Auto-confirm same-day reservations
     * This is called from ReservationServiceImpl during creation
     */
    public ReservationStatus determineInitialStatus(LocalDate checkInDate, ReservationStatus requestedStatus) {
        // If check-in is today, automatically confirm (skip PENDING status)
        if (checkInDate.equals(LocalDate.now())) {
            log.info("Same-day reservation detected - auto-confirming");
            return ReservationStatus.CONFIRMED;
        }

        // Otherwise, use the requested status (typically PENDING)
        return requestedStatus != null ? requestedStatus : ReservationStatus.PENDING;
    }

    /**
     * ADDITIONAL AUTOMATION: Auto-checkout past-due reservations
     */
    @Transactional
    public int autoCheckoutOverdueReservations() {
        log.info("Running auto-checkout for overdue reservations...");

        LocalDate yesterday = LocalDate.now().minusDays(1);

        // Find reservations that should have checked out yesterday or earlier
        List<Reservation> overdueReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .filter(r -> r.getCheckOutDate().isBefore(LocalDate.now()))
                .toList();

        int checkedOutCount = 0;
        for (Reservation reservation : overdueReservations) {
            ReservationStatus oldStatus = reservation.getStatus();
            reservation.setStatus(ReservationStatus.CHECKED_OUT);
            reservationRepository.save(reservation);

            logAudit("RESERVATION", reservation.getReservationId().toString(),
                    "AUTO_CHECKOUT", "SYSTEM", "AUTOMATION",
                    "Auto-checked out: Past checkout date");

            eventPublisher.publishReservationEvent(ReservationEvent.builder()
                    .reservationId(reservation.getReservationId())
                    .guestId(reservation.getGuest() != null ?
                            reservation.getGuest().getGuestId() : null)
                    .previousStatus(oldStatus)
                    .newStatus(ReservationStatus.CHECKED_OUT)
                    .eventType("AUTO_CHECKED_OUT")
                    .eventTime(Instant.now())
                    .triggeredBy("SYSTEM_AUTO_CHECKOUT")
                    .build());

            checkedOutCount++;
            log.info("Auto-checked out reservation {} - past checkout date",
                    reservation.getReservationId());
        }

        log.info("Auto-checkout completed: {} reservations checked out", checkedOutCount);
        return checkedOutCount;
    }

    /**
     * ADDITIONAL AUTOMATION: Auto-transition CONFIRMED to CHECKED_IN on check-in date
     */
    @Transactional
    public int autoUpdateArrivingGuests() {
        log.info("Running auto-update for arriving guests...");

        LocalDate today = LocalDate.now();

        // Find CONFIRMED reservations with check-in today that haven't been manually checked in
        List<Reservation> arrivingReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .filter(r -> r.getCheckInDate().equals(today))
                .toList();

        int updatedCount = 0;
        for (Reservation reservation : arrivingReservations) {
            // Only auto-check-in after 2 PM (typical check-in time)
            if (LocalDateTime.now().getHour() >= 14) {
                ReservationStatus oldStatus = reservation.getStatus();
                reservation.setStatus(ReservationStatus.CHECKED_IN);
                reservationRepository.save(reservation);

                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "AUTO_CHECK_IN", "SYSTEM", "AUTOMATION",
                        "Auto-checked in: Check-in date arrived");

                eventPublisher.publishReservationEvent(ReservationEvent.builder()
                        .reservationId(reservation.getReservationId())
                        .guestId(reservation.getGuest() != null ?
                                reservation.getGuest().getGuestId() : null)
                        .previousStatus(oldStatus)
                        .newStatus(ReservationStatus.CHECKED_IN)
                        .eventType("AUTO_CHECKED_IN")
                        .eventTime(Instant.now())
                        .triggeredBy("SYSTEM_AUTO_CHECK_IN")
                        .build());

                updatedCount++;
                log.info("Auto-checked in reservation {} - check-in date reached",
                        reservation.getReservationId());
            }
        }

        log.info("Auto-update arriving guests completed: {} reservations checked in", updatedCount);
        return updatedCount;
    }

    /**
     * ADDITIONAL AUTOMATION: Send reminders for upcoming arrivals
     */
    @Transactional(readOnly = true)
    public int sendArrivalReminders() {
        log.info("Sending arrival reminders...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Find CONFIRMED reservations checking in tomorrow
        List<Reservation> tomorrowArrivals = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .filter(r -> r.getCheckInDate().equals(tomorrow))
                .toList();

        int remindersSent = 0;
        for (Reservation reservation : tomorrowArrivals) {
            // TODO: Implement actual email/SMS sending
            log.info("Reminder: Guest {} checking in tomorrow at reservation {}",
                    reservation.getGuest() != null ? reservation.getGuest().getEmail() : "Unknown",
                    reservation.getReservationId());

            logAudit("RESERVATION", reservation.getReservationId().toString(),
                    "REMINDER_SENT", "SYSTEM", "AUTOMATION",
                    "Sent check-in reminder for tomorrow");

            remindersSent++;
        }

        log.info("Arrival reminders sent: {}", remindersSent);
        return remindersSent;
    }

    /**
     * ADDITIONAL AUTOMATION: Clean up old cancelled/checked-out reservations
     */
    @Transactional
    public int archiveOldReservations() {
        log.info("Archiving old reservations...");

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);

        // Find old CANCELLED or CHECKED_OUT reservations
        List<Reservation> oldReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CANCELLED ||
                        r.getStatus() == ReservationStatus.CHECKED_OUT)
                .filter(r -> r.getCheckOutDate().isBefore(thirtyDaysAgo))
                .toList();

        int archivedCount = 0;
        for (Reservation reservation : oldReservations) {
            // In a real system, you might move to archive table or mark as archived
            logAudit("RESERVATION", reservation.getReservationId().toString(),
                    "ARCHIVED", "SYSTEM", "AUTOMATION",
                    "Archived old reservation (30+ days past checkout)");

            archivedCount++;
        }

        log.info("Archived {} old reservations", archivedCount);
        return archivedCount;
    }

    // Helper method
    private void logAudit(String entityType, String entityId, String action,
                          String actorType, String actorId, String description) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .actorType(actorType)
                    .actorId(actorId)
                    .description(description)
                    .timestamp(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }
}