package com.example.stayops.repository;

import com.example.stayops.entity.RoomBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomBlockRepository extends JpaRepository<RoomBlock, Long> {

    Optional<RoomBlock> findByBlockCode(String blockCode);

    List<RoomBlock> findByHotelIdAndIsActive(Long hotelId, Boolean isActive);

    // Find blocks with available rooms
    @Query("SELECT b FROM RoomBlock b " +
            "WHERE b.isActive = true " +
            "AND (b.numberOfRooms - COALESCE(b.roomsBooked, 0)) > 0 " +
            "AND b.startDate <= :date " +
            "AND b.endDate >= :date")
    List<RoomBlock> findBlocksWithAvailability(@Param("date") LocalDate date);

    // Find blocks expiring soon (cutoff date approaching)
    @Query("SELECT b FROM RoomBlock b " +
            "WHERE b.isActive = true " +
            "AND b.cutOffDate BETWEEN :startDate AND :endDate")
    List<RoomBlock> findBlocksExpiringSoon(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Find blocks overlapping with date range
    @Query("SELECT b FROM RoomBlock b " +
            "WHERE b.hotel.id = :hotelId " +
            "AND b.isActive = true " +
            "AND b.startDate < :checkOutDate " +
            "AND b.endDate > :checkInDate")
    List<RoomBlock> findOverlappingBlocks(
            @Param("hotelId") Long hotelId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );
}