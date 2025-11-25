package com.example.stayops.controller;

import com.example.stayops.dto.LoginDTO;
import com.example.stayops.dto.LoginResponseDTO;
import com.example.stayops.dto.UserLoginResponseDTO;
import com.example.stayops.service.AuthService;
import com.example.stayops.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    /**
     * GUEST LOGIN - MOBILE APP ONLY (EXISTING - UNCHANGED)
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        LoginResponseDTO response = authService.authenticateGuest(loginDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * WEB USER LOGIN - NEW ENDPOINT
     */
    @PostMapping("/web-login")
    public ResponseEntity<?> webLogin(@Valid @RequestBody LoginDTO loginDTO) {
        log.info("=== WEB LOGIN DEBUG ===");
        log.info("Email: {}", loginDTO.getEmail());
        log.info("Password length: {}", loginDTO.getPassword() != null ? loginDTO.getPassword().length() : 0);

        try {
            UserLoginResponseDTO response = userService.authenticateUser(loginDTO);
            log.info("✅ Web login successful for: {} as {}", loginDTO.getEmail(), response.getRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Web login failed for {}: {}", loginDTO.getEmail(), e.getMessage());
            log.error("Stack trace:", e);

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * GUEST TOKEN VALIDATION (EXISTING - UNCHANGED)
     */
    @PostMapping("/validate-token")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }

    /**
     * WEB USER TOKEN VALIDATION
     */
    @PostMapping("/validate-web-token")
    @GetMapping("/validate-web-token")
    public ResponseEntity<?> validateWebToken(@RequestParam(required = false) String token,
                                              @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String tokenToValidate = token;

            if (tokenToValidate == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                tokenToValidate = authHeader.substring(7);
            }

            if (tokenToValidate == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
            }

            boolean isValid = tokenToValidate != null && !tokenToValidate.isEmpty();
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    /**
     * UNIFIED VALIDATE ENDPOINT
     */
    @PostMapping("/validate")
    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestParam(required = false) String token,
                                      @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String tokenToValidate = token;

            if (tokenToValidate == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                tokenToValidate = authHeader.substring(7);
            }

            if (tokenToValidate == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
            }

            boolean isValid = authService.validateToken(tokenToValidate);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    /**
     * DEBUG ENDPOINT - Check if users exist
     */
    @GetMapping("/debug-users")
    public ResponseEntity<?> debugUsers() {
        log.info("🔍 Debug users endpoint called");
        try {
            var allUsers = userService.getAllUsers();

            var userList = allUsers.stream()
                    .map(u -> Map.of(
                            "id", u.getId(),
                            "email", u.getEmail(),
                            "username", u.getUsername(),
                            "role", u.getRole().name(),
                            "active", u.isActive()
                    ))
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "totalUsers", allUsers.size(),
                    "users", userList
            ));
        } catch (Exception e) {
            log.error("Error in debug endpoint: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * LOGOUT ENDPOINT
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("🚪 Logout request received");
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}