package com.example.stayops.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public void publishReservationEvent(ReservationEvent event) {
        log.info("Publishing reservation event: {} for reservation {}",
                event.getEventType(), event.getReservationId());
        applicationEventPublisher.publishEvent(event);
    }

    public void publishPaymentEvent(PaymentEvent event) {
        log.info("Publishing payment event: {} for payment {}",
                event.getEventType(), event.getPaymentId());
        applicationEventPublisher.publishEvent(event);
    }
}