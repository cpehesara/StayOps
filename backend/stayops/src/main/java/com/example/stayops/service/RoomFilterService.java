package com.example.stayops.service;

import com.example.stayops.dto.RoomFilterDTO;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomFilterService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private RoomFilterDTO currentFilterCriteria = new RoomFilterDTO();
    private final Map<String, GuestRoomSelection> guestSelections = new HashMap<>();

    public void updateFilterCriteria(RoomFilterDTO filterDTO) {
        this.currentFilterCriteria = filterDTO;
        this.currentFilterCriteria.setActive(true);
        System.out.println("Filter updated - Room Type: " + filterDTO.getRoomType() +
                ", Check-in: " + filterDTO.getCheckInDate() +
                ", Check-out: " + filterDTO.getCheckOutDate());
    }

    public RoomFilterDTO getCurrentCriteria() {
        return this.currentFilterCriteria;
    }

    public List<Room> getFilteredRooms() {
        List<Room> availableRooms = roomRepository.findByAvailabilityStatus("AVAILABLE");

        System.out.println("Total available rooms: " + availableRooms.size());

        if (!currentFilterCriteria.isActive()) {
            return availableRooms;
        }

        List<Room> filtered = availableRooms.stream()
                .filter(this::matchesFilterCriteria)
                .collect(Collectors.toList());

        System.out.println("Filtered rooms count: " + filtered.size());
        return filtered;
    }

    private boolean matchesFilterCriteria(Room room) {
        // If room type filter is specified
        if (currentFilterCriteria.getRoomType() != null &&
                !currentFilterCriteria.getRoomType().trim().isEmpty()) {

            String filterType = currentFilterCriteria.getRoomType().trim();
            String roomType = room.getType() != null ? room.getType().trim() : "";

            // Skip "all" filter
            if (filterType.equalsIgnoreCase("all")) {
                return checkDateAvailability(room);
            }

            // Case-insensitive comparison
            if (!roomType.equalsIgnoreCase(filterType)) {
                return false;
            }
        }

        // Check date availability
        return checkDateAvailability(room);
    }

    private boolean checkDateAvailability(Room room) {
        if (currentFilterCriteria.getCheckInDate() != null &&
                currentFilterCriteria.getCheckOutDate() != null) {

            LocalDate checkIn = currentFilterCriteria.getCheckInDate();
            LocalDate checkOut = currentFilterCriteria.getCheckOutDate();

            // Get all reservations that include this room
            List<Reservation> allReservations = reservationRepository.findAll();

            for (Reservation reservation : allReservations) {
                // Skip cancelled reservations
                if ("CANCELLED".equals(reservation.getStatus())) {
                    continue;
                }

                // Check if this reservation includes our room
                if (reservation.getRooms() != null && reservation.getRooms().contains(room.getId())) {
                    LocalDate resCheckIn = reservation.getCheckInDate();
                    LocalDate resCheckOut = reservation.getCheckOutDate();

                    // Check for date overlap
                    // Overlap occurs if: checkIn < resCheckOut AND checkOut > resCheckIn
                    if (checkIn.isBefore(resCheckOut) && checkOut.isAfter(resCheckIn)) {
                        System.out.println("Room " + room.getRoomNumber() + " is NOT available - conflicts with reservation " + reservation.getReservationId());
                        return false;
                    }
                }
            }

            System.out.println("Room " + room.getRoomNumber() + " is available for selected dates");
            return true;
        }

        return true;
    }

    public void clearFilter() {
        System.out.println("Filter cleared");
        this.currentFilterCriteria = new RoomFilterDTO();
        this.currentFilterCriteria.setActive(false);
    }

    // Guest room selection methods
    public void recordGuestSelection(String sessionId, Long roomId, String guestId) {
        GuestRoomSelection selection = new GuestRoomSelection();
        selection.setSessionId(sessionId);
        selection.setRoomId(roomId);
        selection.setGuestId(guestId);
        selection.setTimestamp(System.currentTimeMillis());

        guestSelections.put(sessionId, selection);
        System.out.println("Guest selection recorded - Session: " + sessionId + ", Room: " + roomId + ", Guest: " + guestId);
    }

    public GuestRoomSelection getGuestSelection(String sessionId) {
        return guestSelections.get(sessionId);
    }

    public Map<String, GuestRoomSelection> getAllGuestSelections() {
        // Clean up old selections (older than 1 hour)
        long oneHourAgo = System.currentTimeMillis() - (60 * 60 * 1000);
        guestSelections.entrySet().removeIf(entry -> entry.getValue().getTimestamp() < oneHourAgo);
        return new HashMap<>(guestSelections);
    }

    public void clearGuestSelection(String sessionId) {
        guestSelections.remove(sessionId);
        System.out.println("Guest selection cleared for session: " + sessionId);
    }

    // Inner class for guest selection
    public static class GuestRoomSelection {
        private String sessionId;
        private Long roomId;
        private String guestId;
        private long timestamp;

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }

        public String getGuestId() { return guestId; }
        public void setGuestId(String guestId) { this.guestId = guestId; }

        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}