package com.example.stayops.repository;

import com.example.stayops.entity.GuestAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuestAccountRepository extends JpaRepository<GuestAccount, Long> {
    Optional<GuestAccount> findByEmail(String email);
}
