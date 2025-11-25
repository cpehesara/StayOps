package com.example.stayops.service;

import com.example.stayops.dto.SystemAdminCreateDTO;
import com.example.stayops.dto.SystemAdminUpdateDTO;
import com.example.stayops.dto.SystemAdminResponseDTO;

import java.util.List;

public interface SystemAdminService {
    SystemAdminResponseDTO createSystemAdmin(SystemAdminCreateDTO dto);
    SystemAdminResponseDTO updateSystemAdmin(Long id, SystemAdminUpdateDTO dto);
    SystemAdminResponseDTO getSystemAdminById(Long id);
    List<SystemAdminResponseDTO> getAllSystemAdmins();
    boolean deleteSystemAdmin(Long id);
    SystemAdminResponseDTO getSystemAdminByUserId(Long userId);
}