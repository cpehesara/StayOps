package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceManagerUpdateDTO {
    private String fullName;
    private String phone;
    private String department;
    private String serviceAreas;
    private String certification;
    private Boolean active;
}