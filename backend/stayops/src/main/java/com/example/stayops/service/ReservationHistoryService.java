package com.example.stayops.service;

import com.example.stayops.dto.ReservationHistoryDTO;

import java.util.List;

public interface ReservationHistoryService {
    ReservationHistoryDTO recordHistory(ReservationHistoryDTO dto);
    List<ReservationHistoryDTO> getHistoryByReservation(Long reservationId);
}
