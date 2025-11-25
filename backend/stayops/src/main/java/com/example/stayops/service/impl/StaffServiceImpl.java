// UPDATED StaffServiceImpl.java with fixes

package com.example.stayops.service.impl;

import com.example.stayops.dto.StaffRequestDTO;
import com.example.stayops.dto.StaffResponseDTO;
import com.example.stayops.entity.Department;
import com.example.stayops.entity.Hotel;
import com.example.stayops.entity.Staff;
import com.example.stayops.repository.DepartmentRepository;
import com.example.stayops.repository.StaffRepository;
import com.example.stayops.service.StaffService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j  // Add logging
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public StaffResponseDTO createStaff(StaffRequestDTO dto) {
        log.info("Creating staff with ID: {}", dto.getStaffId());

        try {
            // Fetch department with hotel
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + dto.getDepartmentId()));

            log.info("Found department: {} with ID: {}", department.getName(), department.getId());

            // Check if hotel exists in department
            Hotel hotel = department.getHotel();
            if (hotel == null) {
                throw new IllegalStateException("Department does not have an associated hotel. Department ID: " + dto.getDepartmentId());
            }

            log.info("Found hotel: {} with ID: {}", hotel.getName(), hotel.getId());

            // Set hire date to today if not provided
            LocalDate hireDate = dto.getHireDate() != null ? dto.getHireDate() : LocalDate.now();

            // Build staff entity
            Staff staff = Staff.builder()
                    .staffId(dto.getStaffId())
                    .name(dto.getName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .role(dto.getRole())
                    .status(dto.getStatus())
                    .hireDate(hireDate)
                    .department(department)
                    .hotel(hotel)
                    .build();

            log.info("Built staff entity: {}", staff.getStaffId());

            // Save to database
            Staff savedStaff = staffRepository.save(staff);
            log.info("Saved staff to database with ID: {}", savedStaff.getStaffId());

            // Flush to ensure data is written to DB
            staffRepository.flush();
            log.info("Flushed staff data to database");

            // Verify save by fetching from database
            Staff verifiedStaff = staffRepository.findById(savedStaff.getStaffId())
                    .orElseThrow(() -> new RuntimeException("Staff was not saved properly"));

            log.info("Verified staff exists in database with timestamps - Created: {}, Updated: {}",
                    verifiedStaff.getCreatedAt(), verifiedStaff.getUpdatedAt());

            // Map to response DTO
            StaffResponseDTO response = mapToResponseDTO(verifiedStaff);
            log.info("Returning response for staff: {}", response.getStaffId());

            return response;

        } catch (Exception e) {
            log.error("Error creating staff: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public StaffResponseDTO updateStaff(String staffId, StaffRequestDTO dto) {
        log.info("Updating staff with ID: {}", staffId);

        try {
            Staff staff = staffRepository.findById(staffId)
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + staffId));

            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + dto.getDepartmentId()));

            Hotel hotel = department.getHotel();
            if (hotel == null) {
                throw new IllegalStateException("Department does not have an associated hotel");
            }

            // Update fields
            staff.setName(dto.getName());
            staff.setEmail(dto.getEmail());
            staff.setPhone(dto.getPhone());
            staff.setRole(dto.getRole());
            staff.setStatus(dto.getStatus());
            staff.setHireDate(dto.getHireDate());
            staff.setDepartment(department);
            staff.setHotel(hotel);

            Staff updatedStaff = staffRepository.save(staff);
            staffRepository.flush();

            log.info("Updated staff: {}", updatedStaff.getStaffId());

            return mapToResponseDTO(updatedStaff);

        } catch (Exception e) {
            log.error("Error updating staff: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deleteStaff(String staffId) {
        log.info("Deleting staff with ID: {}", staffId);

        if (!staffRepository.existsById(staffId)) {
            throw new EntityNotFoundException("Staff not found with id: " + staffId);
        }

        staffRepository.deleteById(staffId);
        staffRepository.flush();

        log.info("Deleted staff: {}", staffId);
    }

    @Override
    @Transactional(readOnly = true)
    public StaffResponseDTO getStaffById(String staffId) {
        log.info("Fetching staff with ID: {}", staffId);

        return staffRepository.findById(staffId)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + staffId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffResponseDTO> getAllStaff() {
        log.info("Fetching all staff");

        List<Staff> staffList = staffRepository.findAll();
        log.info("Found {} staff members", staffList.size());

        return staffList.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private StaffResponseDTO mapToResponseDTO(Staff staff) {
        if (staff == null) {
            return null;
        }

        return StaffResponseDTO.builder()
                .staffId(staff.getStaffId())
                .name(staff.getName())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .role(staff.getRole())
                .status(staff.getStatus())
                .hireDate(staff.getHireDate())
                .departmentId(staff.getDepartment() != null ? staff.getDepartment().getId() : null)
                .departmentName(staff.getDepartment() != null ? staff.getDepartment().getName() : null)
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }
}