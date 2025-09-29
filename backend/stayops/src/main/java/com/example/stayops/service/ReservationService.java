package com.example.stayops.service;

import com.example.stayops.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReservationService {

    ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO);

    ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO requestDTO);

    void deleteReservation(Long reservationId);

    ReservationResponseDTO getReservationById(Long reservationId);

    List<ReservationResponseDTO> getAllReservations();

    List<ReservationSummaryDTO> getMonthlySummary(int year, int month);

    List<ReservationDayDetailDTO> getReservationsForDate(LocalDate date);

    List<Map<String, Object>> getAllRoomReservationStatuses();

    List<ReservationResponseDTO> getReservationsInDateRange(LocalDate startDate, LocalDate endDate);
}
