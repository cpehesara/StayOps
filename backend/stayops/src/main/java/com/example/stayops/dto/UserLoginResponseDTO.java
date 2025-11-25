package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLoginResponseDTO {
    private String token;
    private String email;
    private String username;
    private String fullName;
    private String role;      // SYSTEM_ADMIN, SERVICE_MANAGER, OPERATIONAL_MANAGER, RECEPTIONIST
    private String userId;    // User table ID
    private String entityId;  // Specific entity table ID (system_admins, service_managers, etc.)
    private String message;
}