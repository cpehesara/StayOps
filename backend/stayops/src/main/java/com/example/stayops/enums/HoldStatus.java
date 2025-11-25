package com.example.stayops.enums;

public enum HoldStatus {
    ACTIVE,      // Hold is active and inventory is reserved
    EXPIRED,     // Hold has expired, inventory released
    CONVERTED,   // Hold converted to confirmed reservation
    CANCELLED,   // Hold manually cancelled
    PAYMENT_PENDING // Hold waiting for payment completion
}