package com.example.stayops.automation;

import com.example.stayops.entity.PaymentTransaction;
import com.example.stayops.event.PaymentEvent;
import com.example.stayops.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionListener {

    private final FraudDetectionService fraudDetectionService;
    private final PaymentTransactionRepository paymentRepository;

    @Async
    @EventListener
    @Transactional
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Fraud detection triggered for payment event: {}", event.getEventType());

        try {
            PaymentTransaction payment = paymentRepository.findById(event.getPaymentId())
                    .orElseThrow(() -> new RuntimeException("Payment not found: " + event.getPaymentId()));

            fraudDetectionService.checkPaymentFraud(payment);

        } catch (Exception e) {
            log.error("Error in fraud detection for payment {}: {}",
                    event.getPaymentId(), e.getMessage(), e);
        }
    }
}