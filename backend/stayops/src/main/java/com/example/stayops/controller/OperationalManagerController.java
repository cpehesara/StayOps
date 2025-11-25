package com.example.stayops.controller;

import com.example.stayops.dto.OperationalManagerCreateDTO;
import com.example.stayops.dto.OperationalManagerUpdateDTO;
import com.example.stayops.dto.OperationalManagerResponseDTO;
import com.example.stayops.service.OperationalManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/operational-managers")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class OperationalManagerController {

    private final OperationalManagerService operationalManagerService;

    @PostMapping
    public ResponseEntity<?> createOperationalManager(@Valid @RequestBody OperationalManagerCreateDTO dto) {
        try {
            OperationalManagerResponseDTO response = operationalManagerService.createOperationalManager(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOperationalManager(
            @PathVariable Long id,
            @Valid @RequestBody OperationalManagerUpdateDTO dto) {
        try {
            OperationalManagerResponseDTO response = operationalManagerService.updateOperationalManager(id, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOperationalManagerById(@PathVariable Long id) {
        try {
            OperationalManagerResponseDTO response = operationalManagerService.getOperationalManagerById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<OperationalManagerResponseDTO>> getAllOperationalManagers() {
        return ResponseEntity.ok(operationalManagerService.getAllOperationalManagers());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOperationalManager(@PathVariable Long id) {
        try {
            operationalManagerService.deleteOperationalManager(id);
            return ResponseEntity.ok("Operational Manager deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOperationalManagerByUserId(@PathVariable Long userId) {
        try {
            OperationalManagerResponseDTO response = operationalManagerService.getOperationalManagerByUserId(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}