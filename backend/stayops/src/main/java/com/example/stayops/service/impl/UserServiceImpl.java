package com.example.stayops.service.impl;

import com.example.stayops.dto.LoginDTO;
import com.example.stayops.dto.UserLoginResponseDTO;
import com.example.stayops.entity.*;
import com.example.stayops.enums.UserRole;
import com.example.stayops.repository.*;
import com.example.stayops.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SystemAdminRepository systemAdminRepository;
    private final ServiceManagerRepository serviceManagerRepository;
    private final OperationalManagerRepository operationalManagerRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserLoginResponseDTO authenticateUser(LoginDTO loginDTO) {
        log.info("🔐 Web user authentication attempt for: {}", loginDTO.getEmail());

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ User not found in database: {}", loginDTO.getEmail());
                    return new RuntimeException("Invalid email or password");
                });

        log.info("✅ User found: {} with role: {}", user.getEmail(), user.getRole());

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            log.error("❌ Password mismatch for: {}", loginDTO.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        log.info("✅ Password verified for: {}", loginDTO.getEmail());

        if (!user.isActive()) {
            log.error("❌ User account is deactivated: {}", loginDTO.getEmail());
            throw new RuntimeException("User account is deactivated");
        }

        String fullName = getFullNameByRole(user);
        log.info("✅ Authentication successful for: {} ({}) - Role: {}", fullName, user.getEmail(), user.getRole());

        return UserLoginResponseDTO.builder()
                .token("Bearer " + generateToken(user))
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(fullName)
                .role(user.getRole().name())
                .userId(user.getId().toString())
                .entityId(user.getEntityId() != null ? user.getEntityId().toString() : null)
                .message("Login successful")
                .build();
    }

    private String getFullNameByRole(User user) {
        try {
            switch (user.getRole()) {
                case SYSTEM_ADMIN:
                    return systemAdminRepository.findByUserId(user.getId())
                            .map(SystemAdmin::getFullName)
                            .orElse("System Admin");
                case SERVICE_MANAGER:
                    return serviceManagerRepository.findByUserId(user.getId())
                            .map(ServiceManager::getFullName)
                            .orElse("Service Manager");
                case OPERATIONAL_MANAGER:
                    return operationalManagerRepository.findByUserId(user.getId())
                            .map(OperationalManager::getFullName)
                            .orElse("Operational Manager");
                case RECEPTIONIST:
                    return receptionistRepository.findByUserId(user.getId())
                            .map(Receptionist::getFullName)
                            .orElse("Receptionist");
                default:
                    return "Unknown";
            }
        } catch (Exception e) {
            log.error("Error getting full name for user {}: {}", user.getId(), e.getMessage());
            return "Unknown";
        }
    }

    private String generateToken(User user) {
        // Simple token generation - Replace with JWT in production
        return java.util.Base64.getEncoder()
                .encodeToString((user.getEmail() + ":" + System.currentTimeMillis()).getBytes());
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    @Override
    @Transactional
    public boolean deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setActive(false);
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean activateUser(Long userId) {
        User user = getUserById(userId);
        user.setActive(true);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}