package com.example.stayops.service;

import com.example.stayops.entity.EmailConfirmationToken;
import com.example.stayops.entity.Guest;

/**
 * Email service for sending various types of emails
 */
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

    /**
     * Send email with attachment (for billing invoices, etc.)
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body text
     * @param attachment Attachment as byte array
     * @param attachmentName Attachment filename
     */
    void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String attachmentName);

    /**
     * Send simple text email (for notifications, reminders, etc.)
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body text
     */
    void sendEmail(String to, String subject, String body);

    /**
     * Send HTML email
     * @param to Recipient email address
     * @param subject Email subject
     * @param htmlBody HTML email body
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);

    /**
     * Send email to multiple recipients
     * @param recipients Array of recipient email addresses
     * @param subject Email subject
     * @param body Email body
     */
    void sendBulkEmail(String[] recipients, String subject, String body);
}