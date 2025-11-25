package com.example.stayops.service;

import com.example.stayops.dto.FolioLineItemDTO;
import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.dto.GuestFolioSummaryDTO;

import java.util.List;

public interface GuestFolioService {

    GuestFolioDTO createFolio(Long reservationId);

    GuestFolioDTO getFolioById(Long id);

    GuestFolioDTO getFolioByNumber(String folioNumber);

    GuestFolioDTO getFolioByReservation(Long reservationId);

    List<GuestFolioSummaryDTO> getAllFolios();

    List<GuestFolioSummaryDTO> getFoliosByStatus(String status);

    FolioLineItemDTO addLineItem(Long folioId, FolioLineItemDTO lineItemDTO);

    void voidLineItem(Long lineItemId, String voidedBy, String voidReason);

    GuestFolioDTO settleFolio(Long folioId);

    GuestFolioDTO closeFolio(Long folioId);

    List<FolioLineItemDTO> getFolioLineItems(Long folioId);

    byte[] generateFolioInvoice(Long folioId);
}