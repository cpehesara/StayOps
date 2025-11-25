package com.example.stayops.service.impl;

import com.example.stayops.dto.ReceptionistCreateDTO;
import com.example.stayops.dto.ReceptionistUpdateDTO;
import com.example.stayops.dto.ReceptionistResponseDTO;
import com.example.stayops.entity.Receptionist;
import com.example.stayops.entity.User;
import com.example.stayops.enums.UserRole;
import com.example.stayops.repository.ReceptionistRepository;
import com.example.stayops.repository.UserRepository;
import com.example.stayops.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceptionistServiceImpl implements ReceptionistService {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public ReceptionistResponseDTO createReceptionist(ReceptionistCreateDTO dto) {
        log.info("=== CREATE RECEPTIONIST ===");
        log.info("Email: {}", dto.getEmail());
        log.info("Username: {}", dto.getUsername());

        // Validate uniqueness
        if (userRepository.existsByEmail(dto.getEmail())) {
            log.error("❌ Email already exists: {}", dto.getEmail());
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            log.error("❌ Username already exists: {}", dto.getUsername());
            throw new RuntimeException("Username already exists");
        }

        try {
            // Create User entity (password stored here only)
            User user = User.builder()
                    .username(dto.getUsername())
                    .password(passwordEncoder.encode(dto.getPassword()))
                    .email(dto.getEmail())
                    .role(UserRole.RECEPTIONIST)
                    .active(true)
                    .build();
            user = userRepository.save(user);
            log.info("✅ User created with ID: {}", user.getId());

            // Create Receptionist entity (NO password field)
            Receptionist receptionist = Receptionist.builder()
                    .fullName(dto.getFullName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .shiftType(dto.getShiftType())
                    .deskNumber(dto.getDeskNumber())
                    .user(user)
                    .build();
            receptionist = receptionistRepository.save(receptionist);
            log.info("✅ Receptionist created with ID: {}", receptionist.getId());

            // Update User with entityId
            user.setEntityId(receptionist.getId());
            userRepository.save(user);
            log.info("✅ User updated with entityId: {}", receptionist.getId());

            log.info("✅ Receptionist creation complete: {}", dto.getEmail());
            return mapToResponseDTO(receptionist, user);
        } catch (Exception e) {
            log.error("❌ Error creating receptionist: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create receptionist: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ReceptionistResponseDTO updateReceptionist(Long id, ReceptionistUpdateDTO dto) {
        log.info("Updating receptionist with ID: {}", id);

        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with id: " + id));

        // Update fields if provided
        if (dto.getFullName() != null) {
            receptionist.setFullName(dto.getFullName());
            log.info("Updated full name to: {}", dto.getFullName());
        }
        if (dto.getPhone() != null) {
            receptionist.setPhone(dto.getPhone());
            log.info("Updated phone to: {}", dto.getPhone());
        }
        if (dto.getShiftType() != null) {
            receptionist.setShiftType(dto.getShiftType());
            log.info("Updated shift type to: {}", dto.getShiftType());
        }
        if (dto.getDeskNumber() != null) {
            receptionist.setDeskNumber(dto.getDeskNumber());
            log.info("Updated desk number to: {}", dto.getDeskNumber());
        }

        receptionist = receptionistRepository.save(receptionist);

        // Update user active status if provided
        if (dto.getActive() != null && receptionist.getUser() != null) {
            User user = receptionist.getUser();
            user.setActive(dto.getActive());
            userRepository.save(user);
            log.info("Updated active status to: {}", dto.getActive());
        }

        log.info("✅ Receptionist updated successfully");
        return mapToResponseDTO(receptionist, receptionist.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public ReceptionistResponseDTO getReceptionistById(Long id) {
        log.info("Fetching receptionist with ID: {}", id);
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with id: " + id));
        return mapToResponseDTO(receptionist, receptionist.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceptionistResponseDTO> getAllReceptionists() {
        log.info("Fetching all receptionists");
        List<ReceptionistResponseDTO> receptionists = receptionistRepository.findAll().stream()
                .map(r -> mapToResponseDTO(r, r.getUser()))
                .collect(Collectors.toList());
        log.info("Found {} receptionists", receptionists.size());
        return receptionists;
    }

    @Override
    @Transactional
    public boolean deleteReceptionist(Long id) {
        log.info("Deleting receptionist with ID: {}", id);

        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with id: " + id));

        User user = receptionist.getUser();
        receptionistRepository.delete(receptionist);
        log.info("✅ Receptionist deleted");

        if (user != null) {
            userRepository.delete(user);
            log.info("✅ Associated user deleted");
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public ReceptionistResponseDTO getReceptionistByUserId(Long userId) {
        log.info("Fetching receptionist by user ID: {}", userId);
        Receptionist receptionist = receptionistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Receptionist not found for user id: " + userId));
        return mapToResponseDTO(receptionist, receptionist.getUser());
    }

    private ReceptionistResponseDTO mapToResponseDTO(Receptionist receptionist, User user) {
        return ReceptionistResponseDTO.builder()
                .id(receptionist.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(receptionist.getEmail())
                .fullName(receptionist.getFullName())
                .phone(receptionist.getPhone())
                .shiftType(receptionist.getShiftType())
                .deskNumber(receptionist.getDeskNumber())
                .active(user != null ? user.isActive() : false)
                .build();
    }
}