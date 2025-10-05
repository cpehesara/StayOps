package com.example.stayops.service.impl;

import com.example.stayops.dto.ServiceRequestDTO;
import com.example.stayops.entity.ServiceRequest;
import com.example.stayops.repository.ServiceRequestRepository;
import com.example.stayops.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;

    @Override
    @Transactional
    public ServiceRequestDTO createServiceRequest(ServiceRequestDTO dto) {
        log.info("Creating service request: {}", dto);

        ServiceRequest serviceRequest = ServiceRequest.builder()
                .serviceType(dto.getServiceType())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "PENDING")
                .requestedBy(dto.getRequestedBy())
                .priority(dto.getPriority())
                .build();

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRequestDTO getServiceRequestById(Long id) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found: " + id));
        return mapToDTO(serviceRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getAllServiceRequests() {
        return serviceRequestRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceRequestDTO updateServiceRequest(Long id, ServiceRequestDTO dto) {
        log.info("Updating service request: {}", id);

        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found: " + id));

        serviceRequest.setServiceType(dto.getServiceType());
        serviceRequest.setDescription(dto.getDescription());
        serviceRequest.setStatus(dto.getStatus());
        serviceRequest.setPriority(dto.getPriority());

        ServiceRequest updated = serviceRequestRepository.save(serviceRequest);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteServiceRequest(Long id) {
        log.info("Deleting service request: {}", id);
        serviceRequestRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByStatus(String status) {
        return serviceRequestRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByType(String serviceType) {
        return serviceRequestRepository.findByServiceType(serviceType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByPriority(String priority) {
        return serviceRequestRepository.findByPriority(priority).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByReservation(Long reservationId) {
        return serviceRequestRepository.findByReservationReservationId(reservationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByRoom(Long roomId) {
        return serviceRequestRepository.findByRoomId(roomId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByAssignedStaff(String staffId) {
        return serviceRequestRepository.findByAssignedTo(staffId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getPendingRequests() {
        return serviceRequestRepository.findPendingRequests().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getUrgentRequests() {
        return serviceRequestRepository.findUrgentRequests().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceRequestDTO assignToStaff(Long requestId, String staffId) {
        log.info("Assigning service request {} to staff {}", requestId, staffId);

        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found: " + requestId));

        serviceRequest.setAssignedTo(staffId);
        serviceRequest.setStatus("IN_PROGRESS");

        ServiceRequest updated = serviceRequestRepository.save(serviceRequest);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public ServiceRequestDTO updateStatus(Long requestId, String status) {
        log.info("Updating service request {} status to {}", requestId, status);

        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found: " + requestId));

        serviceRequest.setStatus(status);

        if ("COMPLETED".equals(status)) {
            serviceRequest.setCompletedAt(java.time.Instant.now());
        }

        ServiceRequest updated = serviceRequestRepository.save(serviceRequest);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public ServiceRequestDTO markAsCompleted(Long requestId) {
        log.info("Marking service request {} as completed", requestId);

        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found: " + requestId));

        serviceRequest.setStatus("COMPLETED");
        serviceRequest.setCompletedAt(java.time.Instant.now());

        ServiceRequest updated = serviceRequestRepository.save(serviceRequest);
        return mapToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByDateRange(java.time.Instant startDate, java.time.Instant endDate) {
        return serviceRequestRepository.findByDateRange(startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getIncompleteRequests() {
        return serviceRequestRepository.findIncompleteRequests().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ServiceRequestDTO mapToDTO(ServiceRequest entity) {
        return ServiceRequestDTO.builder()
                .id(entity.getId())
                .serviceType(entity.getServiceType())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .requestedBy(entity.getRequestedBy())
                .priority(entity.getPriority())
                .reservationId(entity.getReservation() != null ? entity.getReservation().getReservationId() : null)
                .roomId(entity.getRoom() != null ? entity.getRoom().getId() : null)
                .roomNumber(entity.getRoom() != null ? entity.getRoom().getRoomNumber() : null)
                .assignedTo(entity.getAssignedTo())
                .completedAt(entity.getCompletedAt())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}