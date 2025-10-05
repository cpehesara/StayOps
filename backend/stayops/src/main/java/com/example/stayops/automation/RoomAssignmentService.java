package com.example.stayops.automation;

import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomAssignmentService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public boolean autoAssignRooms(Reservation reservation) {
        log.info("Auto-assigning rooms for reservation: {}", reservation.getReservationId());

        // If rooms already assigned, skip
        if (reservation.getRooms() != null && !reservation.getRooms().isEmpty()) {
            log.info("Rooms already assigned for reservation: {}",
                    reservation.getReservationId());
            return true;
        }

        // Determine number of rooms needed (from reservation details or default to 1)
        int roomsNeeded = calculateRoomsNeeded(reservation);

        // Find available rooms
        List<Room> availableRooms = findAvailableRooms(
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                roomsNeeded
        );

        if (availableRooms.size() < roomsNeeded) {
            log.warn("Insufficient rooms available for reservation: {}. " +
                            "Needed: {}, Available: {}",
                    reservation.getReservationId(), roomsNeeded, availableRooms.size());
            return false;
        }

        // Assign best-fit rooms (smart assignment logic)
        Set<Room> assignedRooms = selectBestRooms(availableRooms, roomsNeeded, reservation);
        reservation.setRoomsCollection(assignedRooms);

        log.info("Successfully auto-assigned {} rooms to reservation: {}",
                assignedRooms.size(), reservation.getReservationId());

        return true;
    }

    private int calculateRoomsNeeded(Reservation reservation) {
        if (reservation.getReservationDetails() != null) {
            int totalGuests = reservation.getReservationDetails().getAdults() +
                    reservation.getReservationDetails().getKids();
            // 2 guests per room, round up
            return Math.max(1, (int) Math.ceil(totalGuests / 2.0));
        }
        return 1; // Default to 1 room
    }

    private List<Room> findAvailableRooms(LocalDate checkIn, LocalDate checkOut, int count) {
        List<Room> allRooms = roomRepository.findAll();

        return allRooms.stream()
                .filter(room -> isRoomAvailable(room, checkIn, checkOut))
                .limit(count * 3) // Get more than needed for better selection
                .collect(Collectors.toList());
    }

    private boolean isRoomAvailable(Room room, LocalDate checkIn, LocalDate checkOut) {
        List<Reservation> conflicts = reservationRepository
                .findOverlappingReservationsForRoom(room.getId(), checkIn, checkOut);

        return conflicts.stream()
                .noneMatch(r -> r.getStatus() != ReservationStatus.CANCELLED &&
                        r.getStatus() != ReservationStatus.CHECKED_OUT);
    }

    private Set<Room> selectBestRooms(List<Room> available, int needed, Reservation reservation) {
        // Smart assignment logic:
        // 1. Prefer rooms on same floor
        // 2. Prefer rooms of matching type
        // 3. Minimize cleaning/housekeeping distance

        Map<String, List<Room>> byFloor = available.stream()
                .filter(r -> r.getFloorNumber() != null)
                .collect(Collectors.groupingBy(Room::getFloorNumber));

        // Try to get all rooms from same floor
        for (List<Room> floorRooms : byFloor.values()) {
            if (floorRooms.size() >= needed) {
                return new HashSet<>(floorRooms.subList(0, needed));
            }
        }

        // Otherwise, prioritize by room type proximity
        Map<String, List<Room>> byType = available.stream()
                .collect(Collectors.groupingBy(Room::getType));

        // Try to get same type rooms
        for (List<Room> typeRooms : byType.values()) {
            if (typeRooms.size() >= needed) {
                return new HashSet<>(typeRooms.subList(0, needed));
            }
        }

        // Last resort: take any available rooms
        return available.stream()
                .limit(needed)
                .collect(Collectors.toSet());
    }

    @Transactional
    public boolean reassignRoom(Reservation reservation, Room oldRoom, Room newRoom) {
        log.info("Reassigning room for reservation {} from {} to {}",
                reservation.getReservationId(), oldRoom.getRoomNumber(), newRoom.getRoomNumber());

        if (!isRoomAvailable(newRoom, reservation.getCheckInDate(), reservation.getCheckOutDate())) {
            log.warn("New room {} not available for reservation {}",
                    newRoom.getRoomNumber(), reservation.getReservationId());
            return false;
        }

        reservation.removeRoom(oldRoom);
        reservation.addRoom(newRoom);

        log.info("Successfully reassigned room for reservation: {}",
                reservation.getReservationId());
        return true;
    }
}