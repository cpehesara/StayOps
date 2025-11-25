package com.example.stayops.controller;

import com.example.stayops.dto.PaymentTransactionDTO;
import com.example.stayops.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentTransactionDTO> initiatePayment(@RequestBody PaymentTransactionDTO request) {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<PaymentTransactionDTO> processWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Signature") String signature) {
        return ResponseEntity.ok(paymentService.processWebhook(payload, signature));
    }

    @GetMapping("/idempotency/{key}")
    public ResponseEntity<PaymentTransactionDTO> getByIdempotencyKey(@PathVariable String key) {
        return ResponseEntity.ok(paymentService.getByIdempotencyKey(key));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<PaymentTransactionDTO>> getReservationPayments(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paymentService.getPaymentsByReservation(reservationId));
    }

    @PostMapping("/{transactionId}/refund")
    public ResponseEntity<PaymentTransactionDTO> initiateRefund(
            @PathVariable Long transactionId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(paymentService.initiateRefund(transactionId, amount, reason));
    }

    @PostMapping("/{transactionId}/capture")
    public ResponseEntity<PaymentTransactionDTO> capturePayment(@PathVariable Long transactionId) {
        return ResponseEntity.ok(paymentService.capturePayment(transactionId));
    }

    @PostMapping("/process-timeouts")
    public ResponseEntity<Integer> processTimeouts(@RequestParam(defaultValue = "30") int timeoutMinutes) {
        int processed = paymentService.processTimeoutPayments(timeoutMinutes);
        return ResponseEntity.ok(processed);
    }
}