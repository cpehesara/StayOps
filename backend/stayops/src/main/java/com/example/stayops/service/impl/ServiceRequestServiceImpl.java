package com.example.stayops.service.impl;

import com.example.stayops.dto.ServiceRequestDTO;
import com.example.stayops.entity.*;
import com.example.stayops.repository.*;
import com.example.stayops.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    @Override
    public ServiceRequestDTO createRequest(ServiceRequestDTO dto) {
        ServiceRequest request = ServiceRequest.builder()
                .reservation(reservationRepository.findById(dto.getReservationId()).orElseThrow())
                .guest(guestRepository.findById(dto.getGuestId()).orElseThrow())
                .room(roomRepository.findById(dto.getRoomId()).orElseThrow())
                .serviceType(serviceTypeRepository.findById(dto.getServiceTypeId()).orElseThrow())
                .assignedTo(dto.getAssignedTo())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .build();

        return toDTO(serviceRequestRepository.save(request));
    }

    @Override
    public ServiceRequestDTO updateRequest(Long id, ServiceRequestDTO dto) {
        ServiceRequest request = serviceRequestRepository.findById(id).orElseThrow();
        request.setAssignedTo(dto.getAssignedTo());
        request.setDescription(dto.getDescription());
        request.setStatus(dto.getStatus());
        return toDTO(serviceRequestRepository.save(request));
    }

    @Override
    public ServiceRequestDTO getRequestById(Long id) {
        return toDTO(serviceRequestRepository.findById(id).orElseThrow());
    }

    @Override
    public List<ServiceRequestDTO> getAllRequests() {
        return serviceRequestRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRequest(Long id) {
        serviceRequestRepository.deleteById(id);
    }

    private ServiceRequestDTO toDTO(ServiceRequest entity) {
        return ServiceRequestDTO.builder()
                .requestId(entity.getRequestId())
                .reservationId(entity.getReservation().getReservationId())
                .guestId(entity.getGuest().getGuestId())
                .roomId(entity.getRoom().getId())
                .serviceTypeId(entity.getServiceType().getId())
                .assignedTo(entity.getAssignedTo())
                .description(entity.getDescription())
                .requestAt(entity.getRequestAt())
                .status(entity.getStatus())
                .build();
    }
}
