package com.example.stayops.controller;

import com.example.stayops.dto.ServiceManagerCreateDTO;
import com.example.stayops.dto.ServiceManagerUpdateDTO;
import com.example.stayops.dto.ServiceManagerResponseDTO;
import com.example.stayops.service.ServiceManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/service-managers")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class ServiceManagerController {

    private final ServiceManagerService serviceManagerService;

    @PostMapping
    public ResponseEntity<?> createServiceManager(@Valid @RequestBody ServiceManagerCreateDTO dto) {
        try {
            ServiceManagerResponseDTO response = serviceManagerService.createServiceManager(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateServiceManager(
            @PathVariable Long id,
            @Valid @RequestBody ServiceManagerUpdateDTO dto) {
        try {
            ServiceManagerResponseDTO response = serviceManagerService.updateServiceManager(id, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceManagerById(@PathVariable Long id) {
        try {
            ServiceManagerResponseDTO response = serviceManagerService.getServiceManagerById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ServiceManagerResponseDTO>> getAllServiceManagers() {
        return ResponseEntity.ok(serviceManagerService.getAllServiceManagers());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteServiceManager(@PathVariable Long id) {
        try {
            serviceManagerService.deleteServiceManager(id);
            return ResponseEntity.ok("Service Manager deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getServiceManagerByUserId(@PathVariable Long userId) {
        try {
            ServiceManagerResponseDTO response = serviceManagerService.getServiceManagerByUserId(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}
