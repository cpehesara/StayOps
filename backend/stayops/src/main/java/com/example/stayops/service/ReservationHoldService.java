package com.example.stayops.service;

import com.example.stayops.dto.ReservationHoldRequestDTO;
import com.example.stayops.dto.ReservationHoldResponseDTO;

import java.util.List;

public interface ReservationHoldService {

    /**
     * Create a new reservation hold with TTL
     */
    ReservationHoldResponseDTO createHold(ReservationHoldRequestDTO request);

    /**
     * Get hold by token
     */
    ReservationHoldResponseDTO getHoldByToken(String holdToken);

    /**
     * Convert hold to confirmed reservation
     */
    Long convertHoldToReservation(String holdToken);

    /**
     * Cancel/release a hold manually
     */
    void cancelHold(String holdToken);

    /**
     * Extend hold expiry time
     */
    ReservationHoldResponseDTO extendHold(String holdToken, Integer additionalMinutes);

    /**
     * Process expired holds (called by scheduler)
     */
    int processExpiredHolds();

    /**
     * Get active holds for a guest
     */
    List<ReservationHoldResponseDTO> getActiveHoldsByGuest(String guestId);
}