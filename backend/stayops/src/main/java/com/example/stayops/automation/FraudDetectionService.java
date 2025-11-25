package com.example.stayops.automation;

import com.example.stayops.entity.FraudAlert;
import com.example.stayops.entity.PaymentTransaction;
import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.PaymentStatus;
import com.example.stayops.repository.FraudAlertRepository;
import com.example.stayops.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionService {

    private final FraudAlertRepository fraudAlertRepository;
    private final PaymentTransactionRepository paymentRepository;

    // Thresholds
    private static final int FAILED_PAYMENT_THRESHOLD = 3;
    private static final int VELOCITY_CHECK_HOURS = 24;
    private static final int MAX_BOOKINGS_PER_DAY = 5;

    @Transactional
    public void checkPaymentFraud(PaymentTransaction payment) {
        log.info("Running fraud detection for payment: {}", payment.getId());

        Reservation reservation = payment.getReservation();
        String guestEmail = reservation.getGuest() != null ?
                reservation.getGuest().getEmail() : null;

        if (guestEmail == null) {
            log.warn("Cannot perform fraud check - no guest email");
            return;
        }

        // Check 1: Multiple failed payments
        checkMultipleFailedPayments(payment, reservation, guestEmail);

        // Check 2: Velocity check (too many bookings in short time)
        checkVelocity(reservation, guestEmail);

        // Check 3: Suspicious patterns (same card, different names)
        checkSuspiciousPatterns(payment, reservation, guestEmail);
    }

    private void checkMultipleFailedPayments(PaymentTransaction payment,
                                             Reservation reservation,
                                             String guestEmail) {

        if (payment.getStatus() != PaymentStatus.FAILED) {
            return;
        }

        Instant last24Hours = Instant.now().minus(Duration.ofHours(24));

        List<PaymentTransaction> recentPayments = paymentRepository
                .findByReservationReservationId(reservation.getReservationId());

        long failedCount = recentPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED &&
                        p.getCreatedAt().isAfter(last24Hours))
                .count();

        if (failedCount >= FAILED_PAYMENT_THRESHOLD) {
            int riskScore = calculateRiskScore((int) failedCount, FAILED_PAYMENT_THRESHOLD);

            FraudAlert alert = FraudAlert.builder()
                    .reservation(reservation)
                    .guestEmail(guestEmail)
                    .alertType("MULTIPLE_FAILED_CARDS")
                    .severity(riskScore > 70 ? "HIGH" : "MEDIUM")
                    .status("PENDING")
                    .riskScore(riskScore)
                    .details(String.format("Guest has %d failed payment attempts in last 24 hours",
                            failedCount))
                    .build();

            fraudAlertRepository.save(alert);

            log.warn("FRAUD ALERT: Multiple failed payments for guest {} - {} attempts",
                    guestEmail, failedCount);
        }
    }

    private void checkVelocity(Reservation reservation, String guestEmail) {
        Instant last24Hours = Instant.now().minus(Duration.ofHours(VELOCITY_CHECK_HOURS));

        long recentAlerts = fraudAlertRepository.countRecentAlertsByEmail(guestEmail, last24Hours);

        // Simple velocity check - in real implementation, check actual reservation count
        if (recentAlerts >= MAX_BOOKINGS_PER_DAY) {
            int riskScore = calculateRiskScore((int) recentAlerts, MAX_BOOKINGS_PER_DAY);

            FraudAlert alert = FraudAlert.builder()
                    .reservation(reservation)
                    .guestEmail(guestEmail)
                    .alertType("VELOCITY_CHECK")
                    .severity(riskScore > 80 ? "CRITICAL" : "HIGH")
                    .status("PENDING")
                    .riskScore(riskScore)
                    .details(String.format("Suspicious velocity: %d bookings/alerts in %d hours",
                            recentAlerts, VELOCITY_CHECK_HOURS))
                    .build();

            fraudAlertRepository.save(alert);

            log.warn("FRAUD ALERT: Velocity check failed for guest {} - {} attempts in {}h",
                    guestEmail, recentAlerts, VELOCITY_CHECK_HOURS);
        }
    }

    private void checkSuspiciousPatterns(PaymentTransaction payment,
                                         Reservation reservation,
                                         String guestEmail) {

        // Check if same card used with multiple different emails
        if (payment.getCardToken() != null) {
            // This would require tracking card tokens across reservations
            // Simplified version here
            log.debug("Checking suspicious patterns for card token: {}",
                    payment.getCardToken());
        }
    }

    @Transactional
    public void checkIPFraud(String ipAddress, Reservation reservation) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return;
        }

        Instant last24Hours = Instant.now().minus(Duration.ofHours(24));
        long recentIPAlerts = fraudAlertRepository.countRecentAlertsByIP(ipAddress, last24Hours);

        if (recentIPAlerts >= 5) {
            FraudAlert alert = FraudAlert.builder()
                    .reservation(reservation)
                    .ipAddress(ipAddress)
                    .alertType("IP_MISMATCH")
                    .severity("HIGH")
                    .status("PENDING")
                    .riskScore(75)
                    .details(String.format("Multiple bookings from same IP: %s (%d in 24h)",
                            ipAddress, recentIPAlerts))
                    .build();

            fraudAlertRepository.save(alert);

            log.warn("FRAUD ALERT: IP fraud detected for IP {} - {} bookings",
                    ipAddress, recentIPAlerts);
        }
    }

    private int calculateRiskScore(int actual, int threshold) {
        // Simple risk score: (actual / threshold) * 100, capped at 100
        return Math.min(100, (actual * 100) / threshold);
    }

    @Transactional(readOnly = true)
    public List<FraudAlert> getPendingAlerts() {
        return fraudAlertRepository.findByStatus("PENDING");
    }

    @Transactional(readOnly = true)
    public List<FraudAlert> getHighRiskAlerts() {
        return fraudAlertRepository.findBySeverityAndStatus("HIGH", "PENDING");
    }
}