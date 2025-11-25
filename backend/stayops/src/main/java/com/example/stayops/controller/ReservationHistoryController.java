package com.example.stayops.controller;

import com.example.stayops.dto.ReservationHistoryDTO;
import com.example.stayops.service.ReservationHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservation-history")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class ReservationHistoryController {

    private final ReservationHistoryService reservationHistoryService;

    @PostMapping
    public ResponseEntity<ReservationHistoryDTO> recordHistory(@RequestBody ReservationHistoryDTO dto) {
        return ResponseEntity.ok(reservationHistoryService.recordHistory(dto));
    }

    @GetMapping("/{reservationId}")
    public ResponseEntity<List<ReservationHistoryDTO>> getHistory(@PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationHistoryService.getHistoryByReservation(reservationId));
    }
}
