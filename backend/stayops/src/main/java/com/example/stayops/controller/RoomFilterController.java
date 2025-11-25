package com.example.stayops.controller;

import com.example.stayops.dto.RoomFilterDTO;
import com.example.stayops.entity.Room;
import com.example.stayops.service.RoomFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-filter")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomFilterController {

    private final RoomFilterService roomFilterService;

    @PostMapping("/update-criteria")
    public ResponseEntity<Void> updateFilterCriteria(@RequestBody RoomFilterDTO filterDTO) {
        System.out.println("Received filter update - Room Type: " + filterDTO.getRoomType() +
                ", Check-in: " + filterDTO.getCheckInDate() +
                ", Check-out: " + filterDTO.getCheckOutDate());
        roomFilterService.updateFilterCriteria(filterDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/current-criteria")
    public ResponseEntity<RoomFilterDTO> getCurrentCriteria() {
        RoomFilterDTO criteria = roomFilterService.getCurrentCriteria();
        System.out.println("Returning current criteria - Active: " + criteria.isActive() +
                ", Room Type: " + criteria.getRoomType());
        return ResponseEntity.ok(criteria);
    }

    @GetMapping("/filtered-rooms")
    public ResponseEntity<List<Room>> getFilteredRooms() {
        List<Room> rooms = roomFilterService.getFilteredRooms();
        System.out.println("Returning " + rooms.size() + " filtered rooms to tablet");
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/clear-filter")
    public ResponseEntity<Void> clearFilter() {
        System.out.println("Clearing filter via API");
        roomFilterService.clearFilter();
        return ResponseEntity.ok().build();
    }

    // Guest room selection endpoints
    @PostMapping("/guest-selection")
    public ResponseEntity<Map<String, String>> recordGuestSelection(@RequestBody Map<String, Object> selectionData) {
        String sessionId = (String) selectionData.get("sessionId");
        Long roomId = ((Number) selectionData.get("roomId")).longValue();
        String guestId = (String) selectionData.get("guestId");

        roomFilterService.recordGuestSelection(sessionId, roomId, guestId);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Room selection recorded");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/guest-selection/{sessionId}")
    public ResponseEntity<RoomFilterService.GuestRoomSelection> getGuestSelection(@PathVariable String sessionId) {
        RoomFilterService.GuestRoomSelection selection = roomFilterService.getGuestSelection(sessionId);
        if (selection != null) {
            return ResponseEntity.ok(selection);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/guest-selections")
    public ResponseEntity<Map<String, RoomFilterService.GuestRoomSelection>> getAllGuestSelections() {
        return ResponseEntity.ok(roomFilterService.getAllGuestSelections());
    }

    @DeleteMapping("/guest-selection/{sessionId}")
    public ResponseEntity<Void> clearGuestSelection(@PathVariable String sessionId) {
        roomFilterService.clearGuestSelection(sessionId);
        return ResponseEntity.ok().build();
    }
}