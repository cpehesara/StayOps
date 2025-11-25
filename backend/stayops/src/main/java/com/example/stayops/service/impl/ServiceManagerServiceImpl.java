package com.example.stayops.service.impl;

import com.example.stayops.dto.ServiceManagerCreateDTO;
import com.example.stayops.dto.ServiceManagerUpdateDTO;
import com.example.stayops.dto.ServiceManagerResponseDTO;
import com.example.stayops.entity.ServiceManager;
import com.example.stayops.entity.User;
import com.example.stayops.enums.UserRole;
import com.example.stayops.repository.ServiceManagerRepository;
import com.example.stayops.repository.UserRepository;
import com.example.stayops.service.ServiceManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceManagerServiceImpl implements ServiceManagerService {

    private final ServiceManagerRepository serviceManagerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public ServiceManagerResponseDTO createServiceManager(ServiceManagerCreateDTO dto) {
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
                .role(UserRole.SERVICE_MANAGER)
                .active(true)
                .build();
        user = userRepository.save(user);

        // Create ServiceManager entity
        ServiceManager manager = ServiceManager.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .serviceAreas(dto.getServiceAreas())
                .certification(dto.getCertification())
                .user(user)
                .build();
        manager = serviceManagerRepository.save(manager);

        // Update User with entityId
        user.setEntityId(manager.getId());
        userRepository.save(user);

        return mapToResponseDTO(manager, user);
    }

    @Override
    @Transactional
    public ServiceManagerResponseDTO updateServiceManager(Long id, ServiceManagerUpdateDTO dto) {
        ServiceManager manager = serviceManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Manager not found with id: " + id));

        // Update fields if provided
        if (dto.getFullName() != null) manager.setFullName(dto.getFullName());
        if (dto.getPhone() != null) manager.setPhone(dto.getPhone());
        if (dto.getDepartment() != null) manager.setDepartment(dto.getDepartment());
        if (dto.getServiceAreas() != null) manager.setServiceAreas(dto.getServiceAreas());
        if (dto.getCertification() != null) manager.setCertification(dto.getCertification());

        manager = serviceManagerRepository.save(manager);

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
    public ServiceManagerResponseDTO getServiceManagerById(Long id) {
        ServiceManager manager = serviceManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Manager not found with id: " + id));
        return mapToResponseDTO(manager, manager.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceManagerResponseDTO> getAllServiceManagers() {
        return serviceManagerRepository.findAll().stream()
                .map(manager -> mapToResponseDTO(manager, manager.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean deleteServiceManager(Long id) {
        ServiceManager manager = serviceManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Manager not found with id: " + id));

        User user = manager.getUser();
        serviceManagerRepository.delete(manager);

        if (user != null) {
            userRepository.delete(user);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceManagerResponseDTO getServiceManagerByUserId(Long userId) {
        ServiceManager manager = serviceManagerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Service Manager not found for user id: " + userId));
        return mapToResponseDTO(manager, manager.getUser());
    }

    private ServiceManagerResponseDTO mapToResponseDTO(ServiceManager manager, User user) {
        return ServiceManagerResponseDTO.builder()
                .id(manager.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(manager.getEmail())
                .fullName(manager.getFullName())
                .phone(manager.getPhone())
                .department(manager.getDepartment())
                .serviceAreas(manager.getServiceAreas())
                .certification(manager.getCertification())
                .active(user != null ? user.isActive() : false)
                .build();
    }
}
