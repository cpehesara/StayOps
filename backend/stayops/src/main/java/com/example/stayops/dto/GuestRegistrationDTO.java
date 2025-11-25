package com.example.stayops.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestRegistrationDTO {
    private String email;
    private String password;
    private String confirmPassword;
}
