package com.example.stayops.service.impl;

import com.example.stayops.dto.RoomDTO;
import com.example.stayops.entity.Hotel;
import com.example.stayops.entity.Room;
import com.example.stayops.repository.HotelRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.RoomService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    @Override
    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = Room.builder()
                .roomNumber(roomDTO.getRoomNumber())
                .type(roomDTO.getType())
                .capacity(roomDTO.getCapacity())
                .pricePerNight(roomDTO.getPricePerNight())
                .availabilityStatus(roomDTO.getAvailabilityStatus())
                .floorNumber(roomDTO.getFloorNumber())
                .description(roomDTO.getDescription())
                .build();

        if (roomDTO.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(roomDTO.getHotelId())
                    .orElseThrow(() -> new EntityNotFoundException("Hotel not found: " + roomDTO.getHotelId()));
            room.setHotel(hotel);
        }

        Room saved = roomRepository.save(room);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));

        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setType(roomDTO.getType());
        room.setCapacity(roomDTO.getCapacity());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setAvailabilityStatus(roomDTO.getAvailabilityStatus());
        room.setFloorNumber(roomDTO.getFloorNumber());
        room.setDescription(roomDTO.getDescription());

        if (roomDTO.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(roomDTO.getHotelId())
                    .orElseThrow(() -> new EntityNotFoundException("Hotel not found: " + roomDTO.getHotelId()));
            room.setHotel(hotel);
        }

        Room saved = roomRepository.save(room);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
        roomRepository.delete(room);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
        return mapToDTO(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAvailableRooms() {
        return roomRepository.findByAvailabilityStatus("AVAILABLE").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByType(String type) {
        return roomRepository.findByType(type).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

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
}
