package com.example.stayops.util;

import com.example.stayops.dto.ServiceTypeDTO;
import com.example.stayops.entity.ServiceType;
import org.springframework.stereotype.Component;

@Component
public class ServiceTypeMapper {

    public ServiceTypeDTO toDto(ServiceType entity) {
        if (entity == null) return null;
        return ServiceTypeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .defaultCharge(entity.getDefaultCharge())
                .description(entity.getDescription())
                .build();
    }

    public ServiceType toEntity(ServiceTypeDTO dto) {
        if (dto == null) return null;
        return ServiceType.builder()
                .id(dto.getId())
                .name(dto.getName())
                .code(dto.getCode())
                .defaultCharge(dto.getDefaultCharge())
                .description(dto.getDescription())
                .build();
    }
}
