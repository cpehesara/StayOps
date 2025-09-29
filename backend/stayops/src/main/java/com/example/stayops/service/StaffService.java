package com.example.stayops.service;

import com.example.stayops.dto.StaffRequestDTO;
import com.example.stayops.dto.StaffResponseDTO;

import java.util.List;

public interface StaffService {
    StaffResponseDTO createStaff(StaffRequestDTO dto);
    StaffResponseDTO updateStaff(String staffId, StaffRequestDTO dto);
    void deleteStaff(String staffId);
    StaffResponseDTO getStaffById(String staffId);
    List<StaffResponseDTO> getAllStaff();
}
