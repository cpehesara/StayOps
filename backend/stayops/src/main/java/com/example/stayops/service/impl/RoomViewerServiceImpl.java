package com.example.stayops.service.impl;

import com.example.stayops.dto.RoomSelectionRequest;
import com.example.stayops.dto.RoomViewerDTO;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.RoomViewerService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomViewerServiceImpl implements RoomViewerService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomViewerDTO> getAvailableRoomsForViewer() {
        return roomRepository.findByAvailabilityStatus("AVAILABLE").stream()
                .map(this::mapToViewerDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomViewerDTO getRoomDetailsForViewer(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
        return mapToViewerDTO(room);
    }

    @Override
    @Transactional
    public void selectRoomForReservation(Long roomId, RoomSelectionRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));

        if (!"AVAILABLE".equals(room.getAvailabilityStatus())) {
            throw new IllegalStateException("Room is not available");
        }

        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + request.getReservationId()));

        reservation.getRooms().add(room);
        reservation.setUpdatedAt(Instant.now());
        reservationRepository.save(reservation);

        room.setAvailabilityStatus("RESERVED");
        roomRepository.save(room);
    }

    private RoomViewerDTO mapToViewerDTO(Room room) {
        Integer floorNum = null;
        try {
            floorNum = Integer.parseInt(room.getFloorNumber());
        } catch (NumberFormatException e) {
            // Ignore
        }

        return RoomViewerDTO.builder()
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getType())
                .pricePerNight(room.getPricePerNight())
                .panoramaUrl(room.getPanoramaUrl())
                .galleryImages(room.getGalleryImages())
                .amenities(room.getAmenities())
                .viewType(room.getViewType())
                .squareFootage(room.getSquareFootage())
                .bedType(room.getBedType())
                .floorNumber(floorNum)
                .status(room.getAvailabilityStatus())
                .description(room.getDescription())
                .build();
    }
}