package com.example.stayops.repository;

import com.example.stayops.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RateSnapshotRepository extends JpaRepository<RateSnapshot, Long> {
    Optional<RateSnapshot> findByReservationReservationId(Long reservationId);
}