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
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationCleanupJobs {

    private final ReservationRepository reservationRepository;
    private final EventPublisher eventPublisher;
    private final AutomationConfig config;

    /**
     * Auto-mark no-shows - Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    @Transactional
    public void autoMarkNoShows() {
        if (!config.isAutoMarkNoShows()) {
            return;
        }

        log.info("Running no-show automation job");

        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(1);

            // Find CONFIRMED reservations with check-in date before cutoff
            List<Reservation> potentialNoShows = reservationRepository.findAll().stream()
                    .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED &&
                            r.getCheckInDate().isBefore(LocalDate.now()) &&
                            r.getCheckInDate().isAfter(cutoffDate.minusDays(
                                    config.getNoShowGracePeriodHours() / 24)))
                    .toList();

            int markedCount = 0;
            for (Reservation reservation : potentialNoShows) {
                // Check if grace period has passed
                LocalDate graceCutoff = reservation.getCheckInDate()
                        .plusDays(config.getNoShowGracePeriodHours() / 24);

                if (LocalDate.now().isAfter(graceCutoff)) {
                    ReservationStatus oldStatus = reservation.getStatus();
                    reservation.setStatus(ReservationStatus.CANCELLED);
                    reservationRepository.save(reservation);

                    log.info("Marked reservation {} as NO-SHOW", reservation.getReservationId());

                    // Publish event
                    eventPublisher.publishReservationEvent(ReservationEvent.builder()
                            .reservationId(reservation.getReservationId())
                            .guestId(reservation.getGuest() != null ?
                                    reservation.getGuest().getGuestId() : null)
                            .previousStatus(oldStatus)
                            .newStatus(ReservationStatus.CANCELLED)
                            .eventType("NO_SHOW")
                            .eventTime(Instant.now())
                            .triggeredBy("SYSTEM_AUTO_NO_SHOW")
                            .build());

                    markedCount++;

                    // TODO: Apply no-show charges per policy
                    // TODO: Send notification to guest
                }
            }

            log.info("No-show automation completed. Marked {} reservations as no-show", markedCount);

        } catch (Exception e) {
            log.error("Error in no-show automation: {}", e.getMessage(), e);
        }
    }

    /**
     * Auto-cancel stale PENDING reservations - Runs every 6 hours
     */
    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    @Transactional
    public void autoReleaseStaleReservations() {
        log.info("Running stale reservation cleanup job");

        try {
            Instant staleCutoff = Instant.now()
                    .minusSeconds(config.getStalePendingHours() * 3600L);

            // Find PENDING reservations older than threshold
            List<Reservation> staleReservations = reservationRepository.findAll().stream()
                    .filter(r -> r.getStatus() == ReservationStatus.PENDING &&
                            r.getCreatedAt().isBefore(staleCutoff))
                    .toList();

            int cancelledCount = 0;
            for (Reservation reservation : staleReservations) {
                ReservationStatus oldStatus = reservation.getStatus();
                reservation.setStatus(ReservationStatus.CANCELLED);

                // Clear room associations to free up inventory
                if (reservation.getRooms() != null) {
                    reservation.setRoomsCollection(java.util.Collections.emptySet());
                }

                reservationRepository.save(reservation);

                log.info("Cancelled stale PENDING reservation {}", reservation.getReservationId());

                // Publish event
                eventPublisher.publishReservationEvent(ReservationEvent.builder()
                        .reservationId(reservation.getReservationId())
                        .guestId(reservation.getGuest() != null ?
                                reservation.getGuest().getGuestId() : null)
                        .previousStatus(oldStatus)
                        .newStatus(ReservationStatus.CANCELLED)
                        .eventType("STALE_CANCELLED")
                        .eventTime(Instant.now())
                        .triggeredBy("SYSTEM_AUTO_STALE_CLEANUP")
                        .build());

                cancelledCount++;

                // TODO: Send notification to guest about cancellation
            }

            log.info("Stale reservation cleanup completed. Cancelled {} reservations",
                    cancelledCount);

        } catch (Exception e) {
            log.error("Error in stale reservation cleanup: {}", e.getMessage(), e);
        }
    }
}