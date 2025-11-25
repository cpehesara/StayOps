package com.example.stayops.automation;

import com.example.stayops.config.AutomationConfig;
import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.event.EventPublisher;
import com.example.stayops.event.ReservationEvent;
import com.example.stayops.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationCleanupJobs {

    private final ReservationRepository reservationRepository;
    private final EventPublisher eventPublisher;
    private final AutomationConfig config;

    // FIXED: Added time zone support
    private static final ZoneId SYSTEM_ZONE = ZoneId.systemDefault();

    /**
     * Auto-mark no-shows - Runs every hour
     * FIXES:
     * - Use efficient database query instead of findAll()
     * - Corrected grace period calculation (hours instead of days)
     * - Better null safety
     * - Improved logging
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    @Transactional
    public void autoMarkNoShows() {
        if (!config.isAutoMarkNoShows()) {
            log.debug("No-show automation is disabled");
            return;
        }

        log.info("Running no-show automation job");

        try {
            LocalDateTime now = LocalDateTime.now(SYSTEM_ZONE);

            // FIXED: Calculate grace period cutoff properly in hours
            LocalDateTime gracePeriodCutoff = now.minusHours(config.getNoShowGracePeriodHours());
            LocalDate checkInCutoffDate = gracePeriodCutoff.toLocalDate();

            // FIXED: Use efficient query instead of findAll()
            // Find CONFIRMED reservations with check-in date before the grace period cutoff
            List<Reservation> potentialNoShows = reservationRepository
                    .findByStatusAndCheckInDateBefore(
                            ReservationStatus.CONFIRMED,
                            checkInCutoffDate.plusDays(1) // Include today if applicable
                    );

            int markedCount = 0;
            for (Reservation reservation : potentialNoShows) {
                // FIXED: Properly calculate if grace period has passed
                // Assume standard check-in time of 2 PM if not specified
                LocalDateTime checkInDateTime = reservation.getCheckInDate().atTime(14, 0);
                LocalDateTime graceEndTime = checkInDateTime
                        .plusHours(config.getNoShowGracePeriodHours());

                // Only mark as no-show if we're past the grace period
                if (now.isAfter(graceEndTime)) {
                    ReservationStatus oldStatus = reservation.getStatus();
                    reservation.setStatus(ReservationStatus.CANCELLED);

                    // FIXED: Consistent room clearing
                    clearRoomAssociations(reservation);

                    reservationRepository.save(reservation);

                    log.info("Marked reservation {} as NO-SHOW (check-in: {}, grace period: {} hours)",
                            reservation.getReservationId(),
                            reservation.getCheckInDate(),
                            config.getNoShowGracePeriodHours());

                    // Publish event with proper null safety
                    publishReservationEvent(
                            reservation,
                            oldStatus,
                            ReservationStatus.CANCELLED,
                            "NO_SHOW",
                            "SYSTEM_AUTO_NO_SHOW"
                    );

                    markedCount++;

                    // TODO: Apply no-show charges per policy
                    // TODO: Send notification to guest
                }
            }

            log.info("No-show automation completed. Marked {} reservations as no-show", markedCount);

        } catch (Exception e) {
            log.error("Error in no-show automation: {}", e.getMessage(), e);
            // FIXED: Don't rethrow to prevent job scheduler from stopping
        }
    }

    /**
     * Auto-cancel stale PENDING reservations - Runs every 6 hours
     * FIXES:
     * - Use efficient database query
     * - Proper timestamp comparison
     * - Consistent room clearing
     * - Better error handling
     */
    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    @Transactional
    public void autoReleaseStaleReservations() {
        if (config.getStalePendingHours() <= 0) {
            log.debug("Stale reservation cleanup is disabled or has invalid configuration");
            return;
        }

        log.info("Running stale reservation cleanup job");

        try {
            Instant staleCutoff = Instant.now()
                    .minus(config.getStalePendingHours(), ChronoUnit.HOURS);

            // FIXED: Use efficient query instead of findAll()
            List<Reservation> staleReservations = reservationRepository
                    .findByStatusAndCreatedAtBefore(
                            ReservationStatus.PENDING,
                            staleCutoff
                    );

            int cancelledCount = 0;
            for (Reservation reservation : staleReservations) {
                try {
                    ReservationStatus oldStatus = reservation.getStatus();
                    reservation.setStatus(ReservationStatus.CANCELLED);

                    // FIXED: Consistent and safe room clearing
                    clearRoomAssociations(reservation);

                    reservationRepository.save(reservation);

                    long hoursStale = ChronoUnit.HOURS.between(reservation.getCreatedAt(), Instant.now());
                    log.info("Cancelled stale PENDING reservation {} (pending for {} hours)",
                            reservation.getReservationId(), hoursStale);

                    // Publish event with proper null safety
                    publishReservationEvent(
                            reservation,
                            oldStatus,
                            ReservationStatus.CANCELLED,
                            "STALE_CANCELLED",
                            "SYSTEM_AUTO_STALE_CLEANUP"
                    );

                    cancelledCount++;

                    // TODO: Send notification to guest about cancellation
                } catch (Exception e) {
                    log.error("Failed to cancel stale reservation {}: {}",
                            reservation.getReservationId(), e.getMessage());
                }
            }

            log.info("Stale reservation cleanup completed. Cancelled {} reservations",
                    cancelledCount);

        } catch (Exception e) {
            log.error("Error in stale reservation cleanup: {}", e.getMessage(), e);
            // FIXED: Don't rethrow to prevent job scheduler from stopping
        }
    }

    /**
     * ADDED: Comprehensive cleanup job that runs daily
     * Performs multiple cleanup operations in sequence
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    @Transactional
    public void performDailyCleanup() {
        log.info("Starting daily comprehensive cleanup");

        try {
            // Clean up old audit logs if needed
            cleanupOldAuditLogs();

            // Other cleanup tasks can be added here

            log.info("Daily comprehensive cleanup completed successfully");
        } catch (Exception e) {
            log.error("Error in daily cleanup: {}", e.getMessage(), e);
        }
    }

    // FIXED: Added helper method for consistent room clearing
    private void clearRoomAssociations(Reservation reservation) {
        if (reservation.getRooms() != null && !reservation.getRooms().isEmpty()) {
            reservation.getRooms().clear();
        }
    }

    // FIXED: Added helper method to reduce duplication and ensure null safety
    private void publishReservationEvent(Reservation reservation, ReservationStatus oldStatus,
                                         ReservationStatus newStatus, String eventType,
                                         String triggeredBy) {
        try {
            String guestId = (reservation.getGuest() != null)
                    ? reservation.getGuest().getGuestId()
                    : null;

            eventPublisher.publishReservationEvent(ReservationEvent.builder()
                    .reservationId(reservation.getReservationId())
                    .guestId(guestId)
                    .previousStatus(oldStatus)
                    .newStatus(newStatus)
                    .eventType(eventType)
                    .eventTime(Instant.now())
                    .triggeredBy(triggeredBy)
                    .build());
        } catch (Exception e) {
            log.error("Failed to publish reservation event for {}: {}",
                    reservation.getReservationId(), e.getMessage());
            // Don't rethrow - event publishing failure shouldn't stop the cleanup
        }
    }

    // ADDED: Helper method for audit log cleanup
    private void cleanupOldAuditLogs() {
        // TODO: Implement if AuditLogRepository supports cleanup
        log.debug("Audit log cleanup not yet implemented");
    }
}