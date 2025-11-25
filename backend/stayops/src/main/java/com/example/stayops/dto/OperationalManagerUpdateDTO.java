package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationalManagerUpdateDTO {
    private String fullName;
    private String phone;
    private String department;
    private String operationalAreas;
    private String shiftType;
    private Boolean active;
}
