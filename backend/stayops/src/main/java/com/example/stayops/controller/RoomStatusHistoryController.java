package com.example.stayops.controller;

import com.example.stayops.dto.RoomStatusHistoryDTO;
import com.example.stayops.service.RoomStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-status-history")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class RoomStatusHistoryController {

    private final RoomStatusHistoryService historyService;

    @PostMapping("/create")
    public RoomStatusHistoryDTO createStatusChange(@RequestBody RoomStatusHistoryDTO dto) {
        return historyService.createStatusChange(dto);
    }

    @GetMapping("/room/{roomId}")
    public List<RoomStatusHistoryDTO> getHistoryByRoom(@PathVariable Long roomId) {
        return historyService.getHistoryByRoom(roomId);
    }

    @GetMapping("/getAll")
    public List<RoomStatusHistoryDTO> getAllHistory() {
        return historyService.getAllHistory();
    }
}
