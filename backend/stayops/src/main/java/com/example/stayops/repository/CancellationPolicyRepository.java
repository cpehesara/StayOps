package com.example.stayops.repository;

import com.example.stayops.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, Long> {
    Optional<CancellationPolicy> findByPolicyCode(String policyCode);
    List<CancellationPolicy> findByHotelIdAndIsActive(Long hotelId, Boolean isActive);
}