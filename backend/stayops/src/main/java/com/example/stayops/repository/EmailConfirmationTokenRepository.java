package com.example.stayops.repository;

import com.example.stayops.entity.EmailConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailConfirmationTokenRepository extends JpaRepository<EmailConfirmationToken, Long> {
    Optional<EmailConfirmationToken> findByToken(String token);
    Optional<EmailConfirmationToken> findByEmailAndUsedFalse(String email);
    void deleteByGuestId(String guestId);
}