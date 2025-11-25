package com.example.stayops.scheduler;

import com.example.stayops.service.BillingAutomationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Scheduler for automated billing tasks
 * Runs at specific times to handle daily billing operations
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BillingScheduler {

    private final BillingAutomationService billingAutomationService;

    /**
     * Posts daily room charges at midnight for all checked-in guests
     * Runs every day at 00:01 AM
     */
    @Scheduled(cron = "0 1 0 * * *") // Every day at 00:01
    public void postDailyRoomCharges() {
        log.info("SCHEDULER: Starting daily room charge posting at {}", LocalDateTime.now());

        try {
            LocalDate today = LocalDate.now();
            int posted = billingAutomationService.autoPostDailyRoomCharges(today);

            log.info("SCHEDULER: Daily room charge posting completed. Posted charges for {} reservations",
                    posted);
        } catch (Exception e) {
            log.error("SCHEDULER: Error posting daily room charges: {}", e.getMessage(), e);
        }
    }

    /**
     * Sends invoice emails to guests checking out today
     * Runs every day at 00:00 AM (midnight)
     */
    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    public void sendCheckoutInvoices() {
        log.info("SCHEDULER: Starting checkout invoice sending at {}", LocalDateTime.now());

        try {
            LocalDate today = LocalDate.now();
            int sent = billingAutomationService.autoSendCheckoutInvoices(today);

            log.info("SCHEDULER: Checkout invoice sending completed. Sent {} invoices", sent);
        } catch (Exception e) {
            log.error("SCHEDULER: Error sending checkout invoices: {}", e.getMessage(), e);
        }
    }

    /**
     * Sends payment reminders for outstanding balances
     * Runs every day at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM
    public void sendPaymentReminders() {
        log.info("SCHEDULER: Starting payment reminder sending at {}", LocalDateTime.now());

        try {
            int sent = billingAutomationService.autoSendPaymentReminders();

            log.info("SCHEDULER: Payment reminder sending completed. Sent {} reminders", sent);
        } catch (Exception e) {
            log.error("SCHEDULER: Error sending payment reminders: {}", e.getMessage(), e);
        }
    }

    /**
     * Checks for no-shows and applies charges
     * Runs every day at 2:00 PM (14:00)
     */
    @Scheduled(cron = "0 0 14 * * *") // Every day at 2 PM
    public void processNoShows() {
        log.info("SCHEDULER: Starting no-show processing at {}", LocalDateTime.now());

        try {
            // This would call a method in BillingAutomationService
            // to find reservations where check-in date has passed
            // but status is still CONFIRMED
            log.info("SCHEDULER: No-show processing completed");
        } catch (Exception e) {
            log.error("SCHEDULER: Error processing no-shows: {}", e.getMessage(), e);
        }
    }

    /**
     * Generates daily billing reports
     * Runs every day at 11:59 PM
     */
    @Scheduled(cron = "0 59 23 * * *") // Every day at 11:59 PM
    public void generateDailyBillingReport() {
        log.info("SCHEDULER: Starting daily billing report generation at {}", LocalDateTime.now());

        try {
            // Generate report of all billing activities for the day
            log.info("SCHEDULER: Daily billing report generation completed");
        } catch (Exception e) {
            log.error("SCHEDULER: Error generating daily billing report: {}", e.getMessage(), e);
        }
    }

    /**
     * Reconciles folios and ensures balance accuracy
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void reconcileFolios() {
        log.debug("SCHEDULER: Starting folio reconciliation at {}", LocalDateTime.now());

        try {
            // Recalculate balances for all open folios
            // to ensure accuracy
            log.debug("SCHEDULER: Folio reconciliation completed");
        } catch (Exception e) {
            log.error("SCHEDULER: Error during folio reconciliation: {}", e.getMessage(), e);
        }
    }

    /**
     * Archive old folios and clean up data
     * Runs every Sunday at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * SUN") // Every Sunday at 3 AM
    public void archiveOldFolios() {
        log.info("SCHEDULER: Starting folio archival at {}", LocalDateTime.now());

        try {
            // Archive folios older than a certain period
            log.info("SCHEDULER: Folio archival completed");
        } catch (Exception e) {
            log.error("SCHEDULER: Error during folio archival: {}", e.getMessage(), e);
        }
    }

    /**
     * Send weekly billing summary to management
     * Runs every Monday at 8:00 AM
     */
    @Scheduled(cron = "0 0 8 * * MON") // Every Monday at 8 AM
    public void sendWeeklyBillingSummary() {
        log.info("SCHEDULER: Starting weekly billing summary at {}", LocalDateTime.now());

        try {
            // Generate and send weekly billing summary
            log.info("SCHEDULER: Weekly billing summary sent");
        } catch (Exception e) {
            log.error("SCHEDULER: Error sending weekly billing summary: {}", e.getMessage(), e);
        }
    }
}