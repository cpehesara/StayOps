package com.example.stayops.controller;

import com.example.stayops.dto.ReservationHoldRequestDTO;
import com.example.stayops.dto.ReservationHoldResponseDTO;
import com.example.stayops.service.ReservationHoldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holds")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class ReservationHoldController {

    private final ReservationHoldService holdService;

    @PostMapping("/create")
    public ResponseEntity<ReservationHoldResponseDTO> createHold(@RequestBody ReservationHoldRequestDTO request) {
        return ResponseEntity.ok(holdService.createHold(request));
    }

    @GetMapping("/{holdToken}")
    public ResponseEntity<ReservationHoldResponseDTO> getHold(@PathVariable String holdToken) {
        return ResponseEntity.ok(holdService.getHoldByToken(holdToken));
    }

    @PostMapping("/{holdToken}/convert")
    public ResponseEntity<Long> convertToReservation(@PathVariable String holdToken) {
        Long reservationId = holdService.convertHoldToReservation(holdToken);
        return ResponseEntity.ok(reservationId);
    }

    @DeleteMapping("/{holdToken}/cancel")
    public ResponseEntity<Void> cancelHold(@PathVariable String holdToken) {
        holdService.cancelHold(holdToken);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{holdToken}/extend")
    public ResponseEntity<ReservationHoldResponseDTO> extendHold(
            @PathVariable String holdToken,
            @RequestParam Integer additionalMinutes) {
        return ResponseEntity.ok(holdService.extendHold(holdToken, additionalMinutes));
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<ReservationHoldResponseDTO>> getGuestHolds(@PathVariable String guestId) {
        return ResponseEntity.ok(holdService.getActiveHoldsByGuest(guestId));
    }

    @PostMapping("/process-expired")
    public ResponseEntity<Integer> processExpiredHolds() {
        int processed = holdService.processExpiredHolds();
        return ResponseEntity.ok(processed);
    }
}