package com.example.stayops.service;

import com.example.stayops.dto.RoomSelectionRequest;
import com.example.stayops.dto.RoomViewerDTO;

import java.util.List;

public interface RoomViewerService {
    List<RoomViewerDTO> getAvailableRoomsForViewer();
    RoomViewerDTO getRoomDetailsForViewer(Long roomId);
    void selectRoomForReservation(Long roomId, RoomSelectionRequest request);
}