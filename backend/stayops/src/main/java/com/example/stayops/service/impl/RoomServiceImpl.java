package com.example.stayops.service.impl;

import com.example.stayops.dto.RoomDTO;
import com.example.stayops.entity.Hotel;
import com.example.stayops.entity.Room;
import com.example.stayops.repository.HotelRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    private RoomDTO mapToDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .type(room.getType())
                .capacity(room.getCapacity())
                .pricePerNight(room.getPricePerNight())
                .availabilityStatus(room.getAvailabilityStatus())
                .floorNumber(room.getFloorNumber())
                .description(room.getDescription())
                .hotelId(room.getHotel() != null ? room.getHotel().getId() : null)
                .build();
    }

    private Room mapToEntity(RoomDTO dto) {
        Hotel hotel = dto.getHotelId() != null
                ? hotelRepository.findById(dto.getHotelId()).orElse(null)
                : null;

        return Room.builder()
                .id(dto.getId())
                .roomNumber(dto.getRoomNumber())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .pricePerNight(dto.getPricePerNight())
                .availabilityStatus(dto.getAvailabilityStatus())
                .floorNumber(dto.getFloorNumber())
                .description(dto.getDescription())
                .hotel(hotel)
                .build();
    }

    @Override
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = mapToEntity(roomDTO);
        return mapToDTO(roomRepository.save(room));
    }

    @Override
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        existing.setRoomNumber(roomDTO.getRoomNumber());
        existing.setType(roomDTO.getType());
        existing.setCapacity(roomDTO.getCapacity());
        existing.setPricePerNight(roomDTO.getPricePerNight());
        existing.setAvailabilityStatus(roomDTO.getAvailabilityStatus());
        existing.setFloorNumber(roomDTO.getFloorNumber());
        existing.setDescription(roomDTO.getDescription());
        if (roomDTO.getHotelId() != null) {
            existing.setHotel(hotelRepository.findById(roomDTO.getHotelId()).orElse(null));
        }
        return mapToDTO(roomRepository.save(existing));
    }

    @Override
    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    @Override
    public RoomDTO getRoomById(Long id) {
        return roomRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    @Override
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> getAvailableRooms() {
        return roomRepository.findByAvailabilityStatus("Available").stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> getRoomsByType(String type) {
        return roomRepository.findByType(type).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }
}
