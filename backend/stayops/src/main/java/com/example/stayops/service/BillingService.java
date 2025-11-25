package com.example.stayops.service;

import com.example.stayops.dto.FolioLineItemDTO;
import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.entity.Reservation;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface BillingService {

    GuestFolioDTO createFolioForReservation(Long reservationId);

    GuestFolioDTO getFolioByReservationId(Long reservationId);

    GuestFolioDTO getFolioByFolioNumber(String folioNumber);

    FolioLineItemDTO addCharge(Long folioId, String itemType, String description,
                               BigDecimal amount, Integer quantity, String department);

    FolioLineItemDTO addRoomCharge(Long reservationId, LocalDate date);

    FolioLineItemDTO addServiceCharge(Long reservationId, Long serviceRequestId,
                                      String serviceType, BigDecimal amount);

    FolioLineItemDTO addPayment(Long folioId, String paymentMethod, BigDecimal amount, String reference);

    GuestFolioDTO settleFolio(Long folioId);

    byte[] generateBillPdf(Long reservationId);

    void sendBillToGuest(Long reservationId);
}