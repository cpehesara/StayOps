package com.example.stayops.service;

import com.example.stayops.entity.EmailConfirmationToken;
import com.example.stayops.entity.Guest;

public interface EmailService {

    /**
     * Send welcome email with registration link to the guest
     * @param guest Guest entity
     */
    void sendWelcomeEmailWithRegistrationLink(Guest guest);

    /**
     * Validate email confirmation token
     * @param token Token string
     * @return EmailConfirmationToken if valid
     * @throws RuntimeException if token is invalid, expired, or already used
     */
    EmailConfirmationToken validateToken(String token);

    /**
     * Mark token as used after successful registration
     * @param token Token string
     */
    void markTokenAsUsed(String token);

    /**
     * Check if email confirmation token exists and is valid for the email
     * @param email Guest email
     * @return true if valid token exists
     */
    boolean hasValidTokenForEmail(String email);
}