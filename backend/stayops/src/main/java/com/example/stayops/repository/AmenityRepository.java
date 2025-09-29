package com.example.stayops.repository;

import com.example.stayops.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    @Query(value = """
        SELECT a.* FROM amenity a
        INNER JOIN hotel_amenities ha ON a.id = ha.amenity_id
        WHERE ha.hotel_id = :hotelId
    """, nativeQuery = true)
    List<Amenity> findAmenitiesByHotelId(@Param("hotelId") Long hotelId);
}
