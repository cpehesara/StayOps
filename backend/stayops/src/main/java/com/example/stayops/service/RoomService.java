package com.example.stayops.service;

import com.example.stayops.dto.RoomDTO;
import java.util.List;

public interface RoomService {
    RoomDTO createRoom(RoomDTO roomDTO);
    RoomDTO updateRoom(Long id, RoomDTO roomDTO);
    void deleteRoom(Long id);
    RoomDTO getRoomById(Long id);
    List<RoomDTO> getAllRooms();
    List<RoomDTO> getAvailableRooms();
    List<RoomDTO> getRoomsByType(String type);
    List<RoomDTO> getRoomsByHotel(Long hotelId);
}