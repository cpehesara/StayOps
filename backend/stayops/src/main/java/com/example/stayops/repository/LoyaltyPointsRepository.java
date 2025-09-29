package com.example.stayops.repository;

import com.example.stayops.entity.LoyaltyPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoyaltyPointsRepository extends JpaRepository<LoyaltyPoints, Long> {
    Optional<LoyaltyPoints> findByGuestGuestId(String guestId);
}
