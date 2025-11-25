package com.example.stayops.service;

import com.example.stayops.dto.LoginDTO;
import com.example.stayops.dto.UserLoginResponseDTO;
import com.example.stayops.entity.User;
import com.example.stayops.enums.UserRole;

import java.util.List;

public interface UserService {
    UserLoginResponseDTO authenticateUser(LoginDTO loginDTO);
    User getUserById(Long id);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    List<User> getAllUsers();
    List<User> getUsersByRole(UserRole role);
    List<User> getActiveUsers();
    boolean deactivateUser(Long userId);
    boolean activateUser(Long userId);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}