package com.example.stayops.service;

import com.example.stayops.dto.ServiceManagerCreateDTO;
import com.example.stayops.dto.ServiceManagerUpdateDTO;
import com.example.stayops.dto.ServiceManagerResponseDTO;

import java.util.List;

public interface ServiceManagerService {
    ServiceManagerResponseDTO createServiceManager(ServiceManagerCreateDTO dto);
    ServiceManagerResponseDTO updateServiceManager(Long id, ServiceManagerUpdateDTO dto);
    ServiceManagerResponseDTO getServiceManagerById(Long id);
    List<ServiceManagerResponseDTO> getAllServiceManagers();
    boolean deleteServiceManager(Long id);
    ServiceManagerResponseDTO getServiceManagerByUserId(Long userId);
}