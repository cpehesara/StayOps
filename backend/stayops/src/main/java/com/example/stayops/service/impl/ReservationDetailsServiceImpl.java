package com.example.stayops.service.impl;

import com.example.stayops.dto.ReservationDetailsDTO;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.ReservationDetails;
import com.example.stayops.repository.ReservationDetailsRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.service.ReservationDetailsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationDetailsServiceImpl implements ReservationDetailsService {

    private final ReservationDetailsRepository reservationDetailsRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public ReservationDetailsDTO saveReservationDetails(Long reservationId, ReservationDetailsDTO dto) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        ReservationDetails existingDetails = reservationDetailsRepository.findById(reservationId).orElse(null);

        ReservationDetails details;

        if (existingDetails != null) {
            details = existingDetails;
        } else {
            details = new ReservationDetails();
            details.setReservationId(reservationId);  // Set the ID explicitly
            details.setReservation(reservation);
        }

        details.setAdults(dto.getAdults() != null ? dto.getAdults() : 1);
        details.setKids(dto.getKids() != null ? dto.getKids() : 0);
        details.setMealPlan(dto.getMealPlan());
        details.setAmenities(dto.getAmenities());
        details.setSpecialRequests(dto.getSpecialRequests());
        details.setAdditionalNotes(dto.getAdditionalNotes());

        ReservationDetails saved = reservationDetailsRepository.save(details);

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationDetailsDTO getReservationDetails(Long reservationId) {
        ReservationDetails details = reservationDetailsRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Reservation details not found for reservation: " + reservationId));

        return mapToDTO(details);
    }

    @Override
    @Transactional
    public ReservationDetailsDTO updateReservationDetails(Long reservationId, ReservationDetailsDTO dto) {
        ReservationDetails details = reservationDetailsRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Reservation details not found for reservation: " + reservationId));

        details.setAdults(dto.getAdults() != null ? dto.getAdults() : details.getAdults());
        details.setKids(dto.getKids() != null ? dto.getKids() : details.getKids());
        details.setMealPlan(dto.getMealPlan() != null ? dto.getMealPlan() : details.getMealPlan());
        details.setAmenities(dto.getAmenities() != null ? dto.getAmenities() : details.getAmenities());
        details.setSpecialRequests(dto.getSpecialRequests() != null ? dto.getSpecialRequests() : details.getSpecialRequests());
        details.setAdditionalNotes(dto.getAdditionalNotes() != null ? dto.getAdditionalNotes() : details.getAdditionalNotes());

        ReservationDetails saved = reservationDetailsRepository.save(details);

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteReservationDetails(Long reservationId) {
        if (reservationDetailsRepository.existsById(reservationId)) {
            reservationDetailsRepository.deleteById(reservationId);
        }
    }

    private ReservationDetailsDTO mapToDTO(ReservationDetails details) {
        return ReservationDetailsDTO.builder()
                .id(details.getReservationId())  // Use reservationId as the id in DTO
                .reservationId(details.getReservationId())
                .adults(details.getAdults())
                .kids(details.getKids())
                .mealPlan(details.getMealPlan())
                .amenities(details.getAmenities())
                .specialRequests(details.getSpecialRequests())
                .additionalNotes(details.getAdditionalNotes())
                .build();
    }
}
