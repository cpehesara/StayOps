package com.example.stayops.service.impl;

import com.example.stayops.dto.OperationalManagerCreateDTO;
import com.example.stayops.dto.OperationalManagerUpdateDTO;
import com.example.stayops.dto.OperationalManagerResponseDTO;
import com.example.stayops.entity.OperationalManager;
import com.example.stayops.entity.User;
import com.example.stayops.enums.UserRole;
import com.example.stayops.repository.OperationalManagerRepository;
import com.example.stayops.repository.UserRepository;
import com.example.stayops.service.OperationalManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperationalManagerServiceImpl implements OperationalManagerService {

    private final OperationalManagerRepository operationalManagerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OperationalManagerResponseDTO createOperationalManager(OperationalManagerCreateDTO dto) {
        // Validate uniqueness
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Create User entity
        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .role(UserRole.OPERATIONAL_MANAGER)
                .active(true)
                .build();
        user = userRepository.save(user);

        // Create OperationalManager entity
        OperationalManager manager = OperationalManager.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .operationalAreas(dto.getOperationalAreas())
                .shiftType(dto.getShiftType())
                .user(user)
                .build();
        manager = operationalManagerRepository.save(manager);

        // Update User with entityId
        user.setEntityId(manager.getId());
        userRepository.save(user);

        return mapToResponseDTO(manager, user);
    }

    @Override
    @Transactional
    public OperationalManagerResponseDTO updateOperationalManager(Long id, OperationalManagerUpdateDTO dto) {
        OperationalManager manager = operationalManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operational Manager not found with id: " + id));

        // Update fields if provided
        if (dto.getFullName() != null) manager.setFullName(dto.getFullName());
        if (dto.getPhone() != null) manager.setPhone(dto.getPhone());
        if (dto.getDepartment() != null) manager.setDepartment(dto.getDepartment());
        if (dto.getOperationalAreas() != null) manager.setOperationalAreas(dto.getOperationalAreas());
        if (dto.getShiftType() != null) manager.setShiftType(dto.getShiftType());

        manager = operationalManagerRepository.save(manager);

        // Update user active status if provided
        if (dto.getActive() != null && manager.getUser() != null) {
            User user = manager.getUser();
            user.setActive(dto.getActive());
            userRepository.save(user);
        }

        return mapToResponseDTO(manager, manager.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public OperationalManagerResponseDTO getOperationalManagerById(Long id) {
        OperationalManager manager = operationalManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operational Manager not found with id: " + id));
        return mapToResponseDTO(manager, manager.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OperationalManagerResponseDTO> getAllOperationalManagers() {
        return operationalManagerRepository.findAll().stream()
                .map(manager -> mapToResponseDTO(manager, manager.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean deleteOperationalManager(Long id) {
        OperationalManager manager = operationalManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operational Manager not found with id: " + id));

        User user = manager.getUser();
        operationalManagerRepository.delete(manager);

        if (user != null) {
            userRepository.delete(user);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public OperationalManagerResponseDTO getOperationalManagerByUserId(Long userId) {
        OperationalManager manager = operationalManagerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Operational Manager not found for user id: " + userId));
        return mapToResponseDTO(manager, manager.getUser());
    }

    private OperationalManagerResponseDTO mapToResponseDTO(OperationalManager manager, User user) {
        return OperationalManagerResponseDTO.builder()
                .id(manager.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(manager.getEmail())
                .fullName(manager.getFullName())
                .phone(manager.getPhone())
                .department(manager.getDepartment())
                .operationalAreas(manager.getOperationalAreas())
                .shiftType(manager.getShiftType())
                .active(user != null ? user.isActive() : false)
                .build();
    }
}