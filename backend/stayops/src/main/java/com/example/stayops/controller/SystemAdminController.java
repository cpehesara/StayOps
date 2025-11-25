package com.example.stayops.controller;

import com.example.stayops.dto.SystemAdminCreateDTO;
import com.example.stayops.dto.SystemAdminUpdateDTO;
import com.example.stayops.dto.SystemAdminResponseDTO;
import com.example.stayops.service.SystemAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/system-admins")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class SystemAdminController {

    private final SystemAdminService systemAdminService;

    @PostMapping
    public ResponseEntity<?> createSystemAdmin(@Valid @RequestBody SystemAdminCreateDTO dto) {
        try {
            SystemAdminResponseDTO response = systemAdminService.createSystemAdmin(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSystemAdmin(
            @PathVariable Long id,
            @Valid @RequestBody SystemAdminUpdateDTO dto) {
        try {
            SystemAdminResponseDTO response = systemAdminService.updateSystemAdmin(id, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSystemAdminById(@PathVariable Long id) {
        try {
            SystemAdminResponseDTO response = systemAdminService.getSystemAdminById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<SystemAdminResponseDTO>> getAllSystemAdmins() {
        return ResponseEntity.ok(systemAdminService.getAllSystemAdmins());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSystemAdmin(@PathVariable Long id) {
        try {
            systemAdminService.deleteSystemAdmin(id);
            return ResponseEntity.ok("System Admin deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSystemAdminByUserId(@PathVariable Long userId) {
        try {
            SystemAdminResponseDTO response = systemAdminService.getSystemAdminByUserId(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}