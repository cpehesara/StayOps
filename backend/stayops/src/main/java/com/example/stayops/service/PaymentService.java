package com.example.stayops.service;

import com.example.stayops.dto.PaymentTransactionDTO;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {

    /**
     * Initiate a payment transaction with idempotency
     */
    PaymentTransactionDTO initiatePayment(PaymentTransactionDTO request);

    /**
     * Process payment webhook (from payment provider)
     */
    PaymentTransactionDTO processWebhook(String webhookPayload, String signature);

    /**
     * Get payment by idempotency key (prevents duplicates)
     */
    PaymentTransactionDTO getByIdempotencyKey(String idempotencyKey);

    /**
     * Get all payments for a reservation
     */
    List<PaymentTransactionDTO> getPaymentsByReservation(Long reservationId);

    /**
     * Initiate refund
     */
    PaymentTransactionDTO initiateRefund(Long transactionId, BigDecimal amount, String reason);

    /**
     * Process timeout for pending payments (called by scheduler)
     */
    int processTimeoutPayments(int timeoutMinutes);

    /**
     * Capture authorized payment
     */
    PaymentTransactionDTO capturePayment(Long transactionId);
}