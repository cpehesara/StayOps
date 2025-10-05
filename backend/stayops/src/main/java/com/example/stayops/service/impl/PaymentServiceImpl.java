package com.example.stayops.service.impl;

import com.example.stayops.dto.PaymentTransactionDTO;
import com.example.stayops.entity.PaymentTransaction;
import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.PaymentStatus;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.event.EventPublisher;
import com.example.stayops.event.PaymentEvent;
import com.example.stayops.repository.PaymentTransactionRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentTransactionRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public PaymentTransactionDTO initiatePayment(PaymentTransactionDTO request) {
        log.info("Initiating payment for reservation: {}", request.getReservationId());

        // Check idempotency
        if (request.getIdempotencyKey() != null) {
            var existing = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Returning existing payment for idempotency key: {}", request.getIdempotencyKey());
                return mapToDTO(existing.get());
            }
        }

        // Generate idempotency key if not provided
        String idempotencyKey = request.getIdempotencyKey() != null
                ? request.getIdempotencyKey()
                : UUID.randomUUID().toString();

        // Fetch reservation
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + request.getReservationId()));

        // Create payment transaction
        PaymentTransaction payment = PaymentTransaction.builder()
                .reservation(reservation)
                .idempotencyKey(idempotencyKey)
                .paymentIntentId(request.getPaymentIntentId())
                .status(PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .cardToken(request.getCardToken())
                .notes(request.getNotes())
                .isRefund(false)
                .build();

        PaymentTransaction saved = paymentRepository.save(payment);

        log.info("Payment initiated with ID: {} for reservation: {}",
                saved.getId(), request.getReservationId());

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public PaymentTransactionDTO processWebhook(String webhookPayload, String signature) {
        log.info("Processing payment webhook");

        // Validate webhook signature
        if (!validateWebhookSignature(webhookPayload, signature)) {
            log.error("Invalid webhook signature");
            throw new SecurityException("Invalid webhook signature");
        }

        try {
            // Parse webhook payload
            JsonNode payloadNode = objectMapper.readTree(webhookPayload);

            String transactionId = payloadNode.path("transaction_id").asText();
            String status = payloadNode.path("status").asText();
            String failureReason = payloadNode.path("failure_reason").asText(null);

            PaymentTransaction payment = paymentRepository
                    .findByProviderTransactionId(transactionId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Payment not found: " + transactionId));

            PaymentStatus oldStatus = payment.getStatus();

            // Update payment status based on webhook
            switch (status.toLowerCase()) {
                case "succeeded":
                case "captured":
                    payment.setStatus(PaymentStatus.CAPTURED);
                    payment.setProcessedAt(Instant.now());
                    payment.setProcessedBy("WEBHOOK");
                    break;
                case "authorized":
                    payment.setStatus(PaymentStatus.AUTHORIZED);
                    break;
                case "failed":
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setFailureReason(failureReason);
                    break;
                case "refunded":
                    payment.setStatus(PaymentStatus.REFUNDED);
                    break;
                default:
                    log.warn("Unknown payment status: {}", status);
                    payment.setStatus(PaymentStatus.PENDING);
            }

            payment.setWebhookPayload(webhookPayload);
            PaymentTransaction saved = paymentRepository.save(payment);

            // Publish payment event for other automations
            String eventType = saved.getStatus() == PaymentStatus.CAPTURED ? "SUCCESS" :
                    saved.getStatus() == PaymentStatus.FAILED ? "FAILED" :
                            saved.getStatus() == PaymentStatus.AUTHORIZED ? "AUTHORIZED" : "UPDATED";

            eventPublisher.publishPaymentEvent(PaymentEvent.builder()
                    .paymentId(saved.getId())
                    .reservationId(saved.getReservation().getReservationId())
                    .status(saved.getStatus())
                    .amount(saved.getAmount())
                    .eventType(eventType)
                    .eventTime(Instant.now())
                    .providerTransactionId(saved.getProviderTransactionId())
                    .build());

            log.info("Payment webhook processed: {} -> {} for transaction {}",
                    oldStatus, saved.getStatus(), transactionId);

            return mapToDTO(saved);

        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process webhook", e);
        }
    }

    private boolean validateWebhookSignature(String payload, String signature) {
        try {
            // Use a webhook secret from configuration
            String webhookSecret = "your-webhook-secret"; // TODO: Move to config

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hash);

            return calculatedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Error validating webhook signature: {}", e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentTransactionDTO getByIdempotencyKey(String idempotencyKey) {
        PaymentTransaction payment = paymentRepository.findByIdempotencyKey(idempotencyKey)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found for key: " + idempotencyKey));
        return mapToDTO(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionDTO> getPaymentsByReservation(Long reservationId) {
        return paymentRepository.findByReservationReservationId(reservationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentTransactionDTO initiateRefund(Long transactionId, BigDecimal amount, String reason) {
        log.info("Initiating refund for transaction: {}", transactionId);

        PaymentTransaction originalPayment = paymentRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found: " + transactionId));

        if (originalPayment.getStatus() != PaymentStatus.CAPTURED) {
            throw new IllegalStateException("Can only refund captured payments");
        }

        // Create refund transaction
        PaymentTransaction refund = PaymentTransaction.builder()
                .reservation(originalPayment.getReservation())
                .idempotencyKey(UUID.randomUUID().toString())
                .status(PaymentStatus.PENDING)
                .paymentMethod(originalPayment.getPaymentMethod())
                .amount(amount)
                .currency(originalPayment.getCurrency())
                .isRefund(true)
                .refundOfTransaction(originalPayment)
                .notes(reason)
                .build();

        PaymentTransaction saved = paymentRepository.save(refund);

        // Update original payment's refunded amount
        BigDecimal currentRefunded = originalPayment.getRefundedAmount() != null
                ? originalPayment.getRefundedAmount()
                : BigDecimal.ZERO;
        originalPayment.setRefundedAmount(currentRefunded.add(amount));

        if (originalPayment.getRefundedAmount().compareTo(originalPayment.getAmount()) >= 0) {
            originalPayment.setStatus(PaymentStatus.REFUNDED);
        } else {
            originalPayment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        paymentRepository.save(originalPayment);

        // Publish refund event
        eventPublisher.publishPaymentEvent(PaymentEvent.builder()
                .paymentId(saved.getId())
                .reservationId(saved.getReservation().getReservationId())
                .status(saved.getStatus())
                .amount(saved.getAmount())
                .eventType("REFUNDED")
                .eventTime(Instant.now())
                .build());

        log.info("Refund initiated with ID: {}", saved.getId());
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public int processTimeoutPayments(int timeoutMinutes) {
        log.info("Processing timeout payments (timeout: {} minutes)", timeoutMinutes);

        Instant threshold = Instant.now().minus(Duration.ofMinutes(timeoutMinutes));
        List<PaymentTransaction> timedOutPayments = paymentRepository.findPendingPaymentsOlderThan(threshold);

        for (PaymentTransaction payment : timedOutPayments) {
            payment.setStatus(PaymentStatus.TIMEOUT);
            payment.setFailureReason("Payment timed out after " + timeoutMinutes + " minutes");

            eventPublisher.publishPaymentEvent(PaymentEvent.builder()
                    .paymentId(payment.getId())
                    .reservationId(payment.getReservation().getReservationId())
                    .status(PaymentStatus.TIMEOUT)
                    .amount(payment.getAmount())
                    .eventType("FAILED")
                    .eventTime(Instant.now())
                    .build());

            log.info("Payment {} timed out", payment.getId());
        }

        paymentRepository.saveAll(timedOutPayments);

        log.info("Processed {} timeout payments", timedOutPayments.size());
        return timedOutPayments.size();
    }

    @Override
    @Transactional
    public PaymentTransactionDTO capturePayment(Long transactionId) {
        log.info("Capturing payment: {}", transactionId);

        PaymentTransaction payment = paymentRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found: " + transactionId));

        if (payment.getStatus() != PaymentStatus.AUTHORIZED) {
            throw new IllegalStateException("Can only capture authorized payments");
        }

        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setProcessedAt(Instant.now());
        payment.setProcessedBy("System");

        PaymentTransaction saved = paymentRepository.save(payment);

        // Publish success event
        eventPublisher.publishPaymentEvent(PaymentEvent.builder()
                .paymentId(saved.getId())
                .reservationId(saved.getReservation().getReservationId())
                .status(PaymentStatus.CAPTURED)
                .amount(saved.getAmount())
                .eventType("SUCCESS")
                .eventTime(Instant.now())
                .providerTransactionId(saved.getProviderTransactionId())
                .build());

        log.info("Payment {} captured successfully", transactionId);
        return mapToDTO(saved);
    }

    private PaymentTransactionDTO mapToDTO(PaymentTransaction entity) {
        return PaymentTransactionDTO.builder()
                .id(entity.getId())
                .reservationId(entity.getReservation() != null ? entity.getReservation().getReservationId() : null)
                .idempotencyKey(entity.getIdempotencyKey())
                .providerTransactionId(entity.getProviderTransactionId())
                .paymentIntentId(entity.getPaymentIntentId())
                .status(entity.getStatus())
                .paymentMethod(entity.getPaymentMethod())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .cardLast4(entity.getCardLast4())
                .cardBrand(entity.getCardBrand())
                .cardToken(entity.getCardToken())
                .failureReason(entity.getFailureReason())
                .processedAt(entity.getProcessedAt())
                .processedBy(entity.getProcessedBy())
                .notes(entity.getNotes())
                .isRefund(entity.getIsRefund())
                .refundOfTransactionId(entity.getRefundOfTransaction() != null ? entity.getRefundOfTransaction().getId() : null)
                .refundedAmount(entity.getRefundedAmount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}