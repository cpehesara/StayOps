package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceptionistUpdateDTO {
    private String fullName;
    private String phone;
    private String shiftType;
    private String deskNumber;
    private Boolean active;
}