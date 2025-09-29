package com.example.stayops.service;

import com.example.stayops.dto.RoomStatusHistoryDTO;
import java.util.List;

public interface RoomStatusHistoryService {
    RoomStatusHistoryDTO createStatusChange(RoomStatusHistoryDTO dto);
    List<RoomStatusHistoryDTO> getHistoryByRoom(Long roomId);
    List<RoomStatusHistoryDTO> getAllHistory();
}
