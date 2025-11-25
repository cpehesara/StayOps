package com.example.stayops.controller;

import com.example.stayops.dto.ServiceRequestDTO;
import com.example.stayops.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    // ========== CRUD OPERATIONS ==========

    @PostMapping("/create")
    public ResponseEntity<ServiceRequestDTO> createServiceRequest(@RequestBody ServiceRequestDTO dto) {
        return ResponseEntity.ok(serviceRequestService.createServiceRequest(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getServiceRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ServiceRequestDTO>> getAllServiceRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequests());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> updateServiceRequest(
            @PathVariable Long id,
            @RequestBody ServiceRequestDTO dto) {
        return ResponseEntity.ok(serviceRequestService.updateServiceRequest(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceRequest(@PathVariable Long id) {
        serviceRequestService.deleteServiceRequest(id);
        return ResponseEntity.noContent().build();
    }

    // ========== FILTERING & SEARCH ==========

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServiceRequestDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByStatus(status));
    }

    @GetMapping("/type/{serviceType}")
    public ResponseEntity<List<ServiceRequestDTO>> getByType(@PathVariable String serviceType) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByType(serviceType));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<ServiceRequestDTO>> getByPriority(@PathVariable String priority) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByPriority(priority));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<ServiceRequestDTO>> getByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByReservation(reservationId));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ServiceRequestDTO>> getByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByRoom(roomId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<ServiceRequestDTO>> getByAssignedStaff(@PathVariable String staffId) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByAssignedStaff(staffId));
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<ServiceRequestDTO>> getByGuest(@PathVariable String guestId) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByGuest(guestId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ServiceRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(serviceRequestService.getPendingRequests());
    }

    @GetMapping("/urgent")
    public ResponseEntity<List<ServiceRequestDTO>> getUrgentRequests() {
        return ResponseEntity.ok(serviceRequestService.getUrgentRequests());
    }

    @GetMapping("/incomplete")
    public ResponseEntity<List<ServiceRequestDTO>> getIncompleteRequests() {
        return ResponseEntity.ok(serviceRequestService.getIncompleteRequests());
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ServiceRequestDTO>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByDateRange(startDate, endDate));
    }

    // ========== STATUS UPDATES & ASSIGNMENT ==========

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ServiceRequestDTO> assignToStaff(
            @PathVariable Long id,
            @RequestParam String staffId) {
        return ResponseEntity.ok(serviceRequestService.assignToStaff(id, staffId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceRequestDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(serviceRequestService.updateStatus(id, status));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ServiceRequestDTO> markAsCompleted(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.markAsCompleted(id));
    }
}