package com.example.stayops.service.impl;

import com.example.stayops.dto.DepartmentRequestDTO;
import com.example.stayops.dto.DepartmentResponseDTO;
import com.example.stayops.entity.Department;
import com.example.stayops.entity.Hotel;
import com.example.stayops.entity.Staff;
import com.example.stayops.enums.DepartmentStatus;
import com.example.stayops.enums.StaffStatus;
import com.example.stayops.repository.DepartmentRepository;
import com.example.stayops.repository.HotelRepository;
import com.example.stayops.service.DepartmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final HotelRepository hotelRepository;

    @Override
    @Transactional
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO dto) {
        log.info("Creating department: {}", dto.getName());

        try {
            // Check for duplicate name
            if (departmentRepository.existsByName(dto.getName())) {
                throw new IllegalArgumentException("Department with name '" + dto.getName() + "' already exists");
            }

            // Get hotel
            Hotel hotel = hotelRepository.findById(dto.getHotelId())
                    .orElseThrow(() -> new EntityNotFoundException("Hotel not found with id: " + dto.getHotelId()));

            // Build department entity
            Department department = Department.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .headOfDepartment(dto.getHeadOfDepartment())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .location(dto.getLocation())
                    .workingHours(dto.getWorkingHours())
                    .status(dto.getStatus() != null ? dto.getStatus() : DepartmentStatus.ACTIVE)
                    .performance(dto.getPerformance() != null ? dto.getPerformance() : 0)
                    .hotel(hotel)
                    .build();

            Department savedDepartment = departmentRepository.save(department);
            departmentRepository.flush();

            log.info("Department created successfully with id: {}", savedDepartment.getId());

            return mapToResponseDTO(savedDepartment);

        } catch (Exception e) {
            log.error("Error creating department: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO dto) {
        log.info("Updating department with id: {}", id);

        try {
            Department department = departmentRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));

            // Check for duplicate name (excluding current department)
            if (!department.getName().equals(dto.getName()) &&
                    departmentRepository.existsByName(dto.getName())) {
                throw new IllegalArgumentException("Department with name '" + dto.getName() + "' already exists");
            }

            // Update fields
            department.setName(dto.getName());
            department.setDescription(dto.getDescription());
            department.setHeadOfDepartment(dto.getHeadOfDepartment());
            department.setEmail(dto.getEmail());
            department.setPhone(dto.getPhone());
            department.setLocation(dto.getLocation());
            department.setWorkingHours(dto.getWorkingHours());

            if (dto.getStatus() != null) {
                department.setStatus(dto.getStatus());
            }

            if (dto.getPerformance() != null) {
                department.setPerformance(dto.getPerformance());
            }

            // Update hotel if provided
            if (dto.getHotelId() != null && !dto.getHotelId().equals(department.getHotel().getId())) {
                Hotel hotel = hotelRepository.findById(dto.getHotelId())
                        .orElseThrow(() -> new EntityNotFoundException("Hotel not found with id: " + dto.getHotelId()));
                department.setHotel(hotel);
            }

            Department updatedDepartment = departmentRepository.save(department);
            departmentRepository.flush();

            log.info("Department updated successfully: {}", updatedDepartment.getId());

            // Fetch with staff for accurate metrics
            Department refreshed = departmentRepository.findByIdWithStaff(id)
                    .orElse(updatedDepartment);

            return mapToResponseDTO(refreshed);

        } catch (Exception e) {
            log.error("Error updating department: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        log.info("Deleting department with id: {}", id);

        try {
            if (!departmentRepository.existsById(id)) {
                throw new EntityNotFoundException("Department not found with id: " + id);
            }

            departmentRepository.deleteById(id);
            departmentRepository.flush();

            log.info("Department deleted successfully: {}", id);

        } catch (Exception e) {
            log.error("Error deleting department: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDTO getDepartmentById(Long id) {
        log.info("Fetching department with id: {}", id);

        try {
            // Use JOIN FETCH to eagerly load staff
            Department department = departmentRepository.findByIdWithStaff(id)
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));

            return mapToResponseDTO(department);

        } catch (Exception e) {
            log.error("Error fetching department by id: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> getAllDepartments() {
        log.info("Fetching all departments");

        try {
            // Use JOIN FETCH to eagerly load staff for all departments
            List<Department> departments = departmentRepository.findAllWithStaff();
            log.info("Found {} departments", departments.size());

            return departments.stream()
                    .map(this::mapToResponseDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error fetching all departments: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Maps Department entity to DepartmentResponseDTO with calculated staff metrics
     */
    private DepartmentResponseDTO mapToResponseDTO(Department department) {
        try {
            // Get staff set - should already be loaded via JOIN FETCH
            Set<Staff> staffSet = department.getStaff();

            // Calculate staff metrics
            int totalStaff = 0;
            int activeStaff = 0;
            int onLeaveStaff = 0;
            int inactiveStaff = 0;

            if (staffSet != null && !staffSet.isEmpty()) {
                totalStaff = staffSet.size();

                activeStaff = (int) staffSet.stream()
                        .filter(staff -> staff != null && staff.getStatus() == StaffStatus.ACTIVE)
                        .count();

                onLeaveStaff = (int) staffSet.stream()
                        .filter(staff -> staff != null && staff.getStatus() == StaffStatus.ON_LEAVE)
                        .count();

                inactiveStaff = (int) staffSet.stream()
                        .filter(staff -> staff != null && staff.getStatus() == StaffStatus.INACTIVE)
                        .count();
            }

            // Build response DTO with aliases for frontend compatibility
            return DepartmentResponseDTO.builder()
                    .id(department.getId())
                    .name(department.getName())
                    .description(department.getDescription())
                    .headOfDepartment(department.getHeadOfDepartment())
                    .head(department.getHeadOfDepartment()) // Alias
                    .email(department.getEmail())
                    .phone(department.getPhone())
                    .location(department.getLocation())
                    .workingHours(department.getWorkingHours())
                    .hours(department.getWorkingHours()) // Alias
                    .status(department.getStatus())
                    .performance(department.getPerformance())
                    // Staff metrics with aliases
                    .totalStaff(totalStaff)
                    .staffCount(totalStaff) // Alias
                    .activeStaff(activeStaff)
                    .activeCount(activeStaff) // Alias
                    .onLeaveStaff(onLeaveStaff)
                    .leaveCount(onLeaveStaff) // Alias
                    .inactiveStaff(inactiveStaff)
                    // Timestamps with aliases
                    .createdAt(department.getCreatedAt())
                    .updatedAt(department.getUpdatedAt())
                    .lastUpdated(department.getUpdatedAt()) // Alias
                    .build();

        } catch (Exception e) {
            log.error("Error mapping department to DTO: {}", e.getMessage(), e);
            throw new RuntimeException("Error mapping department data", e);
        }
    }
}