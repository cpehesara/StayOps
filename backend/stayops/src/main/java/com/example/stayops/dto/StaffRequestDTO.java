package com.example.stayops.dto;

import com.example.stayops.enums.StaffRole;
import com.example.stayops.enums.StaffStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffRequestDTO {
    private String staffId;
    private String name;
    private String email;
    private String phone;
    private StaffRole role;
    private StaffStatus status;
    private LocalDate hireDate;
    private Long departmentId;   // Link to Department
}
