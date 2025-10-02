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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.UUID;

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

            // Generate unique token
            String token = UUID.randomUUID().toString();

            // Delete any existing tokens for this guest (cleanup)
            tokenRepository.deleteByGuestId(guest.getGuestId());

            // Save new token to database
            EmailConfirmationToken confirmationToken = new EmailConfirmationToken(
                    token, guest.getEmail(), guest.getGuestId()
            );
            tokenRepository.save(confirmationToken);
            log.debug("Created confirmation token for guest: {}", guest.getEmail());

            // Create email content
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(guest.getEmail());
            helper.setSubject("Welcome to " + hotelName + " - Complete Your Mobile App Registration");

            // Create email content using Thymeleaf template
            Context context = new Context();
            context.setVariable("guestName", guest.getFirstName() + " " + guest.getLastName());
            context.setVariable("hotelName", hotelName);
            context.setVariable("registrationLink", baseUrl + "/registration?token=" + token);

            String htmlContent = templateEngine.process("welcome-email", context);
            helper.setText(htmlContent, true);

            // Attach QR code if available
            if (guest.getQrCodeImage() != null && guest.getQrCodeImage().length > 0) {
                ByteArrayResource qrCodeResource = new ByteArrayResource(guest.getQrCodeImage());
                helper.addAttachment("your-qr-code.png", qrCodeResource);
                log.debug("QR code attached to email for guest: {}", guest.getEmail());
            }

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", guest.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {} - {}", guest.getEmail(), e.getMessage(), e);
            // Don't throw exception - allow guest creation to succeed even if email fails
        } catch (Exception e) {
            log.error("Unexpected error while sending welcome email to: {} - {}", guest.getEmail(), e.getMessage(), e);
            // Don't throw exception - allow guest creation to succeed even if email fails
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
}