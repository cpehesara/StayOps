package com.example.stayops.service.impl;

import com.example.stayops.dto.ComplaintDTO;
import com.example.stayops.dto.ComplaintRequestDTO;
import com.example.stayops.dto.ComplaintUpdateDTO;
import com.example.stayops.entity.Complaint;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Staff;
import com.example.stayops.enums.ComplaintCategory;
import com.example.stayops.enums.ComplaintPriority;
import com.example.stayops.enums.ComplaintStatus;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.repository.ComplaintRepository;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.StaffRepository;
import com.example.stayops.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.stayops.automation.NotificationPublisher;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final GuestRepository guestRepository;
    private final ReservationRepository reservationRepository;
    private final StaffRepository staffRepository;
    private final NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public ComplaintDTO createComplaint(ComplaintRequestDTO requestDTO, String guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id: " + guestId));

        Reservation reservation = null;
        if (requestDTO.getReservationId() != null) {
            reservation = reservationRepository.findById(requestDTO.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + requestDTO.getReservationId()));
        }

        Complaint complaint = Complaint.builder()
                .guest(guest)
                .reservation(reservation)
                .category(requestDTO.getCategory())
                .subject(requestDTO.getSubject())
                .description(requestDTO.getDescription())
                .priority(requestDTO.getPriority() != null ? requestDTO.getPriority() : ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.SUBMITTED)
                .attachments(requestDTO.getAttachments())
                .build();

        Complaint saved = complaintRepository.save(complaint);
        notificationPublisher.notifyComplaintSubmitted(saved);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public ComplaintDTO updateComplaint(Long complaintId, ComplaintUpdateDTO updateDTO) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (updateDTO.getStatus() != null) {
            if (updateDTO.getStatus() == ComplaintStatus.ACKNOWLEDGED &&
                    complaint.getAcknowledgedAt() == null) {
                complaint.setAcknowledgedAt(LocalDateTime.now());
                // ADD NOTIFICATION
                notificationPublisher.notifyComplaintAcknowledged(complaint);
            }

            if (updateDTO.getStatus() == ComplaintStatus.RESOLVED &&
                    complaint.getResolvedAt() == null) {
                complaint.setResolvedAt(LocalDateTime.now());
                // ADD NOTIFICATION
                notificationPublisher.notifyComplaintResolved(complaint);
            }
        }

        if (updateDTO.getPriority() != null) {
            complaint.setPriority(updateDTO.getPriority());
        }

        if (updateDTO.getAssignedToId() != null) {
            Staff staff = staffRepository.findById(updateDTO.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + updateDTO.getAssignedToId()));
            complaint.setAssignedTo(staff);
        }

        if (updateDTO.getResolution() != null) {
            complaint.setResolution(updateDTO.getResolution());
        }

        if (updateDTO.getInternalNotes() != null) {
            complaint.setInternalNotes(updateDTO.getInternalNotes());
        }

        Complaint updated = complaintRepository.save(complaint);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteComplaint(Long complaintId, String guestId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getGuest().getGuestId().equals(guestId)) {
            throw new RuntimeException("Unauthorized to delete this complaint");
        }

        complaintRepository.delete(complaint);
    }

    @Override
    public ComplaintDTO getComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        return mapToDTO(complaint);
    }

    @Override
    public List<ComplaintDTO> getGuestComplaints(String guestId) {
        return complaintRepository.findByGuestGuestIdOrderByCreatedAtDesc(guestId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintDTO> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintDTO> getComplaintsByCategory(ComplaintCategory category) {
        return complaintRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintDTO> getComplaintsByPriority(ComplaintPriority priority) {
        return complaintRepository.findByPriorityOrderByCreatedAtDesc(priority)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintDTO> getStaffComplaints(String staffId) {
        return complaintRepository.findByAssignedToStaffIdOrderByCreatedAtDesc(staffId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintDTO> getActiveComplaintsByPriority() {
        List<ComplaintStatus> activeStatuses = Arrays.asList(
                ComplaintStatus.SUBMITTED,
                ComplaintStatus.ACKNOWLEDGED,
                ComplaintStatus.IN_PROGRESS
        );
        return complaintRepository.findActiveComplaintsByPriority(activeStatuses)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Long getComplaintCountByStatus(ComplaintStatus status) {
        return complaintRepository.countByStatus(status);
    }

    private ComplaintDTO mapToDTO(Complaint complaint) {
        return ComplaintDTO.builder()
                .id(complaint.getId())
                .guestId(complaint.getGuest().getGuestId())
                .guestName(complaint.getGuest().getFirstName() + " " + complaint.getGuest().getLastName())
                .reservationId(complaint.getReservation() != null ? complaint.getReservation().getReservationId() : null)
                .category(complaint.getCategory())
                .subject(complaint.getSubject())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .assignedToId(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getStaffId() : null)
                .assignedToName(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getName() : null)
                .attachments(complaint.getAttachments())
                .resolution(complaint.getResolution())
                .internalNotes(complaint.getInternalNotes())
                .createdAt(complaint.getCreatedAt())
                .acknowledgedAt(complaint.getAcknowledgedAt())
                .resolvedAt(complaint.getResolvedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}