package com.example.stayops.service;

import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.entity.GuestFolio;
import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.GuestFolioRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.service.impl.BillingServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service responsible for automated billing operations
 * Handles reservation lifecycle billing automation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingAutomationService {

    private final BillingServiceImpl billingService;
    private final ReservationRepository reservationRepository;
    private final GuestFolioRepository folioRepository;
    private final EmailService emailService;

    /**
     * Automatically creates folio when reservation is created
     * Adds 10% advance deposit
     */
    @Transactional
    public GuestFolioDTO autoCreateFolioOnReservation(Long reservationId) {
        log.info("AUTO: Creating folio for new reservation: {}", reservationId);

        try {
            GuestFolioDTO folio = billingService.createFolioForReservation(reservationId);
            log.info("AUTO: Folio {} created successfully for reservation {}",
                    folio.getFolioNumber(), reservationId);

            // Send confirmation email with deposit information
            sendDepositConfirmationEmail(reservationId);

            return folio;
        } catch (Exception e) {
            log.error("AUTO: Failed to create folio for reservation {}: {}",
                    reservationId, e.getMessage(), e);
            throw new RuntimeException("Automated folio creation failed", e);
        }
    }

    /**
     * Automatically updates folio when guest checks in
     * Converts 10% deposit to full room charges
     */
    @Transactional
    public void autoUpdateFolioOnCheckIn(Long reservationId) {
        log.info("AUTO: Updating folio on check-in for reservation: {}", reservationId);

        try {
            billingService.updateFolioOnCheckIn(reservationId);
            log.info("AUTO: Folio updated to full charges for reservation: {}", reservationId);

            // Send check-in welcome email with billing info
            sendCheckInBillingEmail(reservationId);

        } catch (Exception e) {
            log.error("AUTO: Failed to update folio on check-in for reservation {}: {}",
                    reservationId, e.getMessage(), e);
            throw new RuntimeException("Automated check-in billing update failed", e);
        }
    }

    /**
     * Automatically adds service charges when service request is completed
     */
    @Transactional
    public void autoAddServiceCharge(Long reservationId, Long serviceRequestId,
                                     String serviceType, java.math.BigDecimal amount) {
        log.info("AUTO: Adding service charge for reservation {}: {} - ${}",
                reservationId, serviceType, amount);

        try {
            billingService.addServiceCharge(reservationId, serviceRequestId, serviceType, amount);
            log.info("AUTO: Service charge added successfully for reservation: {}", reservationId);

        } catch (Exception e) {
            log.error("AUTO: Failed to add service charge for reservation {}: {}",
                    reservationId, e.getMessage(), e);
            // Don't throw - log and continue, service charge can be added manually
        }
    }

    /**
     * Automatically posts daily room charges at midnight for checked-in guests
     * Should be called by scheduler
     */
    @Transactional
    public int autoPostDailyRoomCharges(LocalDate date) {
        log.info("AUTO: Posting daily room charges for date: {}", date);

        List<Reservation> checkedInReservations = reservationRepository
                .findByStatusAndCheckInDateLessThanEqualAndCheckOutDateGreaterThan(
                        ReservationStatus.CHECKED_IN, date, date);

        int posted = 0;
        for (Reservation reservation : checkedInReservations) {
            try {
                billingService.addDailyRoomCharge(reservation.getReservationId(), date);
                posted++;
                log.debug("AUTO: Daily charge posted for reservation: {}",
                        reservation.getReservationId());
            } catch (Exception e) {
                log.error("AUTO: Failed to post daily charge for reservation {}: {}",
                        reservation.getReservationId(), e.getMessage());
            }
        }

        log.info("AUTO: Posted daily charges for {} reservations", posted);
        return posted;
    }

    /**
     * Automatically sends invoice email at midnight on checkout date
     * Should be called by scheduler at midnight
     */
    @Transactional
    public int autoSendCheckoutInvoices(LocalDate checkoutDate) {
        log.info("AUTO: Sending checkout invoices for date: {}", checkoutDate);

        List<Reservation> checkouts = reservationRepository
                .findByCheckOutDate(checkoutDate);

        int sent = 0;
        for (Reservation reservation : checkouts) {
            try {
                // Only send if guest is checked in or checked out
                if (reservation.getStatus() == ReservationStatus.CHECKED_IN ||
                        reservation.getStatus() == ReservationStatus.CHECKED_OUT) {

                    billingService.sendBillToGuest(reservation.getReservationId());
                    sent++;
                    log.info("AUTO: Checkout invoice sent for reservation: {}",
                            reservation.getReservationId());
                }
            } catch (Exception e) {
                log.error("AUTO: Failed to send checkout invoice for reservation {}: {}",
                        reservation.getReservationId(), e.getMessage());
            }
        }

        log.info("AUTO: Sent {} checkout invoices", sent);
        return sent;
    }

    /**
     * Handles late checkout charges
     */
    @Transactional
    public void autoAddLateCheckoutCharge(Long reservationId, int hoursLate) {
        log.info("AUTO: Adding late checkout charge for reservation {}: {} hours",
                reservationId, hoursLate);

        try {
            java.math.BigDecimal lateCheckoutFee = calculateLateCheckoutFee(hoursLate);

            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                    .orElseThrow(() -> new RuntimeException("Folio not found"));

            billingService.addCharge(
                    folio.getId(),
                    "LATE_CHECKOUT",
                    String.format("Late Checkout Fee (%d hours)", hoursLate),
                    lateCheckoutFee,
                    1,
                    "FRONT_DESK"
            );

            log.info("AUTO: Late checkout charge of ${} added for reservation: {}",
                    lateCheckoutFee, reservationId);

        } catch (Exception e) {
            log.error("AUTO: Failed to add late checkout charge for reservation {}: {}",
                    reservationId, e.getMessage());
        }
    }

    /**
     * Handles no-show charges
     */
    @Transactional
    public void autoAddNoShowCharge(Long reservationId) {
        log.info("AUTO: Adding no-show charge for reservation: {}", reservationId);

        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                    .orElseThrow(() -> new RuntimeException("Folio not found"));

            // Typically charge one night for no-show
            java.math.BigDecimal noShowFee = reservation.getRooms().stream()
                    .map(room -> java.math.BigDecimal.valueOf(room.getPricePerNight()))
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            billingService.addCharge(
                    folio.getId(),
                    "NO_SHOW_FEE",
                    "No-Show Fee (One night charge)",
                    noShowFee,
                    1,
                    "FRONT_DESK"
            );

            log.info("AUTO: No-show charge of ${} added for reservation: {}",
                    noShowFee, reservationId);

            // Send no-show notification email
            sendNoShowNotificationEmail(reservationId, noShowFee);

        } catch (Exception e) {
            log.error("AUTO: Failed to add no-show charge for reservation {}: {}",
                    reservationId, e.getMessage());
        }
    }

    /**
     * Sends payment reminders for outstanding balances
     */
    @Transactional(readOnly = true)
    public int autoSendPaymentReminders() {
        log.info("AUTO: Sending payment reminders for outstanding balances");

        List<GuestFolio> foliosWithBalance = folioRepository
                .findOpenFoliosWithBalance();

        int sent = 0;
        for (GuestFolio folio : foliosWithBalance) {
            try {
                // Only send reminder if checkout is approaching or passed
                if (LocalDate.now().isAfter(folio.getReservation().getCheckOutDate().minusDays(1))) {
                    sendPaymentReminderEmail(folio);
                    sent++;
                    log.debug("AUTO: Payment reminder sent for folio: {}", folio.getFolioNumber());
                }
            } catch (Exception e) {
                log.error("AUTO: Failed to send payment reminder for folio {}: {}",
                        folio.getFolioNumber(), e.getMessage());
            }
        }

        log.info("AUTO: Sent {} payment reminders", sent);
        return sent;
    }

    /**
     * Handles early checkout adjustments
     */
    @Transactional
    public void autoAdjustForEarlyCheckout(Long reservationId, LocalDate actualCheckoutDate) {
        log.info("AUTO: Adjusting billing for early checkout - reservation: {}, actual date: {}",
                reservationId, actualCheckoutDate);

        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                    .orElseThrow(() -> new RuntimeException("Folio not found"));

            // Calculate nights not used
            long unusedNights = java.time.temporal.ChronoUnit.DAYS.between(
                    actualCheckoutDate, reservation.getCheckOutDate());

            if (unusedNights > 0) {
                // Add credit for unused nights (with cancellation policy applied)
                java.math.BigDecimal creditAmount = calculateEarlyCheckoutCredit(
                        reservation, (int) unusedNights);

                if (creditAmount.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    billingService.addCharge(
                            folio.getId(),
                            "EARLY_CHECKOUT_CREDIT",
                            String.format("Early Checkout Credit (%d unused nights)", unusedNights),
                            creditAmount.negate(), // Negative amount for credit
                            1,
                            "FRONT_DESK"
                    );

                    log.info("AUTO: Early checkout credit of ${} added for reservation: {}",
                            creditAmount, reservationId);
                }
            }

        } catch (Exception e) {
            log.error("AUTO: Failed to adjust for early checkout - reservation {}: {}",
                    reservationId, e.getMessage());
        }
    }

    // Private helper methods

    private java.math.BigDecimal calculateLateCheckoutFee(int hoursLate) {
        // $25 per hour for late checkout
        return java.math.BigDecimal.valueOf(25.00).multiply(
                java.math.BigDecimal.valueOf(hoursLate));
    }

    private java.math.BigDecimal calculateEarlyCheckoutCredit(Reservation reservation, int unusedNights) {
        // 50% refund for unused nights (cancellation policy)
        java.math.BigDecimal totalRate = reservation.getRooms().stream()
                .map(room -> java.math.BigDecimal.valueOf(room.getPricePerNight()))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return totalRate.multiply(java.math.BigDecimal.valueOf(unusedNights))
                .multiply(new java.math.BigDecimal("0.50")); // 50% refund
    }

    private void sendDepositConfirmationEmail(Long reservationId) {
        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                    .orElseThrow(() -> new RuntimeException("Folio not found"));

            String subject = "Reservation Confirmed - Deposit Information";
            String body = String.format("""
                    Dear %s %s,
                    
                    Your reservation has been confirmed!
                    
                    Reservation Details:
                    ─────────────────────────────────
                    Reservation ID: %s
                    Folio Number: %s
                    Check-in: %s
                    Check-out: %s
                    
                    Deposit Amount: $%.2f (10%% advance deposit)
                    ─────────────────────────────────
                    
                    The remaining balance will be charged upon check-in.
                    
                    We look forward to welcoming you!
                    
                    Best regards,
                    Hotel Management Team
                    """,
                    reservation.getGuest().getFirstName(),
                    reservation.getGuest().getLastName(),
                    reservation.getReservationId(),
                    folio.getFolioNumber(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    folio.getDepositAmount()
            );

            emailService.sendEmail(reservation.getGuest().getEmail(), subject, body);
            log.info("Deposit confirmation email sent for reservation: {}", reservationId);

        } catch (Exception e) {
            log.error("Failed to send deposit confirmation email: {}", e.getMessage());
        }
    }

    private void sendCheckInBillingEmail(Long reservationId) {
        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                    .orElseThrow(() -> new RuntimeException("Folio not found"));

            String subject = "Welcome! Check-In Billing Information";
            String body = String.format("""
                    Dear %s %s,
                    
                    Welcome to our hotel!
                    
                    Your billing has been updated with full charges:
                    ─────────────────────────────────
                    Folio Number: %s
                    Total Charges: $%.2f
                    Current Balance: $%.2f
                    ─────────────────────────────────
                    
                    Any additional services will be automatically added to your folio.
                    You can review your charges at the front desk anytime.
                    
                    Enjoy your stay!
                    
                    Best regards,
                    Hotel Management Team
                    """,
                    reservation.getGuest().getFirstName(),
                    reservation.getGuest().getLastName(),
                    folio.getFolioNumber(),
                    folio.getTotalCharges(),
                    folio.getBalance()
            );

            emailService.sendEmail(reservation.getGuest().getEmail(), subject, body);
            log.info("Check-in billing email sent for reservation: {}", reservationId);

        } catch (Exception e) {
            log.error("Failed to send check-in billing email: {}", e.getMessage());
        }
    }

    private void sendNoShowNotificationEmail(Long reservationId, java.math.BigDecimal noShowFee) {
        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            String subject = "No-Show Fee Applied - Reservation #" + reservationId;
            String body = String.format("""
                    Dear %s %s,
                    
                    We noticed you did not check in for your reservation.
                    
                    As per our cancellation policy, a no-show fee has been applied:
                    ─────────────────────────────────
                    No-Show Fee: $%.2f
                    ─────────────────────────────────
                    
                    If you believe this was applied in error, please contact us immediately.
                    
                    Best regards,
                    Hotel Management Team
                    """,
                    reservation.getGuest().getFirstName(),
                    reservation.getGuest().getLastName(),
                    noShowFee
            );

            emailService.sendEmail(reservation.getGuest().getEmail(), subject, body);
            log.info("No-show notification sent for reservation: {}", reservationId);

        } catch (Exception e) {
            log.error("Failed to send no-show notification: {}", e.getMessage());
        }
    }

    private void sendPaymentReminderEmail(GuestFolio folio) {
        try {
            Reservation reservation = folio.getReservation();

            String subject = "Payment Reminder - Outstanding Balance";
            String body = String.format("""
                    Dear %s %s,
                    
                    This is a friendly reminder that you have an outstanding balance on your account.
                    
                    Account Summary:
                    ─────────────────────────────────
                    Folio Number: %s
                    Total Charges: $%.2f
                    Payments Made: $%.2f
                    Outstanding Balance: $%.2f
                    ─────────────────────────────────
                    
                    Please settle your balance at your earliest convenience.
                    
                    If you have any questions, please contact our front desk.
                    
                    Best regards,
                    Hotel Management Team
                    """,
                    reservation.getGuest().getFirstName(),
                    reservation.getGuest().getLastName(),
                    folio.getFolioNumber(),
                    folio.getTotalCharges(),
                    folio.getTotalPayments(),
                    folio.getBalance()
            );

            emailService.sendEmail(reservation.getGuest().getEmail(), subject, body);
            log.info("Payment reminder sent for folio: {}", folio.getFolioNumber());

        } catch (Exception e) {
            log.error("Failed to send payment reminder: {}", e.getMessage());
        }
    }
}