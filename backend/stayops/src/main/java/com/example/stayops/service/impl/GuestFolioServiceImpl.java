package com.example.stayops.service.impl;

import com.example.stayops.dto.FolioLineItemDTO;
import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.dto.GuestFolioSummaryDTO;
import com.example.stayops.entity.*;
import com.example.stayops.enums.FolioStatus;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.repository.FolioLineItemRepository;
import com.example.stayops.repository.GuestFolioRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.service.GuestFolioService;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GuestFolioServiceImpl implements GuestFolioService {

    private final GuestFolioRepository folioRepository;
    private final FolioLineItemRepository lineItemRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public GuestFolioDTO createFolio(Long reservationId) {
        log.info("Creating folio for reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (folioRepository.findByReservationReservationId(reservationId).isPresent()) {
            throw new IllegalStateException("Folio already exists for reservation: " + reservationId);
        }

        String folioNumber = generateFolioNumber();

        GuestFolio folio = GuestFolio.builder()
                .folioNumber(folioNumber)
                .reservation(reservation)
                .status(FolioStatus.OPEN)
                .totalCharges(BigDecimal.ZERO)
                .totalPayments(BigDecimal.ZERO)
                .balance(BigDecimal.ZERO)
                .currency("USD")
                .build();

        GuestFolio saved = folioRepository.save(folio);
        log.info("Folio created: {}", folioNumber);

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestFolioDTO getFolioById(Long id) {
        GuestFolio folio = folioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "id", id));
        return mapToDTO(folio);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestFolioDTO getFolioByNumber(String folioNumber) {
        GuestFolio folio = folioRepository.findByFolioNumber(folioNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "folioNumber", folioNumber));
        return mapToDTO(folio);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestFolioDTO getFolioByReservation(Long reservationId) {
        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "reservationId", reservationId));
        return mapToDTO(folio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestFolioSummaryDTO> getAllFolios() {
        return folioRepository.findAll().stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestFolioSummaryDTO> getFoliosByStatus(String status) {
        FolioStatus folioStatus = FolioStatus.valueOf(status.toUpperCase());
        return folioRepository.findByStatus(folioStatus).stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FolioLineItemDTO addLineItem(Long folioId, FolioLineItemDTO dto) {
        log.info("Adding line item to folio: {}", folioId);

        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "id", folioId));

        if (folio.getStatus() != FolioStatus.OPEN) {
            throw new IllegalStateException("Cannot add items to non-open folio");
        }

        FolioLineItem lineItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDate.now())
                .itemType(dto.getItemType())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .reference(dto.getReference())
                .postedBy(dto.getPostedBy())
                .department(dto.getDepartment())
                .notes(dto.getNotes())
                .isVoided(false)
                .build();

        FolioLineItem saved = lineItemRepository.save(lineItem);

        folio.recalculateBalance();
        folioRepository.save(folio);

        log.info("Line item added: {}", saved.getId());
        return mapLineItemToDTO(saved);
    }

    @Override
    public void voidLineItem(Long lineItemId, String voidedBy, String voidReason) {
        log.info("Voiding line item: {}", lineItemId);

        FolioLineItem lineItem = lineItemRepository.findById(lineItemId)
                .orElseThrow(() -> new ResourceNotFoundException("LineItem", "id", lineItemId));

        if (lineItem.getIsVoided()) {
            throw new IllegalStateException("Line item already voided");
        }

        lineItem.setIsVoided(true);
        lineItem.setVoidedBy(voidedBy);
        lineItem.setVoidedAt(Instant.now());
        lineItem.setVoidReason(voidReason);

        lineItemRepository.save(lineItem);

        GuestFolio folio = lineItem.getFolio();
        folio.recalculateBalance();
        folioRepository.save(folio);

        log.info("Line item voided: {}", lineItemId);
    }

    @Override
    public GuestFolioDTO settleFolio(Long folioId) {
        log.info("Settling folio: {}", folioId);

        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "id", folioId));

        if (folio.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalStateException("Cannot settle folio with outstanding balance: $" + folio.getBalance());
        }

        folio.setStatus(FolioStatus.SETTLED);
        folio.setSettledAt(Instant.now());

        GuestFolio saved = folioRepository.save(folio);
        log.info("Folio settled: {}", folio.getFolioNumber());

        return mapToDTO(saved);
    }

    @Override
    public GuestFolioDTO closeFolio(Long folioId) {
        log.info("Closing folio: {}", folioId);

        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "id", folioId));

        folio.setStatus(FolioStatus.CLOSED);
        folio.setClosedAt(Instant.now());

        GuestFolio saved = folioRepository.save(folio);
        log.info("Folio closed: {}", folio.getFolioNumber());

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolioLineItemDTO> getFolioLineItems(Long folioId) {
        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio", "id", folioId));

        return folio.getLineItems().stream()
                .filter(item -> !item.getIsVoided())
                .map(this::mapLineItemToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateFolioInvoice(Long folioId) {
        log.info("Generating PDF invoice for folio: {}", folioId);

        try {
            GuestFolio folio = folioRepository.findById(folioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folio", "id", folioId));

            Reservation reservation = folio.getReservation();
            Guest guest = reservation.getGuest();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("HOTEL INVOICE")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("123 Main Street, City, State 12345")
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Phone: (555) 123-4567 | Email: info@hotel.com")
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("\n"));

            Table headerTable = new Table(2);
            headerTable.setWidth(UnitValue.createPercentValue(100));

            headerTable.addCell(new Cell().add(new Paragraph("Invoice Number: " + folio.getFolioNumber())));
            headerTable.addCell(new Cell().add(new Paragraph("Date: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE))));

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("GUEST INFORMATION").setBold());
            Table guestTable = new Table(2);
            guestTable.setWidth(UnitValue.createPercentValue(100));

            guestTable.addCell(new Cell().add(new Paragraph("Name:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getFirstName() + " " + guest.getLastName())));

            guestTable.addCell(new Cell().add(new Paragraph("Email:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getEmail())));

            guestTable.addCell(new Cell().add(new Paragraph("Phone:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getPhone())));

            guestTable.addCell(new Cell().add(new Paragraph("ID:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getIdentityNumber() != null ? guest.getIdentityNumber() : "N/A")));

            document.add(guestTable);
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("RESERVATION DETAILS").setBold());
            Table resTable = new Table(2);
            resTable.setWidth(UnitValue.createPercentValue(100));

            resTable.addCell(new Cell().add(new Paragraph("Reservation ID:")));
            resTable.addCell(new Cell().add(new Paragraph(String.valueOf(reservation.getReservationId()))));

            resTable.addCell(new Cell().add(new Paragraph("Check-in Date:")));
            resTable.addCell(new Cell().add(new Paragraph(reservation.getCheckInDate().toString())));

            resTable.addCell(new Cell().add(new Paragraph("Check-out Date:")));
            resTable.addCell(new Cell().add(new Paragraph(reservation.getCheckOutDate().toString())));

            String roomNumbers = reservation.getRooms().stream()
                    .map(Room::getRoomNumber)
                    .collect(Collectors.joining(", "));
            resTable.addCell(new Cell().add(new Paragraph("Room(s):")));
            resTable.addCell(new Cell().add(new Paragraph(roomNumbers)));

            document.add(resTable);
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("CHARGES SUMMARY").setBold());
            Table chargesTable = new Table(new float[]{3, 1, 1, 1});
            chargesTable.setWidth(UnitValue.createPercentValue(100));

            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Qty").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()));

            for (FolioLineItem item : folio.getLineItems()) {
                if (!item.getIsVoided()) {
                    chargesTable.addCell(new Cell().add(new Paragraph(item.getDescription())));
                    chargesTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity() != null ? item.getQuantity() : 1))));
                    chargesTable.addCell(new Cell().add(new Paragraph("$" + (item.getUnitPrice() != null ? item.getUnitPrice().toString() : "0.00"))));
                    chargesTable.addCell(new Cell().add(new Paragraph("$" + item.getAmount().abs().toString())));
                }
            }

            document.add(chargesTable);
            document.add(new Paragraph("\n"));

            Table totalsTable = new Table(2);
            totalsTable.setWidth(UnitValue.createPercentValue(50));
            totalsTable.setMarginLeft(250);

            totalsTable.addCell(new Cell().add(new Paragraph("Total Charges:").setBold()));
            totalsTable.addCell(new Cell().add(new Paragraph("$" + folio.getTotalCharges().toString())));

            totalsTable.addCell(new Cell().add(new Paragraph("Total Payments:").setBold()));
            totalsTable.addCell(new Cell().add(new Paragraph("$" + folio.getTotalPayments().toString())));

            totalsTable.addCell(new Cell().add(new Paragraph("Balance Due:").setBold()));
            totalsTable.addCell(new Cell().add(new Paragraph("$" + folio.getBalance().toString()).setBold()));

            document.add(totalsTable);
            document.add(new Paragraph("\n\n"));

            document.add(new Paragraph("Thank you for staying with us!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.add(new Paragraph("For any questions regarding this invoice, please contact our front desk.")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10));

            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating invoice PDF: ", e);
            throw new RuntimeException("Failed to generate invoice", e);
        }
    }

    private String generateFolioNumber() {
        return "FO-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private GuestFolioDTO mapToDTO(GuestFolio folio) {
        Reservation reservation = folio.getReservation();
        Guest guest = reservation != null ? reservation.getGuest() : null;

        return GuestFolioDTO.builder()
                .id(folio.getId())
                .folioNumber(folio.getFolioNumber())
                .reservationId(reservation != null ? reservation.getReservationId() : null)
                .guestId(guest != null ? guest.getGuestId() : null)
                .guestName(guest != null ? guest.getFirstName() + " " + guest.getLastName() : null)
                .status(folio.getStatus())
                .totalCharges(folio.getTotalCharges())
                .totalPayments(folio.getTotalPayments())
                .balance(folio.getBalance())
                .currency(folio.getCurrency())
                .depositAmount(folio.getDepositAmount())
                .incidentalDeposit(folio.getIncidentalDeposit())
                .settledAt(folio.getSettledAt())
                .closedAt(folio.getClosedAt())
                .notes(folio.getNotes())
                .createdAt(folio.getCreatedAt())
                .updatedAt(folio.getUpdatedAt())
                .lineItems(folio.getLineItems().stream()
                        .filter(item -> !item.getIsVoided())
                        .map(this::mapLineItemToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private GuestFolioSummaryDTO mapToSummaryDTO(GuestFolio folio) {
        Reservation reservation = folio.getReservation();
        Guest guest = reservation != null ? reservation.getGuest() : null;

        String roomNumber = null;
        if (reservation != null && reservation.getRooms() != null && !reservation.getRooms().isEmpty()) {
            Room firstRoom = reservation.getRooms().stream().findFirst().orElse(null);
            roomNumber = firstRoom != null ? firstRoom.getRoomNumber() : null;
        }

        return GuestFolioSummaryDTO.builder()
                .id(folio.getId())
                .folioNumber(folio.getFolioNumber())
                .reservationId(reservation != null ? reservation.getReservationId() : null)
                .guestName(guest != null ? guest.getFirstName() + " " + guest.getLastName() : null)
                .guestEmail(guest != null ? guest.getEmail() : null)
                .roomNumber(roomNumber)
                .status(folio.getStatus())
                .totalCharges(folio.getTotalCharges())
                .totalPayments(folio.getTotalPayments())
                .balance(folio.getBalance())
                .currency(folio.getCurrency())
                .createdAt(folio.getCreatedAt())
                .updatedAt(folio.getUpdatedAt())
                .settledAt(folio.getSettledAt())
                .build();
    }

    private FolioLineItemDTO mapLineItemToDTO(FolioLineItem item) {
        return FolioLineItemDTO.builder()
                .id(item.getId())
                .folioId(item.getFolio() != null ? item.getFolio().getId() : null)
                .transactionDate(item.getTransactionDate())
                .itemType(item.getItemType())
                .description(item.getDescription())
                .amount(item.getAmount())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .reference(item.getReference())
                .postedBy(item.getPostedBy())
                .department(item.getDepartment())
                .notes(item.getNotes())
                .isVoided(item.getIsVoided())
                .voidedBy(item.getVoidedBy())
                .voidedAt(item.getVoidedAt())
                .voidReason(item.getVoidReason())
                .createdAt(item.getCreatedAt())
                .build();
    }
}