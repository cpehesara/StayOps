package com.example.stayops.service.impl;

import com.example.stayops.dto.ReservationDetailsDTO;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.ReservationDetails;
import com.example.stayops.entity.Room;
import com.example.stayops.repository.ReservationDetailsRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.service.ReservationDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReservationDetailsServiceImpl implements ReservationDetailsService {

    private final ReservationRepository reservationRepository;
    private final ReservationDetailsRepository reservationDetailsRepository;
    private final RoomRepository roomRepository;

    @Override
    public ReservationDetailsDTO saveReservationDetails(Long reservationId, ReservationDetailsDTO dto) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("Reservation not found with id: " + reservationId));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new NoSuchElementException("Room not found with id: " + dto.getRoomId()));

        ReservationDetails details = ReservationDetails.builder()
                .reservation(reservation)
                .room(room)
                .adults(dto.getAdults())
                .kids(dto.getKids())
                .mealPlan(dto.getMealPlan())
                .specialRequests(dto.getSpecialRequests())
                .amenities(dto.getAmenities())
                .additionalNotes(dto.getAdditionalNotes())
                .build();

        ReservationDetails saved = reservationDetailsRepository.save(details);

        return mapToDTO(saved);
    }

    @Override
    public ReservationDetailsDTO getReservationDetails(Long reservationId) {
        ReservationDetails details = reservationDetailsRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("Reservation details not found for reservation id: " + reservationId));
        return mapToDTO(details);
    }

    @Override
    public ReservationDetailsDTO updateReservationDetails(Long reservationId, ReservationDetailsDTO dto) {
        ReservationDetails details = reservationDetailsRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("Reservation details not found for reservation id: " + reservationId));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new NoSuchElementException("Room not found with id: " + dto.getRoomId()));

        details.setRoom(room);
        details.setAdults(dto.getAdults());
        details.setKids(dto.getKids());
        details.setMealPlan(dto.getMealPlan());
        details.setSpecialRequests(dto.getSpecialRequests());
        details.setAmenities(dto.getAmenities());
        details.setAdditionalNotes(dto.getAdditionalNotes());

        ReservationDetails updated = reservationDetailsRepository.save(details);

        return mapToDTO(updated);
    }

    @Override
    public void deleteReservationDetails(Long reservationId) {
        ReservationDetails details = reservationDetailsRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("Reservation details not found for reservation id: " + reservationId));
        reservationDetailsRepository.delete(details);
    }

    private ReservationDetailsDTO mapToDTO(ReservationDetails details) {
        return ReservationDetailsDTO.builder()
                .reservationId(details.getReservation() != null ? details.getReservation().getReservationId() : null)
                .guestId(details.getReservation() != null && details.getReservation().getGuest() != null
                        ? details.getReservation().getGuest().getGuestId() : null)
                .roomId(details.getRoom() != null ? details.getRoom().getId() : null)
                .roomType(details.getRoom() != null ? details.getRoom().getType() : null)
                .adults(details.getAdults())
                .kids(details.getKids())
                .mealPlan(details.getMealPlan())
                .specialRequests(details.getSpecialRequests())
                .amenities(details.getAmenities())
                .additionalNotes(details.getAdditionalNotes())
                .build();
    }
}
