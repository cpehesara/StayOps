package com.example.stayops.repository;

import com.example.stayops.entity.ReservationDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationDetailsRepository extends JpaRepository<ReservationDetails, Long> {
}
