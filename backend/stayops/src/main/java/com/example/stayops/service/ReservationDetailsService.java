package com.example.stayops.service;

import com.example.stayops.dto.ReservationDetailsDTO;

public interface ReservationDetailsService {

    ReservationDetailsDTO saveReservationDetails(Long reservationId, ReservationDetailsDTO dto);

    ReservationDetailsDTO getReservationDetails(Long reservationId);

    ReservationDetailsDTO updateReservationDetails(Long reservationId, ReservationDetailsDTO dto);

    void deleteReservationDetails(Long reservationId);
}
