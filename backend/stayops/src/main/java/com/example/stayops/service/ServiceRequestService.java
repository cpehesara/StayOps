package com.example.stayops.service;

import com.example.stayops.dto.ServiceRequestDTO;

import java.util.List;

public interface ServiceRequestService {
    ServiceRequestDTO createRequest(ServiceRequestDTO dto);
    ServiceRequestDTO updateRequest(Long id, ServiceRequestDTO dto);
    ServiceRequestDTO getRequestById(Long id);
    List<ServiceRequestDTO> getAllRequests();
    void deleteRequest(Long id);
}
