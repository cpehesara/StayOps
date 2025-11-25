package com.example.stayops.automation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled jobs for automated reservation management
 *
 * These jobs run automatically in the background to handle:
 * - Auto-cancellation of unconfirmed reservations
 * - Auto-checkout of overdue guests
 * - Auto-check-in processing
 * - Sending reminders
 * - Archiving old data
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationAutomationJob {

    private final ReservationAutomationService reservationAutomationService;

    /**
     * CRITICAL JOB: Check for unconfirmed reservations every 30 minutes
     * This ensures we catch reservations that need to be cancelled 3 hours before check-in
     */
    @Scheduled(cron = "0 */30 * * * *") // Every 30 minutes
    public void autoReleaseUnconfirmedReservations() {
        log.info("===== STARTING: Auto-release unconfirmed reservations =====");
        try {
            int cancelled = reservationAutomationService.autoReleaseUnconfirmedReservations();
            log.info("Auto-release job completed successfully. Cancelled: {}", cancelled);
        } catch (Exception e) {
            log.error("Error in auto-release unconfirmed reservations job", e);
        }
        log.info("===== COMPLETED: Auto-release unconfirmed reservations =====");
    }

    /**
     * Check for overdue checkouts every hour at minute 15
     */
    @Scheduled(cron = "0 15 * * * *") // Every hour at :15
    public void autoCheckoutOverdueReservations() {
        log.info("===== STARTING: Auto-checkout overdue reservations =====");
        try {
            int checkedOut = reservationAutomationService.autoCheckoutOverdueReservations();
            log.info("Auto-checkout job completed successfully. Checked out: {}", checkedOut);
        } catch (Exception e) {
            log.error("Error in auto-checkout overdue reservations job", e);
        }
        log.info("===== COMPLETED: Auto-checkout overdue reservations =====");
    }

    /**
     * Auto-check-in arriving guests - runs every hour after 2 PM
     * This gives flexibility for early arrivals while automating the process
     */
    @Scheduled(cron = "0 0 14-23 * * *") // Every hour from 2 PM to 11 PM
    public void autoUpdateArrivingGuests() {
        log.info("===== STARTING: Auto-update arriving guests =====");
        try {
            int updated = reservationAutomationService.autoUpdateArrivingGuests();
            log.info("Auto-update arriving guests completed successfully. Updated: {}", updated);
        } catch (Exception e) {
            log.error("Error in auto-update arriving guests job", e);
        }
        log.info("===== COMPLETED: Auto-update arriving guests =====");
    }

    /**
     * Send arrival reminders daily at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *") // 9 AM daily
    public void sendArrivalReminders() {
        log.info("===== STARTING: Send arrival reminders =====");
        try {
            int sent = reservationAutomationService.sendArrivalReminders();
            log.info("Arrival reminders job completed successfully. Reminders sent: {}", sent);
        } catch (Exception e) {
            log.error("Error in send arrival reminders job", e);
        }
        log.info("===== COMPLETED: Send arrival reminders =====");
    }

    /**
     * Archive old reservations - runs weekly on Sunday at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * SUN") // 3 AM every Sunday
    public void archiveOldReservations() {
        log.info("===== STARTING: Archive old reservations =====");
        try {
            int archived = reservationAutomationService.archiveOldReservations();
            log.info("Archive old reservations job completed successfully. Archived: {}", archived);
        } catch (Exception e) {
            log.error("Error in archive old reservations job", e);
        }
        log.info("===== COMPLETED: Archive old reservations =====");
    }

    /**
     * Health check job - runs every 5 minutes to ensure automation system is alive
     */
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    public void healthCheck() {
        log.debug("Reservation automation system health check - OK");
    }
}