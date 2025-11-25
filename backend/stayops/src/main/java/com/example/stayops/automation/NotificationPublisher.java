package com.example.stayops.automation;

import com.example.stayops.entity.*;
import com.example.stayops.enums.UserType;
import com.example.stayops.event.NotificationEvent;
import com.example.stayops.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service to publish notification events for various system actions
 * Call methods from this service anywhere in your code to trigger notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final ApplicationEventPublisher eventPublisher;
    private final SystemAdminRepository systemAdminRepository;
    private final ServiceManagerRepository serviceManagerRepository;
    private final OperationalManagerRepository operationalManagerRepository;
    private final ReceptionistRepository receptionistRepository;

    // ========== RESERVATION NOTIFICATIONS ==========

    public void notifyReservationCreated(Reservation reservation) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", reservation.getReservationId());
        data.put("guestName", getGuestName(reservation.getGuest()));
        data.put("checkInDate", reservation.getCheckInDate());
        data.put("checkOutDate", reservation.getCheckOutDate());
        data.put("roomCount", reservation.getRooms() != null ? reservation.getRooms().size() : 0);

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();

        // Notify guest
        if (reservation.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(reservation.getGuest().getGuestId()), UserType.GUEST));
        }

        // Notify receptionists and managers
        targets.addAll(getReceptionistTargets());
        targets.addAll(getManagerTargets());

        publishEvent("RESERVATION_CREATED", data, targets);
    }

    public void notifyReservationConfirmed(Reservation reservation) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", reservation.getReservationId());
        data.put("guestName", getGuestName(reservation.getGuest()));
        data.put("checkInDate", reservation.getCheckInDate());
        data.put("checkOutDate", reservation.getCheckOutDate());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (reservation.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(reservation.getGuest().getGuestId()), UserType.GUEST));
        }
        targets.addAll(getReceptionistTargets());

        publishEvent("RESERVATION_CONFIRMED", data, targets);
    }

    public void notifyReservationCancelled(Reservation reservation, String reason) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", reservation.getReservationId());
        data.put("guestName", getGuestName(reservation.getGuest()));
        data.put("reason", reason);

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (reservation.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(reservation.getGuest().getGuestId()), UserType.GUEST));
        }
        targets.addAll(getReceptionistTargets());
        targets.addAll(getManagerTargets());

        publishEvent("RESERVATION_CANCELLED", data, targets);
    }

    public void notifyReservationCheckedIn(Reservation reservation, String roomNumbers) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", reservation.getReservationId());
        data.put("guestName", getGuestName(reservation.getGuest()));
        data.put("roomNumber", roomNumbers);

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (reservation.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(reservation.getGuest().getGuestId()), UserType.GUEST));
        }
        targets.addAll(getReceptionistTargets());
        targets.addAll(getManagerTargets());

        publishEvent("RESERVATION_CHECKED_IN", data, targets);
    }

    public void notifyReservationCheckedOut(Reservation reservation) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", reservation.getReservationId());
        data.put("guestName", getGuestName(reservation.getGuest()));

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (reservation.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(reservation.getGuest().getGuestId()), UserType.GUEST));
        }
        targets.addAll(getReceptionistTargets());

        publishEvent("RESERVATION_CHECKED_OUT", data, targets);
    }

    public void notifyReservationNoShow(Reservation reservation) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", reservation.getReservationId());
        data.put("guestName", getGuestName(reservation.getGuest()));

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        targets.addAll(getReceptionistTargets());
        targets.addAll(getManagerTargets());

        publishEvent("RESERVATION_NO_SHOW", data, targets);
    }

    // ========== PAYMENT NOTIFICATIONS ==========

    public void notifyPaymentSuccess(PaymentTransaction payment) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", payment.getReservation().getReservationId());
        data.put("amount", payment.getAmount() + " " + payment.getCurrency());
        data.put("method", payment.getPaymentMethod().name());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (payment.getReservation().getGuest() != null) {
            targets.add(createTarget(
                    Long.parseLong(payment.getReservation().getGuest().getGuestId()),
                    UserType.GUEST
            ));
        }
        targets.addAll(getReceptionistTargets());

        publishEvent("PAYMENT_SUCCESS", data, targets);
    }

    public void notifyPaymentFailed(PaymentTransaction payment) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", payment.getReservation().getReservationId());
        data.put("reason", payment.getFailureReason());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (payment.getReservation().getGuest() != null) {
            targets.add(createTarget(
                    Long.parseLong(payment.getReservation().getGuest().getGuestId()),
                    UserType.GUEST
            ));
        }
        targets.addAll(getManagerTargets());

        publishEvent("PAYMENT_FAILED", data, targets);
    }

    public void notifyPaymentRefunded(PaymentTransaction payment) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservationId", payment.getReservation().getReservationId());
        data.put("amount", payment.getAmount() + " " + payment.getCurrency());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (payment.getReservation().getGuest() != null) {
            targets.add(createTarget(
                    Long.parseLong(payment.getReservation().getGuest().getGuestId()),
                    UserType.GUEST
            ));
        }
        targets.addAll(getManagerTargets());

        publishEvent("PAYMENT_REFUNDED", data, targets);
    }

    // ========== SERVICE REQUEST NOTIFICATIONS ==========

    public void notifyServiceRequestCreated(ServiceRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("requestId", request.getId());
        data.put("type", request.getServiceType());
        data.put("roomNumber", request.getRoom() != null ? request.getRoom().getRoomNumber() : "N/A");

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        targets.addAll(getReceptionistTargets());
        targets.addAll(getManagerTargets());

        publishEvent("SERVICE_REQUEST_CREATED", data, targets);
    }

    public void notifyServiceRequestAssigned(ServiceRequest request, String staffName) {
        Map<String, Object> data = new HashMap<>();
        data.put("requestId", request.getId());
        data.put("staffName", staffName);
        data.put("type", request.getServiceType());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();

        // Notify the guest if there's a reservation
        if (request.getReservation() != null && request.getReservation().getGuest() != null) {
            targets.add(createTarget(
                    Long.parseLong(request.getReservation().getGuest().getGuestId()),
                    UserType.GUEST
            ));
        }

        publishEvent("SERVICE_REQUEST_ASSIGNED", data, targets);
    }

    public void notifyServiceRequestCompleted(ServiceRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("requestId", request.getId());
        data.put("type", request.getServiceType());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();

        // Notify the guest if there's a reservation
        if (request.getReservation() != null && request.getReservation().getGuest() != null) {
            targets.add(createTarget(
                    Long.parseLong(request.getReservation().getGuest().getGuestId()),
                    UserType.GUEST
            ));
        }

        targets.addAll(getManagerTargets());

        publishEvent("SERVICE_REQUEST_COMPLETED", data, targets);
    }

    public void notifyServiceRequestUrgent(ServiceRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("requestId", request.getId());
        data.put("type", request.getServiceType());
        data.put("roomNumber", request.getRoom() != null ? request.getRoom().getRoomNumber() : "N/A");

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        targets.addAll(getManagerTargets());
        targets.addAll(getReceptionistTargets());

        publishEvent("SERVICE_REQUEST_URGENT", data, targets);
    }

    // ========== COMPLAINT NOTIFICATIONS ==========

    public void notifyComplaintSubmitted(Complaint complaint) {
        Map<String, Object> data = new HashMap<>();
        data.put("complaintId", complaint.getId());
        data.put("category", complaint.getCategory().name());
        data.put("guestName", getGuestName(complaint.getGuest()));

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        targets.addAll(getManagerTargets());
        targets.addAll(getServiceManagerTargets());

        publishEvent("COMPLAINT_SUBMITTED", data, targets);
    }

    public void notifyComplaintAcknowledged(Complaint complaint) {
        Map<String, Object> data = new HashMap<>();
        data.put("complaintId", complaint.getId());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (complaint.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(complaint.getGuest().getGuestId()), UserType.GUEST));
        }

        publishEvent("COMPLAINT_ACKNOWLEDGED", data, targets);
    }

    public void notifyComplaintResolved(Complaint complaint) {
        Map<String, Object> data = new HashMap<>();
        data.put("complaintId", complaint.getId());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        if (complaint.getGuest() != null) {
            targets.add(createTarget(Long.parseLong(complaint.getGuest().getGuestId()), UserType.GUEST));
        }
        targets.addAll(getManagerTargets());

        publishEvent("COMPLAINT_RESOLVED", data, targets);
    }

    // ========== COMMUNITY MESSAGE NOTIFICATIONS ==========

    public void notifyCommunityMessagePosted(CommunityMessage message) {
        Map<String, Object> data = new HashMap<>();
        data.put("messageId", message.getId());
        data.put("senderName", message.getSenderName());
        data.put("subject", message.getSubject());

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();

        // If announcement, notify all staff
        if (Boolean.TRUE.equals(message.getIsAnnouncement())) {
            targets.addAll(getReceptionistTargets());
            targets.addAll(getManagerTargets());
            targets.addAll(getAdminTargets());
        }

        publishEvent("COMMUNITY_MESSAGE_POSTED", data, targets);
    }

    public void notifyCommunityMessageReply(CommunityMessage reply, Long parentMessageId) {
        Map<String, Object> data = new HashMap<>();
        data.put("replyId", reply.getId());
        data.put("parentMessageId", parentMessageId);
        data.put("senderName", reply.getSenderName());

        // Notify the original sender
        // This would require fetching the parent message and getting the sender

        publishEvent("COMMUNITY_MESSAGE_REPLY", data, new ArrayList<>());
    }

    // ========== RATING NOTIFICATIONS ==========

    public void notifyRatingSubmitted(Rating rating) {
        Map<String, Object> data = new HashMap<>();
        data.put("ratingId", rating.getId());
        data.put("score", rating.getOverallRating());
        data.put("guestName", rating.getGuest() != null ? getGuestName(rating.getGuest()) : "Guest");

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        targets.addAll(getManagerTargets());

        publishEvent("RATING_SUBMITTED", data, targets);
    }

    // ========== GUEST NOTIFICATIONS ==========

    public void notifyGuestRegistered(Guest guest) {
        Map<String, Object> data = new HashMap<>();
        data.put("guestName", getGuestName(guest));

        List<NotificationEvent.NotificationTarget> targets = new ArrayList<>();
        targets.add(createTarget(Long.parseLong(guest.getGuestId()), UserType.GUEST));

        publishEvent("GUEST_REGISTERED", data, targets);
    }

    // ========== HELPER METHODS ==========

    private void publishEvent(String eventType, Map<String, Object> data,
                              List<NotificationEvent.NotificationTarget> targets) {
        if (targets.isEmpty()) {
            log.warn("No targets found for event: {}", eventType);
            return;
        }

        NotificationEvent event = NotificationEvent.builder()
                .eventType(eventType)
                .additionalData(data)
                .targets(targets)
                .build();

        eventPublisher.publishEvent(event);
        log.info("Published notification event: {} to {} targets", eventType, targets.size());
    }

    private NotificationEvent.NotificationTarget createTarget(Long userId, UserType userType) {
        return NotificationEvent.NotificationTarget.builder()
                .userId(userId)
                .userType(userType)
                .build();
    }

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

    private String getGuestName(Guest guest) {
        if (guest == null) return "Guest";
        return guest.getFirstName() + " " + guest.getLastName();
    }
}