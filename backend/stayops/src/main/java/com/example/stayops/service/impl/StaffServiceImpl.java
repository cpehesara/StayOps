package com.example.stayops.service.impl;

import com.example.stayops.dto.StaffRequestDTO;
import com.example.stayops.dto.StaffResponseDTO;
import com.example.stayops.entity.Department;
import com.example.stayops.entity.Staff;
import com.example.stayops.repository.DepartmentRepository;
import com.example.stayops.repository.StaffRepository;
import com.example.stayops.service.StaffService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public StaffResponseDTO createStaff(StaffRequestDTO dto) {
        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        Staff staff = Staff.builder()
                .staffId(dto.getStaffId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .role(dto.getRole())
                .status(dto.getStatus())
                .hireDate(dto.getHireDate())
                .department(department)
                .build();

        return mapToResponseDTO(staffRepository.save(staff));
    }

    @Override
    public StaffResponseDTO updateStaff(String staffId, StaffRequestDTO dto) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + staffId));

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        staff.setName(dto.getName());
        staff.setEmail(dto.getEmail());
        staff.setPhone(dto.getPhone());
        staff.setRole(dto.getRole());
        staff.setStatus(dto.getStatus());
        staff.setHireDate(dto.getHireDate());
        staff.setDepartment(department);

        return mapToResponseDTO(staffRepository.save(staff));
    }

    @Override
    public void deleteStaff(String staffId) {
        if (!staffRepository.existsById(staffId)) {
            throw new EntityNotFoundException("Staff not found with id: " + staffId);
        }
        staffRepository.deleteById(staffId);
    }

    @Override
    public StaffResponseDTO getStaffById(String staffId) {
        return staffRepository.findById(staffId)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + staffId));
    }

    @Override
    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private StaffResponseDTO mapToResponseDTO(Staff staff) {
        return StaffResponseDTO.builder()
                .staffId(staff.getStaffId())
                .name(staff.getName())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .role(staff.getRole())
                .status(staff.getStatus())
                .hireDate(staff.getHireDate())
                .departmentId(staff.getDepartment().getId())
                .departmentName(staff.getDepartment().getName())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }
}
