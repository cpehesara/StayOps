package com.example.stayops.repository;

import com.example.stayops.entity.OperationalManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperationalManagerRepository extends JpaRepository<OperationalManager, Long> {
    Optional<OperationalManager> findByUserId(Long userId);
    Optional<OperationalManager> findByEmail(String email);
}