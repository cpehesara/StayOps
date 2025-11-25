package com.example.stayops.repository;

import com.example.stayops.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    // Optional: Use JOIN FETCH for better performance (avoids N+1 query problem)
    @Query("SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.departments " +
            "LEFT JOIN FETCH h.rooms " +
            "LEFT JOIN FETCH h.staffMembers")
    List<Hotel> findAllWithRelations();

    @Query("SELECT h FROM Hotel h " +
            "LEFT JOIN FETCH h.departments " +
            "LEFT JOIN FETCH h.rooms " +
            "LEFT JOIN FETCH h.staffMembers " +
            "WHERE h.id = :id")
    Optional<Hotel> findByIdWithRelations(Long id);
}