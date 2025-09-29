package com.example.stayops.service;

import com.example.stayops.dto.LoginDTO;
import com.example.stayops.dto.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO authenticateGuest(LoginDTO loginDTO);
    boolean validateToken(String token);
}