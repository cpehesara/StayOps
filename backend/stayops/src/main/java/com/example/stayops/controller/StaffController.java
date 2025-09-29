package com.example.stayops.controller;

import com.example.stayops.dto.StaffRequestDTO;
import com.example.stayops.dto.StaffResponseDTO;
import com.example.stayops.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/create")
    public ResponseEntity<StaffResponseDTO> createStaff(@RequestBody StaffRequestDTO dto) {
        return ResponseEntity.ok(staffService.createStaff(dto));
    }

    @PutMapping("/update/{staffId}")
    public ResponseEntity<StaffResponseDTO> updateStaff(
            @PathVariable String staffId,
            @RequestBody StaffRequestDTO dto) {
        return ResponseEntity.ok(staffService.updateStaff(staffId, dto));
    }

    @DeleteMapping("/delete/{staffId}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String staffId) {
        staffService.deleteStaff(staffId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/get/{staffId}")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable String staffId) {
        return ResponseEntity.ok(staffService.getStaffById(staffId));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<StaffResponseDTO>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }
}
