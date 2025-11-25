package com.example.stayops.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Service responsible for publishing application events
 * Used to trigger automated billing workflows
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * ADDED: Publish general reservation event (for automation workflows)
     * This method is used by the automation services to publish status change events
     */
    public void publishReservationEvent(ReservationEvent event) {
        if (event == null) {
            log.warn("Attempted to publish null ReservationEvent");
            return;
        }

        log.info("Publishing ReservationEvent for reservation: {}, type: {}, status: {} -> {}",
                event.getReservationId(),
                event.getEventType(),
                event.getPreviousStatus(),
                event.getNewStatus());

        applicationEventPublisher.publishEvent(event);
        log.debug("ReservationEvent published successfully");
    }

    /**
     * Publish reservation created event
     */
    public void publishReservationCreated(Long reservationId, String guestId,
                                          LocalDate checkInDate, LocalDate checkOutDate) {
        log.info("Publishing ReservationCreatedEvent for reservation: {}", reservationId);

        ReservationCreatedEvent event = ReservationCreatedEvent.builder()
                .reservationId(reservationId)
                .guestId(guestId)
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("ReservationCreatedEvent published successfully");
    }

    /**
     * Publish check-in event
     */
    public void publishCheckIn(Long reservationId, String guestId, LocalDate checkInDate) {
        log.info("Publishing CheckInEvent for reservation: {}", reservationId);

        CheckInEvent event = CheckInEvent.builder()
                .reservationId(reservationId)
                .guestId(guestId)
                .checkInDate(checkInDate)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("CheckInEvent published successfully");
    }

    /**
     * Publish check-out event
     */
    public void publishCheckOut(Long reservationId, String guestId, LocalDate checkOutDate) {
        log.info("Publishing CheckOutEvent for reservation: {}", reservationId);

        CheckOutEvent event = CheckOutEvent.builder()
                .reservationId(reservationId)
                .guestId(guestId)
                .checkOutDate(checkOutDate)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("CheckOutEvent published successfully");
    }

    /**
     * Publish service completed event
     */
    public void publishServiceCompleted(Long reservationId, Long serviceRequestId,
                                        String serviceType, BigDecimal amount) {
        log.info("Publishing ServiceCompletedEvent for reservation: {}, service: {}",
                reservationId, serviceType);

        ServiceCompletedEvent event = ServiceCompletedEvent.builder()
                .reservationId(reservationId)
                .serviceRequestId(serviceRequestId)
                .serviceType(serviceType)
                .amount(amount)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("ServiceCompletedEvent published successfully");
    }

    /**
     * Publish reservation cancelled event
     */
    public void publishReservationCancelled(Long reservationId, String cancellationReason) {
        log.info("Publishing ReservationCancelledEvent for reservation: {}", reservationId);

        ReservationCancelledEvent event = ReservationCancelledEvent.builder()
                .reservationId(reservationId)
                .cancellationReason(cancellationReason)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("ReservationCancelledEvent published successfully");
    }

    /**
     * Publish no-show event
     */
    public void publishNoShow(Long reservationId, LocalDate expectedCheckInDate) {
        log.info("Publishing NoShowEvent for reservation: {}", reservationId);

        NoShowEvent event = NoShowEvent.builder()
                .reservationId(reservationId)
                .expectedCheckInDate(expectedCheckInDate)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("NoShowEvent published successfully");
    }

    /**
     * Publish late checkout event
     */
    public void publishLateCheckout(Long reservationId, int hoursLate) {
        log.info("Publishing LateCheckoutEvent for reservation: {}, hours: {}",
                reservationId, hoursLate);

        LateCheckoutEvent event = LateCheckoutEvent.builder()
                .reservationId(reservationId)
                .hoursLate(hoursLate)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("LateCheckoutEvent published successfully");
    }

    /**
     * Publish early checkout event
     */
    public void publishEarlyCheckout(Long reservationId, LocalDate originalCheckoutDate,
                                     LocalDate actualCheckoutDate) {
        log.info("Publishing EarlyCheckoutEvent for reservation: {}", reservationId);

        EarlyCheckoutEvent event = EarlyCheckoutEvent.builder()
                .reservationId(reservationId)
                .originalCheckoutDate(originalCheckoutDate)
                .actualCheckoutDate(actualCheckoutDate)
                .eventTime(Instant.now())
                .build();

        applicationEventPublisher.publishEvent(event);
        log.debug("EarlyCheckoutEvent published successfully");
    }

    /**
     * Publish payment event
     */
    public void publishPaymentEvent(PaymentEvent paymentEvent) {
        log.info("Publishing PaymentEvent for reservation: {}, status: {}",
                paymentEvent.getReservationId(), paymentEvent.getStatus());

        applicationEventPublisher.publishEvent(paymentEvent);
        log.debug("PaymentEvent published successfully");
    }
}