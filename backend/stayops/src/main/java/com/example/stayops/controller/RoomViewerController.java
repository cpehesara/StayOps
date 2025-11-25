package com.example.stayops.controller;

import com.example.stayops.dto.RoomSelectionRequest;
import com.example.stayops.dto.RoomViewerDTO;
import com.example.stayops.service.RoomViewerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-viewer")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class RoomViewerController {

    private final RoomViewerService roomViewerService;

    @GetMapping("/rooms/available")
    public ResponseEntity<List<RoomViewerDTO>> getAvailableRooms() {
        return ResponseEntity.ok(roomViewerService.getAvailableRoomsForViewer());
    }

    @GetMapping("/rooms/{roomId}/details")
    public ResponseEntity<RoomViewerDTO> getRoomDetails(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomViewerService.getRoomDetailsForViewer(roomId));
    }

    @PostMapping("/rooms/{roomId}/select")
    public ResponseEntity<Map<String, Object>> selectRoom(
            @PathVariable Long roomId,
            @RequestBody RoomSelectionRequest request) {
        roomViewerService.selectRoomForReservation(roomId, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Room selected successfully"
        ));
    }
}