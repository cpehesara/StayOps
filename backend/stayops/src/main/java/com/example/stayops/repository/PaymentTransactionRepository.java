package com.example.stayops.repository;

import com.example.stayops.entity.PaymentTransaction;
import com.example.stayops.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByIdempotencyKey(String idempotencyKey);

    Optional<PaymentTransaction> findByProviderTransactionId(String providerTransactionId);

    Optional<PaymentTransaction> findByPaymentIntentId(String paymentIntentId);

    List<PaymentTransaction> findByReservationReservationId(Long reservationId);

    List<PaymentTransaction> findByStatus(PaymentStatus status);

    // Find pending payments older than threshold (for timeout handling)
    @Query("SELECT p FROM PaymentTransaction p " +
            "WHERE p.status = 'PENDING' " +
            "AND p.createdAt < :threshold")
    List<PaymentTransaction> findPendingPaymentsOlderThan(@Param("threshold") Instant threshold);

    // Find refunds for a specific transaction
    List<PaymentTransaction> findByRefundOfTransaction_Id(Long transactionId);

    // Find successful payments for a reservation
    @Query("SELECT p FROM PaymentTransaction p " +
            "WHERE p.reservation.reservationId = :reservationId " +
            "AND p.status IN ('AUTHORIZED', 'CAPTURED') " +
            "AND (p.isRefund IS NULL OR p.isRefund = false)")
    List<PaymentTransaction> findSuccessfulPaymentsForReservation(@Param("reservationId") Long reservationId);
}