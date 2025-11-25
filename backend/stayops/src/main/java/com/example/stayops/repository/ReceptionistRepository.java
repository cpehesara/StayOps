package com.example.stayops.repository;

import com.example.stayops.entity.Receptionist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {
    Optional<Receptionist> findByUserId(Long userId);
    Optional<Receptionist> findByEmail(String email);
}