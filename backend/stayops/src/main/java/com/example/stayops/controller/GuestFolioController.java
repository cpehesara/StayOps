package com.example.stayops.controller;

import com.example.stayops.dto.FolioLineItemDTO;
import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.dto.GuestFolioSummaryDTO;
import com.example.stayops.service.GuestFolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folios")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class GuestFolioController {

    private final GuestFolioService folioService;

    @PostMapping("/create/{reservationId}")
    public ResponseEntity<GuestFolioDTO> createFolio(@PathVariable Long reservationId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(folioService.createFolio(reservationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestFolioDTO> getFolioById(@PathVariable Long id) {
        return ResponseEntity.ok(folioService.getFolioById(id));
    }

    @GetMapping("/number/{folioNumber}")
    public ResponseEntity<GuestFolioDTO> getFolioByNumber(@PathVariable String folioNumber) {
        return ResponseEntity.ok(folioService.getFolioByNumber(folioNumber));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<GuestFolioDTO> getFolioByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(folioService.getFolioByReservation(reservationId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<GuestFolioSummaryDTO>> getAllFolios() {
        return ResponseEntity.ok(folioService.getAllFolios());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<GuestFolioSummaryDTO>> getFoliosByStatus(@PathVariable String status) {
        return ResponseEntity.ok(folioService.getFoliosByStatus(status));
    }

    @PostMapping("/{folioId}/line-items")
    public ResponseEntity<FolioLineItemDTO> addLineItem(
            @PathVariable Long folioId,
            @RequestBody FolioLineItemDTO lineItemDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(folioService.addLineItem(folioId, lineItemDTO));
    }

    @GetMapping("/{folioId}/line-items")
    public ResponseEntity<List<FolioLineItemDTO>> getFolioLineItems(@PathVariable Long folioId) {
        return ResponseEntity.ok(folioService.getFolioLineItems(folioId));
    }

    @PutMapping("/line-items/{lineItemId}/void")
    public ResponseEntity<Void> voidLineItem(
            @PathVariable Long lineItemId,
            @RequestParam String voidedBy,
            @RequestParam String voidReason) {
        folioService.voidLineItem(lineItemId, voidedBy, voidReason);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{folioId}/settle")
    public ResponseEntity<GuestFolioDTO> settleFolio(@PathVariable Long folioId) {
        return ResponseEntity.ok(folioService.settleFolio(folioId));
    }

    @PutMapping("/{folioId}/close")
    public ResponseEntity<GuestFolioDTO> closeFolio(@PathVariable Long folioId) {
        return ResponseEntity.ok(folioService.closeFolio(folioId));
    }

    @GetMapping("/{folioId}/invoice")
    public ResponseEntity<byte[]> generateInvoice(@PathVariable Long folioId) {
        byte[] invoice = folioService.generateFolioInvoice(folioId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(invoice);
    }
}