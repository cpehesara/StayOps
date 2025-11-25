package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAdminCreateDTO {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String phone;
    private String department;
    private String permissions;
}