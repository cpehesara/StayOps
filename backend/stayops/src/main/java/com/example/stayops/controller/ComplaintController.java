package com.example.stayops.controller;

import com.example.stayops.dto.ComplaintDTO;
import com.example.stayops.dto.ComplaintRequestDTO;
import com.example.stayops.dto.ComplaintUpdateDTO;
import com.example.stayops.enums.ComplaintCategory;
import com.example.stayops.enums.ComplaintPriority;
import com.example.stayops.enums.ComplaintStatus;
import com.example.stayops.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ComplaintDTO> createComplaint(
            @RequestBody ComplaintRequestDTO requestDTO,
            @RequestParam String guestId) {
        ComplaintDTO complaint = complaintService.createComplaint(requestDTO, guestId);
        return new ResponseEntity<>(complaint, HttpStatus.CREATED);
    }

    @PutMapping("/{complaintId}")
    public ResponseEntity<ComplaintDTO> updateComplaint(
            @PathVariable Long complaintId,
            @RequestBody ComplaintUpdateDTO updateDTO) {
        ComplaintDTO complaint = complaintService.updateComplaint(complaintId, updateDTO);
        return ResponseEntity.ok(complaint);
    }

    @DeleteMapping("/{complaintId}")
    public ResponseEntity<Void> deleteComplaint(
            @PathVariable Long complaintId,
            @RequestParam String guestId) {
        complaintService.deleteComplaint(complaintId, guestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{complaintId}")
    public ResponseEntity<ComplaintDTO> getComplaint(@PathVariable Long complaintId) {
        ComplaintDTO complaint = complaintService.getComplaint(complaintId);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<ComplaintDTO>> getGuestComplaints(@PathVariable String guestId) {
        List<ComplaintDTO> complaints = complaintService.getGuestComplaints(guestId);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ComplaintDTO>> getComplaintsByStatus(@PathVariable ComplaintStatus status) {
        List<ComplaintDTO> complaints = complaintService.getComplaintsByStatus(status);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ComplaintDTO>> getComplaintsByCategory(@PathVariable ComplaintCategory category) {
        List<ComplaintDTO> complaints = complaintService.getComplaintsByCategory(category);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<ComplaintDTO>> getComplaintsByPriority(@PathVariable ComplaintPriority priority) {
        List<ComplaintDTO> complaints = complaintService.getComplaintsByPriority(priority);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<ComplaintDTO>> getStaffComplaints(@PathVariable String staffId) {
        List<ComplaintDTO> complaints = complaintService.getStaffComplaints(staffId);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ComplaintDTO>> getActiveComplaintsByPriority() {
        List<ComplaintDTO> complaints = complaintService.getActiveComplaintsByPriority();
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getComplaintCountByStatus(@PathVariable ComplaintStatus status) {
        Long count = complaintService.getComplaintCountByStatus(status);
        return ResponseEntity.ok(count);
    }
}