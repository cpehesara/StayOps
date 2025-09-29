package com.example.stayops.dto;

import lombok.Data;

@Data
public class ReceptionistRegisterDTO {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phone;
}
