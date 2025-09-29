package com.example.stayops.dto;

import lombok.Data;

@Data
public class ReceptionistResponseDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
}
