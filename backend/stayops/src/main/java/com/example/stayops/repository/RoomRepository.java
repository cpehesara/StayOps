package com.example.stayops.repository;

import com.example.stayops.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByAvailabilityStatus(String availabilityStatus);
    List<Room> findByType(String type);
    List<Room> findByHotelId(Long hotelId);
}
