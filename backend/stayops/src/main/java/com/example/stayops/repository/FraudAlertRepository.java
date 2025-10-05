package com.example.stayops.repository;

import com.example.stayops.entity.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {

    List<FraudAlert> findByStatus(String status);

    List<FraudAlert> findByGuestEmail(String email);

    List<FraudAlert> findByIpAddress(String ipAddress);

    @Query("SELECT COUNT(f) FROM FraudAlert f WHERE f.guestEmail = :email " +
            "AND f.createdAt > :since")
    long countRecentAlertsByEmail(@Param("email") String email, @Param("since") Instant since);

    @Query("SELECT COUNT(f) FROM FraudAlert f WHERE f.ipAddress = :ip " +
            "AND f.createdAt > :since")
    long countRecentAlertsByIP(@Param("ip") String ip, @Param("since") Instant since);

    List<FraudAlert> findBySeverityAndStatus(String severity, String status);
}