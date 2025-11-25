package com.example.stayops.repository;

import com.example.stayops.entity.SystemAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {
    Optional<SystemAdmin> findByUserId(Long userId);
    Optional<SystemAdmin> findByEmail(String email);
}