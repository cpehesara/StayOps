package com.example.stayops.enums;

public enum FolioStatus {
    OPEN,       // Folio is active and accepting charges
    SETTLED,    // All charges paid
    CLOSED,     // Folio closed after checkout
    DISPUTED,   // Payment disputed
    TRANSFERRED // Charges transferred to another folio
}