package com.example.stayops.automation;

import com.example.stayops.config.AutomationConfig;
import com.example.stayops.entity.Reservation;
import com.example.stayops.event.ReservationEvent;
import com.example.stayops.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoomAssignmentListener {

    private final ReservationRepository reservationRepository;
    private final RoomAssignmentService roomAssignmentService;
    private final AutomationConfig config;

    @Async
    @EventListener
    @Transactional
    public void handleReservationConfirmed(ReservationEvent event) {
        if (!"CONFIRMED".equals(event.getEventType()) || !config.isAutoAssignRooms()) {
            return;
        }

        log.info("Auto-assigning rooms for confirmed reservation: {}",
                event.getReservationId());

        try {
            Reservation reservation = reservationRepository
                    .findById(event.getReservationId())
                    .orElseThrow(() -> new RuntimeException(
                            "Reservation not found: " + event.getReservationId()));

            boolean success = roomAssignmentService.autoAssignRooms(reservation);

            if (!success) {
                log.error("Failed to auto-assign rooms for reservation: {}. " +
                        "Manual assignment required.", event.getReservationId());
                // TODO: Create notification/alert for operations team
                // TODO: Create incident ticket
            }
        } catch (Exception e) {
            log.error("Error in room assignment automation for reservation {}: {}",
                    event.getReservationId(), e.getMessage(), e);
        }
    }
}