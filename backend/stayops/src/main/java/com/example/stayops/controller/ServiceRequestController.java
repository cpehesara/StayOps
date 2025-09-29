package com.example.stayops.controller;

import com.example.stayops.dto.ServiceRequestDTO;
import com.example.stayops.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @PostMapping
    public ResponseEntity<ServiceRequestDTO> create(@RequestBody ServiceRequestDTO dto) {
        return ResponseEntity.ok(serviceRequestService.createRequest(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> update(@PathVariable Long id, @RequestBody ServiceRequestDTO dto) {
        return ResponseEntity.ok(serviceRequestService.updateRequest(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getRequestById(id));
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDTO>> getAll() {
        return ResponseEntity.ok(serviceRequestService.getAllRequests());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
