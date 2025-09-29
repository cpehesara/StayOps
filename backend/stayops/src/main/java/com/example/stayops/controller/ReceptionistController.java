package com.example.stayops.controller;

import com.example.stayops.dto.ReceptionistRegisterDTO;
import com.example.stayops.dto.ReceptionistResponseDTO;
import com.example.stayops.entity.Receptionist;
import com.example.stayops.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionists")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @PostMapping("/register")
    public ResponseEntity<Receptionist> registerReceptionist(@RequestBody ReceptionistRegisterDTO dto) {
        return ResponseEntity.ok(receptionistService.registerReceptionist(dto));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<ReceptionistResponseDTO>> getAllReceptionists() {
        return ResponseEntity.ok(receptionistService.getAllReceptionists());
    }
}
