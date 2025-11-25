package com.example.stayops.controller;

import com.example.stayops.dto.ReservationDetailsDTO;
import com.example.stayops.service.ReservationDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservation-details")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class ReservationDetailsController {

    private final ReservationDetailsService reservationDetailsService;

    @PostMapping("/create/{reservationId}")
    public ResponseEntity<ReservationDetailsDTO> create(@PathVariable Long reservationId,
                                                        @RequestBody ReservationDetailsDTO dto) {
        return ResponseEntity.ok(reservationDetailsService.saveReservationDetails(reservationId, dto));
    }

    @GetMapping("/get/{reservationId}")
    public ResponseEntity<ReservationDetailsDTO> get(@PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationDetailsService.getReservationDetails(reservationId));
    }

    @PutMapping("/update/{reservationId}")
    public ResponseEntity<ReservationDetailsDTO> update(@PathVariable Long reservationId,
                                                        @RequestBody ReservationDetailsDTO dto) {
        return ResponseEntity.ok(reservationDetailsService.updateReservationDetails(reservationId, dto));
    }

    @DeleteMapping("/delete/{reservationId}")
    public ResponseEntity<Void> delete(@PathVariable Long reservationId) {
        reservationDetailsService.deleteReservationDetails(reservationId);
        return ResponseEntity.noContent().build();
    }
}
