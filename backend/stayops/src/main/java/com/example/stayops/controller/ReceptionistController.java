package com.example.stayops.controller;

import com.example.stayops.dto.ReceptionistCreateDTO;
import com.example.stayops.dto.ReceptionistUpdateDTO;
import com.example.stayops.dto.ReceptionistResponseDTO;
import com.example.stayops.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/receptionists")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
@Slf4j
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @PostMapping("/register")
    public ResponseEntity<?> createReceptionist(@Valid @RequestBody ReceptionistCreateDTO dto) {
        log.info("POST /api/receptionists/register - Creating receptionist: {}", dto.getEmail());

        try {
            ReceptionistResponseDTO response = receptionistService.createReceptionist(dto);
            log.info("✅ Receptionist created successfully: {}", response.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("❌ Failed to create receptionist: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReceptionist(
            @PathVariable Long id,
            @Valid @RequestBody ReceptionistUpdateDTO dto) {
        log.info("PUT /api/receptionists/{} - Updating receptionist", id);

        try {
            ReceptionistResponseDTO response = receptionistService.updateReceptionist(id, dto);
            log.info("✅ Receptionist updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Failed to update receptionist: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReceptionistById(@PathVariable Long id) {
        log.info("GET /api/receptionists/{} - Fetching receptionist", id);

        try {
            ReceptionistResponseDTO response = receptionistService.getReceptionistById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Receptionist not found: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<ReceptionistResponseDTO>> getAllReceptionists() {
        log.info("GET /api/receptionists - Fetching all receptionists");
        return ResponseEntity.ok(receptionistService.getAllReceptionists());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReceptionist(@PathVariable Long id) {
        log.info("DELETE /api/receptionists/{} - Deleting receptionist", id);

        try {
            receptionistService.deleteReceptionist(id);
            Map<String, String> success = new HashMap<>();
            success.put("message", "Receptionist deleted successfully");
            return ResponseEntity.ok(success);
        } catch (RuntimeException e) {
            log.error("❌ Failed to delete receptionist: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReceptionistByUserId(@PathVariable Long userId) {
        log.info("GET /api/receptionists/user/{} - Fetching receptionist by user ID", userId);

        try {
            ReceptionistResponseDTO response = receptionistService.getReceptionistByUserId(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Receptionist not found for user: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}