package com.example.stayops.service;

import com.example.stayops.dto.ReceptionistRegisterDTO;
import com.example.stayops.dto.ReceptionistResponseDTO;
import com.example.stayops.entity.Receptionist;

import java.util.List;

public interface ReceptionistService {
    Receptionist registerReceptionist(ReceptionistRegisterDTO dto);
    List<ReceptionistResponseDTO> getAllReceptionists();
}
