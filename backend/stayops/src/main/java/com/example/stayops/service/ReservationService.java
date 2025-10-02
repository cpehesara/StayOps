package com.example.stayops.service;

import com.example.stayops.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReservationService {

    // CRUD Operations
    ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO);
    ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO requestDTO);
    void deleteReservation(Long reservationId);
    ReservationResponseDTO getReservationById(Long reservationId);
    List<ReservationResponseDTO> getAllReservations();

    // Calendar & Date-based
    List<ReservationSummaryDTO> getMonthlySummary(int year, int month);
    List<ReservationDayDetailDTO> getReservationsForDate(LocalDate date);
    List<ReservationResponseDTO> getReservationsInDateRange(LocalDate startDate, LocalDate endDate);

    // Room Status
    List<Map<String, Object>> getAllRoomReservationStatuses();
    List<RoomStatusDTO> getRoomStatusForDate(LocalDate date);
    Map<Long, List<RoomStatusDTO>> getRoomStatusForDateRange(LocalDate startDate, LocalDate endDate);

    // Arrivals & Departures
    List<ReservationResponseDTO> getArrivalsForDate(LocalDate date);
    List<ReservationResponseDTO> getDeparturesForDate(LocalDate date);
    DailyOperationsSummaryDTO getDailyOperationsSummary(LocalDate date);

    // Status Management
    ReservationResponseDTO updateReservationStatus(Long reservationId, String status);
    ReservationResponseDTO checkInReservation(Long reservationId);
    ReservationResponseDTO checkOutReservation(Long reservationId);
    ReservationResponseDTO cancelReservation(Long reservationId);

    // Guest & Search
    List<ReservationResponseDTO> getReservationsByGuestId(String guestId);
    List<ReservationResponseDTO> searchReservations(String guestId, String status,
                                                    LocalDate checkInDate, LocalDate checkOutDate);

    // Occupancy
    OccupancyStatsDTO getCurrentOccupancyStats();
    OccupancyStatsDTO getOccupancyStatsForDate(LocalDate date);
}