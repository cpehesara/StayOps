package com.example.stayops.service;

import com.example.stayops.dto.OperationalManagerCreateDTO;
import com.example.stayops.dto.OperationalManagerUpdateDTO;
import com.example.stayops.dto.OperationalManagerResponseDTO;

import java.util.List;

public interface OperationalManagerService {
    OperationalManagerResponseDTO createOperationalManager(OperationalManagerCreateDTO dto);
    OperationalManagerResponseDTO updateOperationalManager(Long id, OperationalManagerUpdateDTO dto);
    OperationalManagerResponseDTO getOperationalManagerById(Long id);
    List<OperationalManagerResponseDTO> getAllOperationalManagers();
    boolean deleteOperationalManager(Long id);
    OperationalManagerResponseDTO getOperationalManagerByUserId(Long userId);
}