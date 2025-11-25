package com.example.stayops.service.impl;

import com.example.stayops.dto.SystemAdminCreateDTO;
import com.example.stayops.dto.SystemAdminUpdateDTO;
import com.example.stayops.dto.SystemAdminResponseDTO;
import com.example.stayops.entity.SystemAdmin;
import com.example.stayops.entity.User;
import com.example.stayops.enums.UserRole;
import com.example.stayops.repository.SystemAdminRepository;
import com.example.stayops.repository.UserRepository;
import com.example.stayops.service.SystemAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemAdminServiceImpl implements SystemAdminService {

    private final SystemAdminRepository systemAdminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public SystemAdminResponseDTO createSystemAdmin(SystemAdminCreateDTO dto) {
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
                .role(UserRole.SYSTEM_ADMIN)
                .active(true)
                .build();
        user = userRepository.save(user);

        // Create SystemAdmin entity
        SystemAdmin admin = SystemAdmin.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .permissions(dto.getPermissions())
                .user(user)
                .build();
        admin = systemAdminRepository.save(admin);

        // Update User with entityId
        user.setEntityId(admin.getId());
        userRepository.save(user);

        return mapToResponseDTO(admin, user);
    }

    @Override
    @Transactional
    public SystemAdminResponseDTO updateSystemAdmin(Long id, SystemAdminUpdateDTO dto) {
        SystemAdmin admin = systemAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("System Admin not found with id: " + id));

        // Update fields if provided
        if (dto.getFullName() != null) admin.setFullName(dto.getFullName());
        if (dto.getPhone() != null) admin.setPhone(dto.getPhone());
        if (dto.getDepartment() != null) admin.setDepartment(dto.getDepartment());
        if (dto.getPermissions() != null) admin.setPermissions(dto.getPermissions());

        admin = systemAdminRepository.save(admin);

        // Update user active status if provided
        if (dto.getActive() != null && admin.getUser() != null) {
            User user = admin.getUser();
            user.setActive(dto.getActive());
            userRepository.save(user);
        }

        return mapToResponseDTO(admin, admin.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public SystemAdminResponseDTO getSystemAdminById(Long id) {
        SystemAdmin admin = systemAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("System Admin not found with id: " + id));
        return mapToResponseDTO(admin, admin.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemAdminResponseDTO> getAllSystemAdmins() {
        return systemAdminRepository.findAll().stream()
                .map(admin -> mapToResponseDTO(admin, admin.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean deleteSystemAdmin(Long id) {
        SystemAdmin admin = systemAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("System Admin not found with id: " + id));

        User user = admin.getUser();
        systemAdminRepository.delete(admin);

        if (user != null) {
            userRepository.delete(user);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public SystemAdminResponseDTO getSystemAdminByUserId(Long userId) {
        SystemAdmin admin = systemAdminRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("System Admin not found for user id: " + userId));
        return mapToResponseDTO(admin, admin.getUser());
    }

    private SystemAdminResponseDTO mapToResponseDTO(SystemAdmin admin, User user) {
        return SystemAdminResponseDTO.builder()
                .id(admin.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .phone(admin.getPhone())
                .department(admin.getDepartment())
                .permissions(admin.getPermissions())
                .active(user != null ? user.isActive() : false)
                .build();
    }
}