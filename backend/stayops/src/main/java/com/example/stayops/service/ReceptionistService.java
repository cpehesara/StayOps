package com.example.stayops.service;

import com.example.stayops.dto.ReceptionistCreateDTO;
import com.example.stayops.dto.ReceptionistUpdateDTO;
import com.example.stayops.dto.ReceptionistResponseDTO;

import java.util.List;

public interface ReceptionistService {
    ReceptionistResponseDTO createReceptionist(ReceptionistCreateDTO dto);
    ReceptionistResponseDTO updateReceptionist(Long id, ReceptionistUpdateDTO dto);
    ReceptionistResponseDTO getReceptionistById(Long id);
    List<ReceptionistResponseDTO> getAllReceptionists();
    boolean deleteReceptionist(Long id);
    ReceptionistResponseDTO getReceptionistByUserId(Long userId);
}