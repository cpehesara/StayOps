package com.example.stayops.controller;

import com.example.stayops.dto.LoyaltyPointsDTO;
import com.example.stayops.service.LoyaltyPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty-points")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class LoyaltyPointsController {

    private final LoyaltyPointsService loyaltyPointsService;

    @PostMapping
    public ResponseEntity<LoyaltyPointsDTO> createOrUpdate(@RequestBody LoyaltyPointsDTO dto) {
        return ResponseEntity.ok(loyaltyPointsService.createOrUpdate(dto));
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<LoyaltyPointsDTO> getByGuestId(@PathVariable String guestId) {
        return ResponseEntity.ok(loyaltyPointsService.getByGuestId(guestId));
    }

    @GetMapping
    public ResponseEntity<List<LoyaltyPointsDTO>> getAll() {
        return ResponseEntity.ok(loyaltyPointsService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        loyaltyPointsService.delete(id);
        return ResponseEntity.ok("Deleted loyalty points with id " + id);
    }
}
