package com.example.stayops.service.impl;

import com.example.stayops.entity.EmailConfirmationToken;
import com.example.stayops.entity.Guest;
import com.example.stayops.repository.EmailConfirmationTokenRepository;
import com.example.stayops.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.UUID;

/**
 * Implementation of EmailService with support for various email types
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailConfirmationTokenRepository tokenRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.hotel-name}")
    private String hotelName;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendWelcomeEmailWithRegistrationLink(Guest guest) {
        try {
            log.info("Starting to send welcome email to guest: {}", guest.getEmail());

            String token = UUID.randomUUID().toString();

            tokenRepository.deleteByGuestId(guest.getGuestId());

            EmailConfirmationToken confirmationToken = new EmailConfirmationToken(
                    token, guest.getEmail(), guest.getGuestId()
            );
            tokenRepository.save(confirmationToken);
            log.debug("Created confirmation token for guest: {}", guest.getEmail());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(guest.getEmail());
            helper.setSubject("Welcome to " + hotelName + " - Complete Your Mobile App Registration");

            Context context = new Context();
            context.setVariable("guestName", guest.getFirstName() + " " + guest.getLastName());
            context.setVariable("hotelName", hotelName);
            context.setVariable("registrationLink", baseUrl + "/registration?token=" + token);

            String htmlContent = templateEngine.process("welcome-email", context);
            helper.setText(htmlContent, true);

            if (guest.getQrCodeImage() != null && guest.getQrCodeImage().length > 0) {
                ByteArrayResource qrCodeResource = new ByteArrayResource(guest.getQrCodeImage());
                helper.addAttachment("your-qr-code.png", qrCodeResource);
                log.debug("QR code attached to email for guest: {}", guest.getEmail());
            }

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", guest.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {} - {}", guest.getEmail(), e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending welcome email to: {} - {}", guest.getEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EmailConfirmationToken validateToken(String token) {
        log.debug("Validating token: {}", token);

        EmailConfirmationToken confirmationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("Token not found: {}", token);
                    return new RuntimeException("Invalid token");
                });

        if (confirmationToken.isExpired()) {
            log.warn("Token expired: {} - expired at: {}", token, confirmationToken.getExpiresAt());
            throw new RuntimeException("Token has expired");
        }

        if (confirmationToken.isUsed()) {
            log.warn("Token already used: {}", token);
            throw new RuntimeException("Token has already been used");
        }

        log.debug("Token validation successful: {}", token);
        return confirmationToken;
    }

    @Override
    @Transactional
    public void markTokenAsUsed(String token) {
        log.debug("Marking token as used: {}", token);

        EmailConfirmationToken confirmationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.error("Token not found when marking as used: {}", token);
                    return new RuntimeException("Token not found");
                });

        confirmationToken.setUsed(true);
        tokenRepository.save(confirmationToken);

        log.info("Token marked as used successfully: {}", token);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasValidTokenForEmail(String email) {
        return tokenRepository.findByEmailAndUsedFalse(email).isPresent();
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String attachmentName) {
        try {
            log.info("Sending email with attachment to: {}", to);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);

            if (attachment != null && attachment.length > 0) {
                ByteArrayResource resource = new ByteArrayResource(attachment);
                helper.addAttachment(attachmentName, resource);
                log.debug("Attachment added: {}", attachmentName);
            }

            mailSender.send(message);
            log.info("Email with attachment sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send email with attachment to: {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email with attachment: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while sending email with attachment to: {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            log.info("Sending simple email to: {}", to);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Failed to send email to: {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            log.info("Sending HTML email to: {}", to);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML

            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send HTML email: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while sending HTML email to: {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send HTML email: " + e.getMessage());
        }
    }

    @Override
    public void sendBulkEmail(String[] recipients, String subject, String body) {
        try {
            log.info("Sending bulk email to {} recipients", recipients.length);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipients);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Bulk email sent successfully to {} recipients", recipients.length);

        } catch (Exception e) {
            log.error("Failed to send bulk email: {} - {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send bulk email: " + e.getMessage());
        }
    }
}