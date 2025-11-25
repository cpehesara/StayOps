package com.example.stayops.enums;

public enum PaymentStatus {
    PENDING,           // Payment initiated but not confirmed
    AUTHORIZED,        // Payment authorized but not captured
    CAPTURED,          // Payment successfully captured
    FAILED,            // Payment failed
    REFUNDED,          // Payment refunded
    PARTIALLY_REFUNDED, // Partial refund issued
    CANCELLED,         // Payment cancelled
    DISPUTED,          // Chargeback/dispute raised
    TIMEOUT            // Payment timed out
}