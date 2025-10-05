package com.example.stayops.automation;

import com.example.stayops.config.AutomationConfig;
import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.event.EventPublisher;
import com.example.stayops.event.PaymentEvent;
import com.example.stayops.event.ReservationEvent;
import com.example.stayops.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentAutomationListener {

    private final ReservationRepository reservationRepository;
    private final EventPublisher eventPublisher;
    private final AutomationConfig config;

    @Async
    @EventListener
    @Transactional
    public void handlePaymentSuccess(PaymentEvent event) {
        if (!"SUCCESS".equals(event.getEventType()) || !config.isAutoConfirmOnPayment()) {
            return;
        }

        log.info("Payment success event received for reservation: {}",
                event.getReservationId());

        try {
            Reservation reservation = reservationRepository
                    .findById(event.getReservationId())
                    .orElseThrow(() -> new RuntimeException(
                            "Reservation not found: " + event.getReservationId()));

            // Auto-confirm reservation on successful payment
            if (reservation.getStatus() == ReservationStatus.PENDING) {
                ReservationStatus oldStatus = reservation.getStatus();
                reservation.setStatus(ReservationStatus.CONFIRMED);
                reservationRepository.save(reservation);

                log.info("Auto-confirmed reservation {} after successful payment",
                        reservation.getReservationId());

                // Publish confirmation event for other automations
                eventPublisher.publishReservationEvent(ReservationEvent.builder()
                        .reservationId(reservation.getReservationId())
                        .guestId(reservation.getGuest().getGuestId())
                        .previousStatus(oldStatus)
                        .newStatus(ReservationStatus.CONFIRMED)
                        .eventType("CONFIRMED")
                        .eventTime(Instant.now())
                        .triggeredBy("SYSTEM_PAYMENT_AUTO")
                        .build());
            } else {
                log.info("Reservation {} status is {}, no auto-confirmation needed",
                        reservation.getReservationId(), reservation.getStatus());
            }
        } catch (Exception e) {
            log.error("Error in payment success handler for reservation {}: {}",
                    event.getReservationId(), e.getMessage(), e);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void handlePaymentFailure(PaymentEvent event) {
        if (!"FAILED".equals(event.getEventType())) {
            return;
        }

        log.warn("Payment failed for reservation: {}", event.getReservationId());

        // TODO: Implement notification to guest and operations team
        // TODO: Optionally cancel reservation or mark for follow-up
    }
}