package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestResponseDTO {
    private String guestId;
    private String fullName;
    private String email;
    private String phone;
    private String nationality;
    private String identityType;
    private String identityNumber;
    private String qrCodeBase64;
    private String imageUrl;
}
