package com.example.stayops.automation;

import com.example.stayops.entity.PricingRule;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.PricingRuleRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicPricingService {

    private final PricingRuleRepository pricingRuleRepository;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    // Base prices in LKR
    private static final BigDecimal BASE_STANDARD_PRICE = new BigDecimal("15000"); // LKR 15,000
    private static final BigDecimal BASE_DELUXE_PRICE = new BigDecimal("25000");   // LKR 25,000
    private static final BigDecimal BASE_SUITE_PRICE = new BigDecimal("40000");    // LKR 40,000

    /**
     * Calculate dynamic price for a room based on check-in date and demand
     */
    public BigDecimal calculateDynamicPrice(Room room, LocalDate checkInDate, LocalDate checkOutDate) {
        log.info("Calculating dynamic price for room {} on date {}",
                room.getRoomNumber(), checkInDate);

        // Start with base price based on room type
        BigDecimal basePrice = getBasePrice(room);

        // Calculate days to arrival
        long daysToArrival = ChronoUnit.DAYS.between(LocalDate.now(), checkInDate);

        // Calculate current occupancy
        BigDecimal occupancyRate = calculateOccupancyRate(checkInDate, checkOutDate);

        // Get day of week
        DayOfWeek dayOfWeek = checkInDate.getDayOfWeek();

        // Apply all active pricing rules in order
        List<PricingRule> rules = pricingRuleRepository.findActiveRulesInOrder();
        BigDecimal finalPrice = basePrice;

        for (PricingRule rule : rules) {
            if (isRuleApplicable(rule, daysToArrival, occupancyRate, checkInDate, dayOfWeek)) {
                finalPrice = applyPricingRule(finalPrice, rule);
                log.debug("Applied rule '{}': {} LKR", rule.getRuleName(), finalPrice);
            }
        }

        // Round to nearest 100 LKR
        finalPrice = finalPrice.divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        log.info("Final dynamic price for room {}: {} LKR (base: {} LKR)",
                room.getRoomNumber(), finalPrice, basePrice);

        return finalPrice;
    }

    private BigDecimal getBasePrice(Room room) {
        if (room.getPricePerNight() != null && room.getPricePerNight() > 0) {
            return new BigDecimal(room.getPricePerNight());
        }

        // Default prices by type
        String type = room.getType().toUpperCase();
        if (type.contains("SUITE")) {
            return BASE_SUITE_PRICE;
        } else if (type.contains("DELUXE")) {
            return BASE_DELUXE_PRICE;
        } else {
            return BASE_STANDARD_PRICE;
        }
    }

    private BigDecimal calculateOccupancyRate(LocalDate checkIn, LocalDate checkOut) {
        List<Room> allRooms = roomRepository.findAll();
        int totalRooms = allRooms.size();

        if (totalRooms == 0) return BigDecimal.ZERO;

        List<Reservation> reservations = reservationRepository
                .findReservationsOverlapping(checkIn, checkOut);

        long occupiedRooms = reservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED &&
                        r.getStatus() != ReservationStatus.CHECKED_OUT)
                .flatMap(r -> r.getRooms().stream())
                .distinct()
                .count();

        return BigDecimal.valueOf(occupiedRooms)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalRooms), 2, RoundingMode.HALF_UP);
    }

    private boolean isRuleApplicable(PricingRule rule, long daysToArrival,
                                     BigDecimal occupancyRate, LocalDate checkInDate,
                                     DayOfWeek dayOfWeek) {

        // Check days to arrival
        if (rule.getMinDaysToArrival() != null && daysToArrival < rule.getMinDaysToArrival()) {
            return false;
        }
        if (rule.getMaxDaysToArrival() != null && daysToArrival > rule.getMaxDaysToArrival()) {
            return false;
        }

        // Check occupancy
        if (rule.getMinOccupancyPercent() != null &&
                occupancyRate.compareTo(rule.getMinOccupancyPercent()) < 0) {
            return false;
        }
        if (rule.getMaxOccupancyPercent() != null &&
                occupancyRate.compareTo(rule.getMaxOccupancyPercent()) > 0) {
            return false;
        }

        // Check season dates
        if (rule.getSeasonStartDate() != null && checkInDate.isBefore(rule.getSeasonStartDate())) {
            return false;
        }
        if (rule.getSeasonEndDate() != null && checkInDate.isAfter(rule.getSeasonEndDate())) {
            return false;
        }

        // Check day of week
        if (rule.getDayOfWeek() != null &&
                !"ALL".equals(rule.getDayOfWeek()) &&
                !dayOfWeek.name().equals(rule.getDayOfWeek())) {
            return false;
        }

        return true;
    }

    private BigDecimal applyPricingRule(BigDecimal currentPrice, PricingRule rule) {
        BigDecimal newPrice = currentPrice;

        // Apply multiplier
        if (rule.getPriceMultiplier() != null) {
            newPrice = newPrice.multiply(rule.getPriceMultiplier());
        }

        // Apply addition
        if (rule.getPriceAddition() != null) {
            newPrice = newPrice.add(rule.getPriceAddition());
        }

        // Apply reduction
        if (rule.getPriceReduction() != null) {
            newPrice = newPrice.subtract(rule.getPriceReduction());
        }

        // Apply floor
        if (rule.getMinPrice() != null && newPrice.compareTo(rule.getMinPrice()) < 0) {
            newPrice = rule.getMinPrice();
        }

        // Apply ceiling
        if (rule.getMaxPrice() != null && newPrice.compareTo(rule.getMaxPrice()) > 0) {
            newPrice = rule.getMaxPrice();
        }

        return newPrice;
    }

    /**
     * Scheduled job to update room prices daily
     */
    public void updateRoomPrices() {
        log.info("Running daily room price update");

        List<Room> rooms = roomRepository.findAll();
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        for (Room room : rooms) {
            BigDecimal dynamicPrice = calculateDynamicPrice(room, tomorrow, tomorrow.plusDays(1));
            // Store in price history or update room base price
            log.info("Updated price for room {}: {} LKR", room.getRoomNumber(), dynamicPrice);
        }
    }
}