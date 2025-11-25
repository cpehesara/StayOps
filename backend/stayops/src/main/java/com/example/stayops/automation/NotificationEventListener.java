package com.example.stayops.automation;

import com.example.stayops.dto.NotificationRequestDTO;
import com.example.stayops.entity.*;
import com.example.stayops.enums.NotificationType;
import com.example.stayops.enums.UserType;
import com.example.stayops.event.NotificationEvent;
import com.example.stayops.event.ReservationEvent;
import com.example.stayops.repository.*;
import com.example.stayops.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Listens to all events in the system and creates appropriate notifications
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final NotificationTemplateEngine templateEngine;

    // Repositories for fetching staff
    private final SystemAdminRepository systemAdminRepository;
    private final ServiceManagerRepository serviceManagerRepository;
    private final OperationalManagerRepository operationalManagerRepository;
    private final ReceptionistRepository receptionistRepository;
    private final GuestRepository guestRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Listen to generic notification events
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Processing notification event: {}", event.getEventType());

        try {
            // Generate notification content from template
            NotificationTemplateEngine.NotificationContent content =
                    templateEngine.generate(event.getEventType(), event.getAdditionalData());

            // Create notifications for all targets
            for (NotificationEvent.NotificationTarget target : event.getTargets()) {
                try {
                    NotificationRequestDTO request = NotificationRequestDTO.builder()
                            .userId(target.getUserId())
                            .userType(target.getUserType())
                            .title(content.getTitle())
                            .message(content.getMessage())
                            .type(content.getType())
                            .link(content.getLink())
                            .build();

                    notificationService.createNotification(request);
                    log.debug("Created notification for user {} (type: {})",
                            target.getUserId(), target.getUserType());

                } catch (Exception e) {
                    log.error("Failed to create notification for user {}: {}",
                            target.getUserId(), e.getMessage());
                }
            }

            log.info("Successfully processed notification event: {}", event.getEventType());

        } catch (Exception e) {
            log.error("Failed to process notification event {}: {}",
                    event.getEventType(), e.getMessage(), e);
        }
    }

    /**
     * Listen to reservation events
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReservationEvent(ReservationEvent event) {
        log.info("Processing reservation event: {} for reservation {}",
                event.getEventType(), event.getReservationId());

        try {
            // Fetch reservation details
            Reservation reservation = reservationRepository.findById(event.getReservationId())
                    .orElse(null);

            if (reservation == null) {
                log.warn("Reservation {} not found for notification", event.getReservationId());
                return;
            }

            // Build additional data
            Map<String, Object> data = new HashMap<>();
            data.put("reservationId", reservation.getReservationId());
            data.put("guestName", getGuestName(reservation.getGuest()));
            data.put("checkInDate", reservation.getCheckInDate());
            data.put("checkOutDate", reservation.getCheckOutDate());
            data.put("roomCount", reservation.getRooms() != null ? reservation.getRooms().size() : 0);
            data.put("status", event.getNewStatus() != null ? event.getNewStatus().name() : "");

            // Get notification targets based on event type
            List<NotificationEvent.NotificationTarget> targets = getTargetsForReservationEvent(
                    event.getEventType(), reservation);

            if (!targets.isEmpty()) {
                // Create notification event
                NotificationEvent notificationEvent = NotificationEvent.builder()
                        .eventType(event.getEventType())
                        .entityType("RESERVATION")
                        .entityId(event.getReservationId())
                        .additionalData(data)
                        .targets(targets)
                        .build();

                handleNotificationEvent(notificationEvent);
            }

        } catch (Exception e) {
            log.error("Failed to process reservation event: {}", e.getMessage(), e);
        }
    }

    /**
     * Determine notification targets based on reservation event type
     */
    private List<NotificationEvent.NotificationTarget> getTargetsForReservationEvent(
            String eventType, Reservation reservation) {

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();

        switch (eventType) {
            case "CREATED":
            case "RESERVATION_CREATED":
                // Notify guest, receptionists, and managers
                if (reservation.getGuest() != null) {
                    targets.add(createTarget(
                            Long.parseLong(reservation.getGuest().getGuestId()),
                            UserType.GUEST
                    ));
                }
                targets.addAll(getReceptionistTargets());
                targets.addAll(getManagerTargets());
                break;

            case "CONFIRMED":
            case "RESERVATION_CONFIRMED":
                // Notify guest and receptionists
                if (reservation.getGuest() != null) {
                    targets.add(createTarget(
                            Long.parseLong(reservation.getGuest().getGuestId()),
                            UserType.GUEST
                    ));
                }
                targets.addAll(getReceptionistTargets());
                break;

            case "CANCELLED":
            case "AUTO_CANCELLED_UNCONFIRMED":
            case "STALE_CANCELLED":
                // Notify guest, receptionists, and managers
                if (reservation.getGuest() != null) {
                    targets.add(createTarget(
                            Long.parseLong(reservation.getGuest().getGuestId()),
                            UserType.GUEST
                    ));
                }
                targets.addAll(getReceptionistTargets());
                targets.addAll(getManagerTargets());
                break;

            case "CHECKED_IN":
            case "AUTO_CHECKED_IN":
                // Notify guest, receptionists, and managers
                if (reservation.getGuest() != null) {
                    targets.add(createTarget(
                            Long.parseLong(reservation.getGuest().getGuestId()),
                            UserType.GUEST
                    ));
                }
                targets.addAll(getReceptionistTargets());
                targets.addAll(getManagerTargets());
                break;

            case "CHECKED_OUT":
            case "AUTO_CHECKED_OUT":
                // Notify guest and receptionists
                if (reservation.getGuest() != null) {
                    targets.add(createTarget(
                            Long.parseLong(reservation.getGuest().getGuestId()),
                            UserType.GUEST
                    ));
                }
                targets.addAll(getReceptionistTargets());
                break;

            case "NO_SHOW":
                // Notify managers and receptionists only
                targets.addAll(getReceptionistTargets());
                targets.addAll(getManagerTargets());
                break;

            default:
                log.warn("Unknown reservation event type: {}", eventType);
        }

        return targets;
    }

    // Helper methods to get staff targets

    private List<NotificationEvent.NotificationTarget> getReceptionistTargets() {
        return receptionistRepository.findAll().stream()
                .filter(r -> r.getUser() != null && r.getUser().isActive())
                .map(r -> createTarget(r.getUser().getId(), UserType.STAFF))
                .collect(Collectors.toList());
    }

    private List<NotificationEvent.NotificationTarget> getManagerTargets() {
        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();

        // Service Managers
        targets.addAll(serviceManagerRepository.findAll().stream()
                .filter(m -> m.getUser() != null && m.getUser().isActive())
                .map(m -> createTarget(m.getUser().getId(), UserType.STAFF))
                .collect(Collectors.toList()));

        // Operational Managers
        targets.addAll(operationalManagerRepository.findAll().stream()
                .filter(m -> m.getUser() != null && m.getUser().isActive())
                .map(m -> createTarget(m.getUser().getId(), UserType.STAFF))
                .collect(Collectors.toList()));

        return targets;
    }

    private List<NotificationEvent.NotificationTarget> getServiceManagerTargets() {
        return serviceManagerRepository.findAll().stream()
                .filter(m -> m.getUser() != null && m.getUser().isActive())
                .map(m -> createTarget(m.getUser().getId(), UserType.STAFF))
                .collect(Collectors.toList());
    }

    private List<NotificationEvent.NotificationTarget> getAdminTargets() {
        return systemAdminRepository.findAll().stream()
                .filter(a -> a.getUser() != null && a.getUser().isActive())
                .map(a -> createTarget(a.getUser().getId(), UserType.STAFF))
                .collect(Collectors.toList());
    }

    private NotificationEvent.NotificationTarget createTarget(Long userId, UserType userType) {
        return NotificationEvent.NotificationTarget.builder()
                .userId(userId)
                .userType(userType)
                .build();
    }

    private String getGuestName(Guest guest) {
        if (guest == null) return "Guest";
        return guest.getFirstName() + " " + guest.getLastName();
    }
}