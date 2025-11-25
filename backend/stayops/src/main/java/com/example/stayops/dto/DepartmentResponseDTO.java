package com.example.stayops.dto;

import com.example.stayops.enums.DepartmentStatus;
import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String headOfDepartment;
    private String head; // Alias for frontend compatibility
    private String email;
    private String phone;
    private String location;
    private String workingHours;
    private String hours; // Alias for frontend compatibility
    private DepartmentStatus status;
    private Integer performance;

    // Staff metrics
    private Integer totalStaff;
    private Integer staffCount; // Alias for frontend compatibility
    private Integer activeStaff;
    private Integer activeCount; // Alias for frontend compatibility
    private Integer onLeaveStaff;
    private Integer leaveCount; // Alias for frontend compatibility
    private Integer inactiveStaff;

    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastUpdated; // Alias for frontend compatibility
}