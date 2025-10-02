package com.example.stayops.repository;

import com.example.stayops.entity.ReservationDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReservationDetailsRepository extends JpaRepository<ReservationDetails, Long> {

    // Remove the custom query since we're using reservation_id as the primary key
    // The default findById will work now
}