package com.example.stayops.service.impl;

import com.example.stayops.dto.ReceptionistRegisterDTO;
import com.example.stayops.dto.ReceptionistResponseDTO;
import com.example.stayops.entity.Receptionist;
import com.example.stayops.repository.ReceptionistRepository;
import com.example.stayops.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final ReceptionistRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Receptionist registerReceptionist(ReceptionistRegisterDTO dto) {
        Receptionist receptionist = new Receptionist();
        receptionist.setUsername(dto.getUsername());
        receptionist.setPassword(passwordEncoder.encode(dto.getPassword()));
        receptionist.setFullName(dto.getFullName());
        receptionist.setEmail(dto.getEmail());
        receptionist.setPhone(dto.getPhone());
        return repository.save(receptionist);
    }

    @Override
    public List<ReceptionistResponseDTO> getAllReceptionists() {
        return repository.findAll().stream()
                .map(r -> {
                    ReceptionistResponseDTO dto = new ReceptionistResponseDTO();
                    dto.setId(r.getId());
                    dto.setUsername(r.getUsername());
                    dto.setFullName(r.getFullName());
                    dto.setEmail(r.getEmail());
                    dto.setPhone(r.getPhone());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
