package com.example.stayops.service.impl;

import com.example.stayops.dto.FolioLineItemDTO;
import com.example.stayops.dto.GuestFolioDTO;
import com.example.stayops.entity.*;
import com.example.stayops.enums.FolioStatus;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.*;
import com.example.stayops.service.BillingService;
import com.example.stayops.service.EmailService;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final GuestFolioRepository folioRepository;
    private final FolioLineItemRepository lineItemRepository;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final EmailService emailService;

    // Tax rate configuration
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10%
    private static final BigDecimal DEPOSIT_PERCENTAGE = new BigDecimal("0.10"); // 10% deposit before check-in

    @Override
    @Transactional
    public GuestFolioDTO createFolioForReservation(Long reservationId) {
        log.info("Creating folio for reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        // Check if folio already exists
        if (folioRepository.findByReservationReservationId(reservationId).isPresent()) {
            log.warn("Folio already exists for reservation: {}", reservationId);
            return getFolioByReservationId(reservationId);
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
        log.info("Folio created successfully: {}", folioNumber);

        // Add initial deposit charge (10% of total room cost)
        addInitialDepositCharge(saved, reservation);

        return mapToDTO(saved);
    }

    /**
     * Adds initial 10% deposit charge before check-in
     */
    private void addInitialDepositCharge(GuestFolio folio, Reservation reservation) {
        log.info("Adding initial deposit charge for reservation: {}", reservation.getReservationId());

        long numberOfNights = ChronoUnit.DAYS.between(
                reservation.getCheckInDate(),
                reservation.getCheckOutDate()
        );

        if (numberOfNights <= 0) {
            numberOfNights = 1;
        }

        BigDecimal totalRoomRate = BigDecimal.ZERO;

        for (Room room : reservation.getRooms()) {
            BigDecimal roomRate = room.getPricePerNight() != null
                    ? BigDecimal.valueOf(room.getPricePerNight())
                    : BigDecimal.valueOf(100.00);

            totalRoomRate = totalRoomRate.add(roomRate.multiply(BigDecimal.valueOf(numberOfNights)));
        }

        // Calculate 10% deposit
        BigDecimal depositAmount = totalRoomRate.multiply(DEPOSIT_PERCENTAGE)
                .setScale(2, RoundingMode.HALF_UP);

        FolioLineItem depositItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(LocalDate.now())
                .itemType("ADVANCE_DEPOSIT")
                .description("Advance Deposit (10% of total room charges)")
                .amount(depositAmount)
                .quantity(1)
                .unitPrice(depositAmount)
                .department("FRONT_DESK")
                .postedBy("SYSTEM_AUTO")
                .reference(UUID.randomUUID().toString())
                .isVoided(false)
                .notes("Pre-check-in deposit - Will be adjusted upon check-in")
                .build();

        folio.addLineItem(depositItem);
        folio.setDepositAmount(depositAmount);
        folioRepository.save(folio);

        log.info("Initial deposit of ${} added to folio", depositAmount);
    }

    /**
     * Updates folio to full room charges on check-in
     */
    @Transactional
    public void updateFolioOnCheckIn(Long reservationId) {
        log.info("Updating folio to full charges on check-in for reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found for reservation: " + reservationId));

        // Void the deposit line item
        List<FolioLineItem> depositItems = lineItemRepository.findByFolioIdAndItemType(
                folio.getId(), "ADVANCE_DEPOSIT");

        for (FolioLineItem depositItem : depositItems) {
            if (!depositItem.getIsVoided()) {
                depositItem.setIsVoided(true);
                depositItem.setVoidedBy("SYSTEM_AUTO");
                depositItem.setVoidedAt(Instant.now());
                depositItem.setVoidReason("Check-in completed - Converting to full charges");
                lineItemRepository.save(depositItem);
            }
        }

        // Add full room charges
        long numberOfNights = ChronoUnit.DAYS.between(
                reservation.getCheckInDate(),
                reservation.getCheckOutDate()
        );

        if (numberOfNights <= 0) {
            numberOfNights = 1;
        }

        for (Room room : reservation.getRooms()) {
            BigDecimal roomRate = room.getPricePerNight() != null
                    ? BigDecimal.valueOf(room.getPricePerNight())
                    : BigDecimal.valueOf(100.00);

            BigDecimal totalRoomCharge = roomRate.multiply(BigDecimal.valueOf(numberOfNights));

            FolioLineItem lineItem = FolioLineItem.builder()
                    .folio(folio)
                    .transactionDate(LocalDate.now())
                    .itemType("ROOM_CHARGE")
                    .description(String.format("Room %s - %d night(s) @ $%.2f/night",
                            room.getRoomNumber(), numberOfNights, roomRate))
                    .amount(totalRoomCharge)
                    .quantity((int) numberOfNights)
                    .unitPrice(roomRate)
                    .department("FRONT_DESK")
                    .postedBy("SYSTEM_AUTO")
                    .reference(UUID.randomUUID().toString())
                    .isVoided(false)
                    .notes("Full room charges posted on check-in")
                    .build();

            folio.addLineItem(lineItem);
        }

        // Add tax on room charges
        addTaxCharge(folio, "Room Tax (10%)");

        // Add incidental deposit hold
        BigDecimal incidentalDeposit = new BigDecimal("50.00"); // Standard incidental deposit
        folio.setIncidentalDeposit(incidentalDeposit);

        folioRepository.save(folio);
        log.info("Folio updated to full charges for reservation: {}", reservationId);
    }

    /**
     * Adds daily room charge (for posting at midnight)
     */
    @Transactional
    public void addDailyRoomCharge(Long reservationId, LocalDate date) {
        log.info("Adding daily room charge for reservation: {} on date: {}", reservationId, date);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found for reservation: " + reservationId));

        // Only add charges for checked-in guests
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            log.warn("Skipping daily charge - reservation not checked in: {}", reservationId);
            return;
        }

        // Check if date is within reservation period
        if (date.isBefore(reservation.getCheckInDate()) || date.isAfter(reservation.getCheckOutDate())) {
            log.warn("Date {} is outside reservation period", date);
            return;
        }

        for (Room room : reservation.getRooms()) {
            BigDecimal roomRate = room.getPricePerNight() != null
                    ? BigDecimal.valueOf(room.getPricePerNight())
                    : BigDecimal.valueOf(100.00);

            FolioLineItem lineItem = FolioLineItem.builder()
                    .folio(folio)
                    .transactionDate(date)
                    .itemType("DAILY_ROOM_CHARGE")
                    .description(String.format("Room %s - Night of %s",
                            room.getRoomNumber(), date.format(DateTimeFormatter.ISO_LOCAL_DATE)))
                    .amount(roomRate)
                    .quantity(1)
                    .unitPrice(roomRate)
                    .department("FRONT_DESK")
                    .postedBy("SYSTEM_AUTO")
                    .reference(UUID.randomUUID().toString())
                    .isVoided(false)
                    .build();

            folio.addLineItem(lineItem);
        }

        folioRepository.save(folio);
        log.info("Daily room charge added for reservation: {}", reservationId);
    }

    @Override
    @Transactional
    public FolioLineItemDTO addRoomCharge(Long reservationId, LocalDate date) {
        addDailyRoomCharge(reservationId, date);
        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found"));

        // Return the last added line item
        FolioLineItem lastItem = folio.getLineItems().get(folio.getLineItems().size() - 1);
        return mapLineItemToDTO(lastItem);
    }

    @Override
    @Transactional
    public FolioLineItemDTO addServiceCharge(Long reservationId, Long serviceRequestId,
                                             String serviceType, BigDecimal amount) {
        log.info("Adding service charge for reservation: {}, service: {}", reservationId, serviceType);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found for reservation: " + reservationId));

        if (folio.getStatus() != FolioStatus.OPEN) {
            throw new IllegalStateException("Cannot add charges to a closed folio");
        }

        // Determine service amount if not provided
        if (amount == null) {
            amount = getServiceAmount(serviceType);
        }

        FolioLineItem lineItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(LocalDate.now())
                .itemType("SERVICE_CHARGE")
                .description(String.format("%s (Service Request #%d)", serviceType, serviceRequestId))
                .amount(amount)
                .quantity(1)
                .unitPrice(amount)
                .department(getServiceDepartment(serviceType))
                .postedBy("SYSTEM_AUTO")
                .reference("SR-" + serviceRequestId)
                .isVoided(false)
                .notes("Auto-posted from service request")
                .build();

        folio.addLineItem(lineItem);
        FolioLineItem saved = lineItemRepository.save(lineItem);

        // Add tax on service if applicable
        if (isServiceTaxable(serviceType)) {
            addTaxOnAmount(folio, amount, "Service Tax on " + serviceType);
        }

        folioRepository.save(folio);
        log.info("Service charge of ${} added for {}", amount, serviceType);

        return mapLineItemToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestFolioDTO getFolioByReservationId(Long reservationId) {
        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found for reservation: " + reservationId));
        return mapToDTO(folio);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestFolioDTO getFolioByFolioNumber(String folioNumber) {
        GuestFolio folio = folioRepository.findByFolioNumber(folioNumber)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found: " + folioNumber));
        return mapToDTO(folio);
    }

    @Override
    @Transactional
    public FolioLineItemDTO addCharge(Long folioId, String itemType, String description,
                                      BigDecimal amount, Integer quantity, String department) {
        log.info("Adding manual charge to folio: {}", folioId);

        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found: " + folioId));

        if (folio.getStatus() != FolioStatus.OPEN) {
            throw new IllegalStateException("Cannot add charges to a closed folio");
        }

        BigDecimal unitPrice = amount;
        if (quantity != null && quantity > 1) {
            unitPrice = amount.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP);
        }

        FolioLineItem lineItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(LocalDate.now())
                .itemType(itemType)
                .description(description)
                .amount(amount)
                .quantity(quantity != null ? quantity : 1)
                .unitPrice(unitPrice)
                .department(department)
                .postedBy("FRONT_DESK")
                .reference(UUID.randomUUID().toString())
                .isVoided(false)
                .build();

        folio.addLineItem(lineItem);
        FolioLineItem saved = lineItemRepository.save(lineItem);
        folioRepository.save(folio);

        log.info("Manual charge added to folio: {}", folioId);
        return mapLineItemToDTO(saved);
    }

    @Override
    @Transactional
    public FolioLineItemDTO addPayment(Long folioId, String paymentMethod, BigDecimal amount, String reference) {
        log.info("Adding payment to folio: {}", folioId);

        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found: " + folioId));

        // Payment is negative amount
        BigDecimal paymentAmount = amount.negate();

        FolioLineItem lineItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(LocalDate.now())
                .itemType("PAYMENT")
                .description(String.format("Payment via %s", paymentMethod))
                .amount(paymentAmount)
                .quantity(1)
                .unitPrice(paymentAmount)
                .department("FRONT_DESK")
                .postedBy("FRONT_DESK")
                .reference(reference != null ? reference : UUID.randomUUID().toString())
                .isVoided(false)
                .build();

        folio.addLineItem(lineItem);
        FolioLineItem saved = lineItemRepository.save(lineItem);
        folioRepository.save(folio);

        log.info("Payment of ${} added to folio", amount);
        return mapLineItemToDTO(saved);
    }

    @Override
    @Transactional
    public GuestFolioDTO settleFolio(Long folioId) {
        log.info("Settling folio: {}", folioId);

        GuestFolio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found: " + folioId));

        if (folio.getStatus() == FolioStatus.SETTLED) {
            log.warn("Folio already settled: {}", folioId);
            return mapToDTO(folio);
        }

        // Check if balance is zero or paid
        folio.recalculateBalance();

        if (folio.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Cannot settle folio with outstanding balance: $" + folio.getBalance());
        }

        folio.setStatus(FolioStatus.SETTLED);
        folio.setSettledAt(Instant.now());

        GuestFolio saved = folioRepository.save(folio);
        log.info("Folio settled successfully: {}", folioId);

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public byte[] generateBillPdf(Long reservationId) {
        log.info("Generating PDF bill for reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found: " + reservationId));

        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found for reservation: " + reservationId));

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            document.add(new Paragraph("HOTEL INVOICE")
                    .setBold()
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Folio Number: " + folio.getFolioNumber())
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Date: " + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Guest Information
            Guest guest = reservation.getGuest();
            document.add(new Paragraph("GUEST INFORMATION").setBold());
            Table guestTable = new Table(2);
            guestTable.setWidth(UnitValue.createPercentValue(100));

            guestTable.addCell(new Cell().add(new Paragraph("Name:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getFirstName() + " " + guest.getLastName())));

            guestTable.addCell(new Cell().add(new Paragraph("Email:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getEmail())));

            guestTable.addCell(new Cell().add(new Paragraph("Phone:")));
            guestTable.addCell(new Cell().add(new Paragraph(guest.getPhone())));

            document.add(guestTable);
            document.add(new Paragraph("\n"));

            // Reservation Details
            document.add(new Paragraph("RESERVATION DETAILS").setBold());
            Table resTable = new Table(2);
            resTable.setWidth(UnitValue.createPercentValue(100));

            resTable.addCell(new Cell().add(new Paragraph("Reservation ID:")));
            resTable.addCell(new Cell().add(new Paragraph(String.valueOf(reservation.getReservationId()))));

            resTable.addCell(new Cell().add(new Paragraph("Check-in:")));
            resTable.addCell(new Cell().add(new Paragraph(reservation.getCheckInDate().toString())));

            resTable.addCell(new Cell().add(new Paragraph("Check-out:")));
            resTable.addCell(new Cell().add(new Paragraph(reservation.getCheckOutDate().toString())));

            String roomNumbers = reservation.getRooms().stream()
                    .map(Room::getRoomNumber)
                    .collect(Collectors.joining(", "));
            resTable.addCell(new Cell().add(new Paragraph("Room(s):")));
            resTable.addCell(new Cell().add(new Paragraph(roomNumbers)));

            document.add(resTable);
            document.add(new Paragraph("\n"));

            // Itemized Charges
            document.add(new Paragraph("ITEMIZED CHARGES").setBold());
            Table chargesTable = new Table(new float[]{2, 4, 1, 2, 2});
            chargesTable.setWidth(UnitValue.createPercentValue(100));

            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Qty").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setBold()));
            chargesTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()));

            List<FolioLineItem> items = lineItemRepository.findByFolioIdOrderByTransactionDateDesc(folio.getId());
            for (FolioLineItem item : items) {
                if (!item.getIsVoided()) {
                    chargesTable.addCell(new Cell().add(new Paragraph(item.getTransactionDate().toString())));
                    chargesTable.addCell(new Cell().add(new Paragraph(item.getDescription())));
                    chargesTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity() != null ? item.getQuantity() : 1))));

                    String unitPriceStr = item.getUnitPrice() != null
                            ? String.format("$%.2f", item.getUnitPrice().abs())
                            : "$0.00";
                    chargesTable.addCell(new Cell().add(new Paragraph(unitPriceStr)));

                    String amountStr = String.format("$%.2f", item.getAmount().abs());
                    if (item.getAmount().compareTo(BigDecimal.ZERO) < 0) {
                        amountStr = "(" + amountStr + ")"; // Show payments in parentheses
                    }
                    chargesTable.addCell(new Cell().add(new Paragraph(amountStr)));
                }
            }

            document.add(chargesTable);
            document.add(new Paragraph("\n"));

            // Summary
            Table summaryTable = new Table(2);
            summaryTable.setWidth(UnitValue.createPercentValue(50));
            summaryTable.setMarginLeft(250);

            summaryTable.addCell(new Cell().add(new Paragraph("Total Charges:").setBold()));
            summaryTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", folio.getTotalCharges())).setBold()));

            summaryTable.addCell(new Cell().add(new Paragraph("Total Payments:").setBold()));
            summaryTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", folio.getTotalPayments())).setBold()));

            summaryTable.addCell(new Cell().add(new Paragraph("Balance Due:").setBold()));
            summaryTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", folio.getBalance())).setBold()));

            document.add(summaryTable);

            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("Thank you for staying with us!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.add(new Paragraph("For any questions regarding this invoice, please contact our front desk.")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10));

            document.close();

            log.info("PDF bill generated successfully for reservation: {}", reservationId);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF bill", e);
            throw new RuntimeException("Failed to generate PDF bill: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void sendBillToGuest(Long reservationId) {
        log.info("Sending bill to guest for reservation: {}", reservationId);

        GuestFolio folio = folioRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Folio not found for reservation: " + reservationId));

        Guest guest = folio.getReservation().getGuest();
        byte[] pdfBill = generateBillPdf(reservationId);

        String subject = "Your Hotel Invoice - Folio #" + folio.getFolioNumber();
        String body = buildEmailBody(folio, guest);

        try {
            emailService.sendEmailWithAttachment(
                    guest.getEmail(),
                    subject,
                    body,
                    pdfBill,
                    "invoice_" + folio.getFolioNumber() + ".pdf"
            );
            log.info("Invoice sent successfully to {}", guest.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email with invoice", e);
            throw new RuntimeException("Failed to send invoice email: " + e.getMessage());
        }
    }

    // Helper methods

    private void addTaxCharge(GuestFolio folio, String description) {
        BigDecimal taxableAmount = folio.getLineItems().stream()
                .filter(item -> !item.getIsVoided())
                .filter(item -> item.getItemType().contains("ROOM_CHARGE"))
                .map(FolioLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxAmount = taxableAmount.multiply(TAX_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        FolioLineItem taxItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(LocalDate.now())
                .itemType("TAX")
                .description(description)
                .amount(taxAmount)
                .quantity(1)
                .unitPrice(taxAmount)
                .department("FRONT_DESK")
                .postedBy("SYSTEM_AUTO")
                .reference(UUID.randomUUID().toString())
                .isVoided(false)
                .build();

        folio.addLineItem(taxItem);
    }

    private void addTaxOnAmount(GuestFolio folio, BigDecimal amount, String description) {
        BigDecimal taxAmount = amount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);

        FolioLineItem taxItem = FolioLineItem.builder()
                .folio(folio)
                .transactionDate(LocalDate.now())
                .itemType("TAX")
                .description(description)
                .amount(taxAmount)
                .quantity(1)
                .unitPrice(taxAmount)
                .department("FRONT_DESK")
                .postedBy("SYSTEM_AUTO")
                .reference(UUID.randomUUID().toString())
                .isVoided(false)
                .build();

        folio.addLineItem(taxItem);
    }

    private BigDecimal getServiceAmount(String serviceType) {
        // Default service prices
        return switch (serviceType.toUpperCase()) {
            case "ROOM_SERVICE" -> new BigDecimal("25.00");
            case "LAUNDRY" -> new BigDecimal("15.00");
            case "MINIBAR" -> new BigDecimal("10.00");
            case "SPA" -> new BigDecimal("75.00");
            case "PARKING" -> new BigDecimal("20.00");
            case "WIFI" -> new BigDecimal("10.00");
            case "BREAKFAST" -> new BigDecimal("20.00");
            default -> new BigDecimal("10.00");
        };
    }

    private String getServiceDepartment(String serviceType) {
        return switch (serviceType.toUpperCase()) {
            case "ROOM_SERVICE" -> "F&B";
            case "LAUNDRY" -> "HOUSEKEEPING";
            case "MINIBAR" -> "F&B";
            case "SPA" -> "SPA";
            case "PARKING" -> "FACILITIES";
            case "WIFI" -> "IT";
            case "BREAKFAST" -> "F&B";
            default -> "GENERAL";
        };
    }

    private boolean isServiceTaxable(String serviceType) {
        // Most services are taxable except certain items
        return !serviceType.equalsIgnoreCase("PARKING");
    }

    private String generateFolioNumber() {
        String prefix = "INV";
        String timestamp = String.valueOf(System.currentTimeMillis());
        return prefix + timestamp.substring(timestamp.length() - 10);
    }

    private String buildEmailBody(GuestFolio folio, Guest guest) {
        return String.format("""
                Dear %s %s,
                
                Thank you for staying with us!
                
                Please find attached your invoice for your recent stay.
                
                Invoice Details:
                ─────────────────────────────────
                Folio Number: %s
                Check-in: %s
                Check-out: %s
                
                Total Charges: $%.2f
                Total Payments: $%.2f
                Balance Due: $%.2f
                ─────────────────────────────────
                
                We hope you enjoyed your stay and look forward to welcoming you again soon!
                
                If you have any questions regarding this invoice, please don't hesitate to contact our front desk.
                
                Best regards,
                Hotel Management Team
                
                ---
                This is an automated email. Please do not reply directly to this message.
                """,
                guest.getFirstName(), guest.getLastName(),
                folio.getFolioNumber(),
                folio.getReservation().getCheckInDate(),
                folio.getReservation().getCheckOutDate(),
                folio.getTotalCharges(),
                folio.getTotalPayments(),
                folio.getBalance()
        );
    }

    private GuestFolioDTO mapToDTO(GuestFolio folio) {
        List<FolioLineItemDTO> lineItems = folio.getLineItems().stream()
                .map(this::mapLineItemToDTO)
                .collect(Collectors.toList());

        return GuestFolioDTO.builder()
                .id(folio.getId())
                .folioNumber(folio.getFolioNumber())
                .reservationId(folio.getReservation().getReservationId())
                .guestId(folio.getReservation().getGuest().getGuestId())
                .guestName(folio.getReservation().getGuest().getFirstName() + " " +
                        folio.getReservation().getGuest().getLastName())
                .status(folio.getStatus())
                .lineItems(lineItems)
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
                .build();
    }

    private FolioLineItemDTO mapLineItemToDTO(FolioLineItem item) {
        return FolioLineItemDTO.builder()
                .id(item.getId())
                .folioId(item.getFolio().getId())
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