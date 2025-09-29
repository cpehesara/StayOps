package com.example.stayops.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.stayops.dto.GuestCreateDTO;
import com.example.stayops.dto.GuestRegistrationDTO;
import com.example.stayops.dto.GuestResponseDTO;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.GuestAccount;
import com.example.stayops.repository.GuestAccountRepository;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.service.GuestService;
import com.example.stayops.util.ImageConverterUtil;
import com.example.stayops.util.QRCodeUtil;
import com.example.stayops.service.EmailService;
import com.example.stayops.entity.EmailConfirmationToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j  // This adds the log field
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;
    private final GuestAccountRepository guestAccountRepository;
    private final Cloudinary cloudinary;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public GuestResponseDTO createGuest(GuestCreateDTO dto, MultipartFile identityImage) {
        try {
            log.info("Creating guest with email: {}", dto.getEmail());

            // Check if guest already exists
            if (guestRepository.findByEmail(dto.getEmail()).isPresent()) {
                log.warn("Guest already exists with email: {}", dto.getEmail());
                throw new RuntimeException("Guest already exists with this email");
            }

            // Generate unique guest ID
            String guestId = generateUniqueGuestId();

            // Handle image upload if provided
            String imageUrl = null;
            if (identityImage != null && !identityImage.isEmpty()) {
                imageUrl = uploadImageToCloudinary(identityImage);
            }

            // Create guest entity
            Guest guest = Guest.builder()
                    .guestId(guestId)
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .nationality(dto.getNationality())
                    .identityType(dto.getIdentityType())
                    .identityNumber(dto.getIdentityNumber())
                    .imageUrl(imageUrl)
                    .build();

            // Generate QR Code
            byte[] qrCodeBytes = generateQRCode(guestId);
            guest.setQrCodeImage(qrCodeBytes);

            // Save guest
            Guest savedGuest = guestRepository.save(guest);
            log.info("Guest created successfully with ID: {}", savedGuest.getGuestId());

            // Send welcome email with registration link
            try {
                emailService.sendWelcomeEmailWithRegistrationLink(savedGuest);
                log.info("Welcome email sent to guest: {}", savedGuest.getEmail());
            } catch (Exception e) {
                log.error("Failed to send welcome email to guest: {} - Error: {}",
                        savedGuest.getEmail(), e.getMessage(), e);
                // Don't fail the guest creation if email fails - just log it
            }

            // Convert to response DTO
            return convertToResponseDTO(savedGuest);

        } catch (Exception e) {
            log.error("Error creating guest with email: {} - Error: {}", dto.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create guest: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public GuestResponseDTO getGuestByToken(String token) {
        try {
            log.debug("Getting guest info by token: {}", token);

            EmailConfirmationToken confirmationToken = emailService.validateToken(token);

            Guest guest = guestRepository.findByEmail(confirmationToken.getEmail())
                    .orElseThrow(() -> new RuntimeException("Guest not found"));

            return convertToResponseDTO(guest);

        } catch (Exception e) {
            log.error("Error getting guest by token: {} - Error: {}", token, e.getMessage(), e);
            throw new RuntimeException("Failed to get guest information: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public GuestAccount registerGuestFromWeb(GuestRegistrationDTO dto, String token) {
        try {
            log.info("Starting web registration for email: {}", dto.getEmail());

            // Validate token
            EmailConfirmationToken confirmationToken = emailService.validateToken(token);

            // Ensure email matches token
            if (!confirmationToken.getEmail().equals(dto.getEmail())) {
                log.warn("Email mismatch in token validation. Token email: {}, DTO email: {}",
                        confirmationToken.getEmail(), dto.getEmail());
                throw new RuntimeException("Email mismatch");
            }

            // Check if guest exists
            Guest guest = guestRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> {
                        log.error("Guest not found for email: {}", dto.getEmail());
                        return new RuntimeException("Guest not found with email: " + dto.getEmail());
                    });

            // Check if account already exists
            Optional<GuestAccount> existingAccount = guestAccountRepository.findByEmail(dto.getEmail());
            if (existingAccount.isPresent()) {
                log.warn("Account already exists for email: {}", dto.getEmail());
                throw new RuntimeException("Account already exists for this email");
            }

            // Create new guest account
            GuestAccount guestAccount = GuestAccount.builder()
                    .guest(guest)
                    .email(dto.getEmail())
                    .password(passwordEncoder.encode(dto.getPassword()))
                    .activated(true) // Auto-activate since they came from email confirmation
                    .build();

            GuestAccount savedAccount = guestAccountRepository.save(guestAccount);
            log.info("Guest account created successfully for email: {}", dto.getEmail());

            // Mark token as used
            emailService.markTokenAsUsed(token);

            return savedAccount;

        } catch (Exception e) {
            log.error("Error during web registration for email: {} - Error: {}",
                    dto.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public GuestAccount registerGuestFromMobile(GuestRegistrationDTO dto) {
        try {
            log.info("Starting mobile registration for email: {}", dto.getEmail());

            // Check if guest exists
            Optional<Guest> guestOptional = guestRepository.findByEmail(dto.getEmail());
            if (!guestOptional.isPresent()) {
                log.error("Guest not found for mobile registration with email: {}", dto.getEmail());
                throw new RuntimeException("Guest not found with email: " + dto.getEmail());
            }

            Guest guest = guestOptional.get();

            // Check if account already exists
            Optional<GuestAccount> existingAccount = guestAccountRepository.findByEmail(dto.getEmail());
            if (existingAccount.isPresent()) {
                log.warn("Account already exists for mobile registration with email: {}", dto.getEmail());
                throw new RuntimeException("Account already exists for this email");
            }

            // For mobile registration, we might want to require email confirmation first
            if (!emailService.hasValidTokenForEmail(dto.getEmail())) {
                log.warn("No valid email confirmation token found for mobile registration: {}", dto.getEmail());
                throw new RuntimeException("Please confirm your email first before registering");
            }

            // Create new guest account
            GuestAccount guestAccount = GuestAccount.builder()
                    .guest(guest)
                    .email(dto.getEmail())
                    .password(passwordEncoder.encode(dto.getPassword()))
                    .activated(false) // Require activation for mobile registrations
                    .build();

            GuestAccount savedAccount = guestAccountRepository.save(guestAccount);
            log.info("Mobile guest account created successfully for email: {}", dto.getEmail());

            return savedAccount;

        } catch (Exception e) {
            log.error("Error during mobile registration for email: {} - Error: {}",
                    dto.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Mobile registration failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public GuestResponseDTO getGuestById(String guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));
        return toResponseDTO(guest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestResponseDTO> getAllGuests() {
        return guestRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public String getGuestQrCodeDataUrl(String guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        if (guest.getQrCodeImage() == null || guest.getQrCodeImage().length == 0) {
            return null;
        }

        // Use ImageConverterUtil to produce a data URL (includes mime detection)
        return ImageConverterUtil.bytesToBase64DataUrl(guest.getQrCodeImage());
    }

    // Private helper methods

    /**
     * Generates a unique guest ID
     */
    private String generateUniqueGuestId() {
        String guestId;
        do {
            // Generate a random guest ID (you can customize this format)
            guestId = "GUEST" + String.format("%06d", new Random().nextInt(999999));
        } while (guestRepository.findById(guestId).isPresent());

        return guestId;
    }

    /**
     * Uploads image to Cloudinary and returns the URL
     */
    private String uploadImageToCloudinary(MultipartFile file) {
        try {
            log.debug("Uploading image to Cloudinary: {}", file.getOriginalFilename());

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "folder", "guest_identity_images",
                            "use_filename", true,
                            "unique_filename", true
                    ));

            String imageUrl = uploadResult.get("secure_url").toString();
            log.debug("Image uploaded successfully to Cloudinary: {}", imageUrl);

            return imageUrl;

        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Generates QR code for the given guest ID
     */
    private byte[] generateQRCode(String guestId) {
        try {
            log.debug("Generating QR code for guest: {}", guestId);

            // You can customize the QR code content format
            String qrContent = "GUEST:" + guestId;

            byte[] qrCodeBytes = QRCodeUtil.generateQRCodeImage(qrContent, 200, 200);

            log.debug("QR code generated successfully for guest: {}", guestId);
            return qrCodeBytes;

        } catch (Exception e) {
            log.error("Failed to generate QR code for guest: {} - Error: {}", guestId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }

    /**
     * Converts Guest entity to GuestResponseDTO
     */
    private GuestResponseDTO convertToResponseDTO(Guest guest) {
        String qrCodeBase64 = null;
        if (guest.getQrCodeImage() != null) {
            qrCodeBase64 = Base64.getEncoder().encodeToString(guest.getQrCodeImage());
        }

        return GuestResponseDTO.builder()
                .guestId(guest.getGuestId())
                .fullName(guest.getFirstName() + " " + guest.getLastName())
                .email(guest.getEmail())
                .phone(guest.getPhone())
                .nationality(guest.getNationality())
                .identityType(guest.getIdentityType())
                .identityNumber(guest.getIdentityNumber())
                .qrCodeBase64(qrCodeBase64)
                .imageUrl(guest.getImageUrl())
                .build();
    }

    /**
     * Alternative method for converting Guest to GuestResponseDTO with data URL
     */
    private GuestResponseDTO toResponseDTO(Guest guest) {
        // Keep the original raw base64 string
        String rawBase64 = null;
        if (guest.getQrCodeImage() != null && guest.getQrCodeImage().length > 0) {
            rawBase64 = Base64.getEncoder().encodeToString(guest.getQrCodeImage());
        }

        // Prefer a data URL so frontend can use <img src="data:..."> directly
        String dataUrl = null;
        if (guest.getQrCodeImage() != null && guest.getQrCodeImage().length > 0) {
            try {
                dataUrl = ImageConverterUtil.bytesToBase64DataUrl(guest.getQrCodeImage());
            } catch (Exception e) {
                // fallback to plain base64 if anything goes wrong
                dataUrl = (rawBase64 != null) ? ("data:image/png;base64," + rawBase64) : null;
            }
        }

        return GuestResponseDTO.builder()
                .guestId(guest.getGuestId())
                .fullName(guest.getFirstName() + " " + guest.getLastName())
                .email(guest.getEmail())
                .phone(guest.getPhone())
                .nationality(guest.getNationality())
                .identityType(guest.getIdentityType())
                .identityNumber(guest.getIdentityNumber())
                .imageUrl(guest.getImageUrl())
                .qrCodeBase64(dataUrl)   // data URL (frontend friendly)
                .build();
    }
}