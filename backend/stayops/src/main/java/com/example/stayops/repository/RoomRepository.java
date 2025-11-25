package com.example.stayops.repository;

import com.example.stayops.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByAvailabilityStatus(String availabilityStatus);
    List<Room> findByType(String type);
    List<Room> findByHotelId(Long hotelId);
    Optional<Room> findByRoomNumber(String roomNumber);

    @Query("SELECT r FROM Room r WHERE r.availabilityStatus = 'AVAILABLE' ORDER BY r.floorNumber, r.roomNumber")
    List<Room> findAvailableRoomsOrdered();
}