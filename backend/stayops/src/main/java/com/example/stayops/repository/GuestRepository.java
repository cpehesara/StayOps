package com.example.stayops.repository;

import com.example.stayops.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, String> {
    Optional<Guest> findByEmail(String email);
    Optional<Guest> findByGuestId(String guestId);
}


