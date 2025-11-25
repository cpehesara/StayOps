package com.example.stayops.scheduling;

import com.example.stayops.service.PaymentService;
import com.example.stayops.service.ReservationHoldService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled jobs for reservation system background tasks
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationScheduledJobs {

    private final ReservationHoldService holdService;
    private final PaymentService paymentService;

    /**
     * Process expired holds every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void processExpiredHolds() {
        log.info("Running scheduled job: Process expired holds");
        try {
            int processed = holdService.processExpiredHolds();
            log.info("Processed {} expired holds", processed);
        } catch (Exception e) {
            log.error("Error processing expired holds", e);
        }
    }

    /**
     * Process timeout payments every 10 minutes
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    public void processTimeoutPayments() {
        log.info("Running scheduled job: Process timeout payments");
        try {
            int processed = paymentService.processTimeoutPayments(30); // 30 minute timeout
            log.info("Processed {} timeout payments", processed);
        } catch (Exception e) {
            log.error("Error processing timeout payments", e);
        }
    }

    /**
     * Send arrival reminders - runs at 9 AM daily
     */
    @Scheduled(cron = "0 0 9 * * *") // 9 AM daily
    public void sendArrivalReminders() {
        log.info("Running scheduled job: Send arrival reminders");
        try {
            // TODO: Implement reminder sending for arrivals in next 24-48 hours
            log.info("Arrival reminders sent");
        } catch (Exception e) {
            log.error("Error sending arrival reminders", e);
        }
    }
}