package com.example.stayops.controller;

import com.example.stayops.dto.FolioLineItemDTO;
import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/folios/reservation/{reservationId}")
    public ResponseEntity<GuestFolioDTO> createFolioForReservation(@PathVariable Long reservationId) {
        log.info("Creating folio for reservation: {}", reservationId);
        GuestFolioDTO folio = billingService.createFolioForReservation(reservationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(folio);
    }

    @GetMapping("/folios/reservation/{reservationId}")
    public ResponseEntity<GuestFolioDTO> getFolioByReservationId(@PathVariable Long reservationId) {
        log.info("Getting folio for reservation: {}", reservationId);
        GuestFolioDTO folio = billingService.getFolioByReservationId(reservationId);
        return ResponseEntity.ok(folio);
    }

    @GetMapping("/folios/{folioNumber}")
    public ResponseEntity<GuestFolioDTO> getFolioByFolioNumber(@PathVariable String folioNumber) {
        log.info("Getting folio: {}", folioNumber);
        GuestFolioDTO folio = billingService.getFolioByFolioNumber(folioNumber);
        return ResponseEntity.ok(folio);
    }

    @PostMapping("/folios/{folioId}/charges")
    public ResponseEntity<FolioLineItemDTO> addCharge(
            @PathVariable Long folioId,
            @RequestParam String itemType,
            @RequestParam String description,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String department) {
        log.info("Adding charge to folio: {}", folioId);
        FolioLineItemDTO lineItem = billingService.addCharge(
                folioId, itemType, description, amount, quantity, department);
        return ResponseEntity.status(HttpStatus.CREATED).body(lineItem);
    }

    @PostMapping("/folios/reservation/{reservationId}/room-charge")
    public ResponseEntity<FolioLineItemDTO> addRoomCharge(
            @PathVariable Long reservationId,
            @RequestParam(required = false) LocalDate date) {
        log.info("Adding room charge for reservation: {}", reservationId);
        LocalDate chargeDate = date != null ? date : LocalDate.now();
        FolioLineItemDTO lineItem = billingService.addRoomCharge(reservationId, chargeDate);
        return ResponseEntity.status(HttpStatus.CREATED).body(lineItem);
    }

    @PostMapping("/folios/reservation/{reservationId}/service-charge")
    public ResponseEntity<FolioLineItemDTO> addServiceCharge(
            @PathVariable Long reservationId,
            @RequestParam Long serviceRequestId,
            @RequestParam String serviceType,
            @RequestParam(required = false) BigDecimal amount) {
        log.info("Adding service charge for reservation: {}", reservationId);
        FolioLineItemDTO lineItem = billingService.addServiceCharge(
                reservationId, serviceRequestId, serviceType, amount);
        return ResponseEntity.status(HttpStatus.CREATED).body(lineItem);
    }

    @PostMapping("/folios/{folioId}/payments")
    public ResponseEntity<FolioLineItemDTO> addPayment(
            @PathVariable Long folioId,
            @RequestParam String paymentMethod,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String reference) {
        log.info("Adding payment to folio: {}", folioId);
        FolioLineItemDTO lineItem = billingService.addPayment(folioId, paymentMethod, amount, reference);
        return ResponseEntity.status(HttpStatus.CREATED).body(lineItem);
    }

    @PostMapping("/folios/{folioId}/settle")
    public ResponseEntity<GuestFolioDTO> settleFolio(@PathVariable Long folioId) {
        log.info("Settling folio: {}", folioId);
        GuestFolioDTO folio = billingService.settleFolio(folioId);
        return ResponseEntity.ok(folio);
    }

    @GetMapping("/folios/reservation/{reservationId}/bill/pdf")
    public ResponseEntity<byte[]> getBillPdf(@PathVariable Long reservationId) {
        log.info("Generating PDF bill for reservation: {}", reservationId);
        byte[] pdfData = billingService.generateBillPdf(reservationId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "bill_" + reservationId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
    }

    @PostMapping("/folios/reservation/{reservationId}/bill/send")
    public ResponseEntity<String> sendBillToGuest(@PathVariable Long reservationId) {
        log.info("Sending bill to guest for reservation: {}", reservationId);
        billingService.sendBillToGuest(reservationId);
        return ResponseEntity.ok("Bill sent successfully to guest");
    }
}