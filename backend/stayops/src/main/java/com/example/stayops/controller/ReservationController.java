package com.example.stayops.controller;

import com.example.stayops.dto.*;
import com.example.stayops.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
// Removed @CrossOrigin here as it's handled globally in SecurityConfig
public class ReservationController {

    private final ReservationService reservationService;

    // ========== RESERVATION CRUD ==========
    @PostMapping("/create")
    public ResponseEntity<ReservationResponseDTO> createReservation(@RequestBody ReservationRequestDTO dto) {
        return ResponseEntity.ok(reservationService.createReservation(dto));
    }

    @PutMapping("/update/{reservationId}")
    public ResponseEntity<ReservationResponseDTO> updateReservation(
            @PathVariable Long reservationId,
            @RequestBody ReservationRequestDTO dto) {
        return ResponseEntity.ok(reservationService.updateReservation(reservationId, dto));
    }

    @DeleteMapping("/delete/{reservationId}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long reservationId) {
        reservationService.deleteReservation(reservationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/get/{reservationId}")
    public ResponseEntity<ReservationResponseDTO> getReservationById(@PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.getReservationById(reservationId));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // ========== ROOM STATUS & AVAILABILITY ==========

    @GetMapping("/room-status")
    public ResponseEntity<List<RoomStatusDTO>> getRoomStatusForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getRoomStatusForDate(date));
    }

    @GetMapping("/room-status/range")
    public ResponseEntity<Map<Long, List<RoomStatusDTO>>> getRoomStatusForDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reservationService.getRoomStatusForDateRange(startDate, endDate));
    }

    @GetMapping("/reservations")
    public List<Map<String, Object>> getAllRoomReservations() {
        return reservationService.getAllRoomReservationStatuses();
    }

    // ========== CALENDAR & DATE-BASED QUERIES ==========

    @GetMapping("/calendar")
    public ResponseEntity<List<ReservationSummaryDTO>> getReservationCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reservationService.getMonthlySummary(year, month));
    }

    @GetMapping("/day")
    public ResponseEntity<List<ReservationDayDetailDTO>> getReservationsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getReservationsForDate(date));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reservationService.getReservationsInDateRange(startDate, endDate));
    }

    // ========== ARRIVALS & DEPARTURES ==========

    @GetMapping("/arrivals")
    public ResponseEntity<List<ReservationResponseDTO>> getArrivals(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getArrivalsForDate(date));
    }

    @GetMapping("/departures")
    public ResponseEntity<List<ReservationResponseDTO>> getDepartures(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getDeparturesForDate(date));
    }

    @GetMapping("/daily-summary")
    public ResponseEntity<DailyOperationsSummaryDTO> getDailySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getDailyOperationsSummary(date));
    }

    // ========== STATUS MANAGEMENT ==========

    @PatchMapping("/{reservationId}/status")
    public ResponseEntity<ReservationResponseDTO> updateReservationStatus(
            @PathVariable Long reservationId,
            @RequestParam String status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(reservationId, status));
    }

    @PostMapping("/{reservationId}/check-in")
    public ResponseEntity<ReservationResponseDTO> checkIn(@PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.checkInReservation(reservationId));
    }

    @PostMapping("/{reservationId}/check-out")
    public ResponseEntity<ReservationResponseDTO> checkOut(@PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.checkOutReservation(reservationId));
    }

    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity<ReservationResponseDTO> cancel(@PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.cancelReservation(reservationId));
    }

    // ========== GUEST & SEARCH ==========

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<ReservationResponseDTO>> getGuestReservations(@PathVariable String guestId) {
        return ResponseEntity.ok(reservationService.getReservationsByGuestId(guestId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ReservationResponseDTO>> searchReservations(
            @RequestParam(required = false) String guestId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        return ResponseEntity.ok(reservationService.searchReservations(guestId, status, checkInDate, checkOutDate));
    }

    // ========== OCCUPANCY STATS ==========

    @GetMapping("/occupancy/current")
    public ResponseEntity<OccupancyStatsDTO> getCurrentOccupancy() {
        return ResponseEntity.ok(reservationService.getCurrentOccupancyStats());
    }

    @GetMapping("/occupancy/date")
    public ResponseEntity<OccupancyStatsDTO> getOccupancyForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getOccupancyStatsForDate(date));
    }
}