package com.example.stayops.service.impl;

import com.example.stayops.dto.ServiceTypeDTO;
import com.example.stayops.entity.ServiceType;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.repository.ServiceTypeRepository;
import com.example.stayops.service.ServiceTypeService;
import com.example.stayops.util.ServiceTypeMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Validated
@Transactional
public class ServiceTypeServiceImpl implements ServiceTypeService {

    private final ServiceTypeRepository repository;
    private final ServiceTypeMapper mapper;

    @Override
    public ServiceTypeDTO create(ServiceTypeDTO dto) {
        log.debug("Creating ServiceType with code={}", dto.getCode());
        ServiceType entity = mapper.toEntity(dto);
        // ensure id not set
        entity.setId(null);
        ServiceType saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public ServiceTypeDTO getById(Long id) {
        ServiceType st = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType", "id", id));
        return mapper.toDto(st);
    }

    @Override
    public ServiceTypeDTO getByCode(String code) {
        ServiceType st = repository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType", "code", code));
        return mapper.toDto(st);
    }

    @Override
    public List<ServiceTypeDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceTypeDTO update(Long id, ServiceTypeDTO dto) {
        ServiceType existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType", "id", id));
        // update fields
        existing.setName(dto.getName());
        existing.setCode(dto.getCode());
        existing.setDefaultCharge(dto.getDefaultCharge());
        existing.setDescription(dto.getDescription());
        ServiceType updated = repository.save(existing);
        return mapper.toDto(updated);
    }

    @Override
    public void delete(Long id) {
        ServiceType existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType", "id", id));
        repository.delete(existing);
    }
}
