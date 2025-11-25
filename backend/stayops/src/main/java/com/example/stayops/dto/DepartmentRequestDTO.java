package com.example.stayops.dto;

import com.example.stayops.enums.DepartmentStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentRequestDTO {
    private String name;
    private String description;
    private String headOfDepartment;
    private String email;
    private String phone;
    private String location;
    private String workingHours;
    private DepartmentStatus status;
    private Integer performance;
    private Long hotelId;
}