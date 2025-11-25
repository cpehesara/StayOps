package com.example.stayops.repository;

import com.example.stayops.entity.ServiceManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceManagerRepository extends JpaRepository<ServiceManager, Long> {
    Optional<ServiceManager> findByUserId(Long userId);
    Optional<ServiceManager> findByEmail(String email);
}