package com.example.stayops.service;

import com.example.stayops.dto.ServiceTypeDTO;

import java.util.List;

public interface ServiceTypeService {

    ServiceTypeDTO create(ServiceTypeDTO dto);

    ServiceTypeDTO getById(Long id);

    ServiceTypeDTO getByCode(String code);

    List<ServiceTypeDTO> getAll();

    ServiceTypeDTO update(Long id, ServiceTypeDTO dto);

    void delete(Long id);
}
