package com.example.stayops.service.impl;

import com.example.stayops.dto.GuestResponseDTO;
import com.example.stayops.dto.LoginDTO;
import com.example.stayops.dto.LoginResponseDTO;
import com.example.stayops.entity.GuestAccount;
import com.example.stayops.repository.GuestAccountRepository;
import com.example.stayops.service.AuthService;
import com.example.stayops.service.GuestService;
import com.example.stayops.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final GuestAccountRepository guestAccountRepository;
    private final GuestService guestService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponseDTO authenticateGuest(LoginDTO loginDTO) {
        log.info("Attempting to authenticate guest with email: {}", loginDTO.getEmail());

        try {
            // Manual authentication - no AuthenticationManager needed
            GuestAccount guestAccount = guestAccountRepository.findByEmail(loginDTO.getEmail())
                    .orElseThrow(() -> {
                        log.error("Guest account not found for email: {}", loginDTO.getEmail());
                        return new RuntimeException("Invalid email or password");
                    });

            log.info("Found guest account for email: {}, activated: {}",
                    loginDTO.getEmail(), guestAccount.isActivated());

            // Check if account is activated
            if (!guestAccount.isActivated()) {
                log.error("Account not activated for email: {}", loginDTO.getEmail());
                throw new RuntimeException("Account not activated. Please complete registration first.");
            }

            // Verify password manually
            if (!passwordEncoder.matches(loginDTO.getPassword(), guestAccount.getPassword())) {
                log.error("Password mismatch for email: {}", loginDTO.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            log.info("Authentication successful for email: {}", loginDTO.getEmail());

            // Generate JWT token
            String token = jwtUtil.generateToken(loginDTO.getEmail());

            // Get guest details
            GuestResponseDTO guestResponse = guestService.getGuestById(guestAccount.getGuest().getGuestId());

            return LoginResponseDTO.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtUtil.getExpirationTime())
                    .guest(guestResponse)
                    .build();

        } catch (Exception e) {
            log.error("Authentication failed for email: {} with error: {}", loginDTO.getEmail(), e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    @Override
    public boolean validateToken(String token) {
        try {
            String email = jwtUtil.extractEmail(token);
            return jwtUtil.validateToken(token, email);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}