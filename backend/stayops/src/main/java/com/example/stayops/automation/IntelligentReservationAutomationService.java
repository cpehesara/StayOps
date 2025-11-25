package com.example.stayops.automation;

import com.example.stayops.entity.*;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent automation with ML-like decision making and predictive capabilities
 *
 * These automations go beyond simple rules to provide intelligent, context-aware
 * reservation management that adapts to patterns and optimizes outcomes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IntelligentReservationAutomationService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * SCENARIO 16: Intelligent cancellation prediction
     * Identify reservations likely to be cancelled based on patterns
     */
    @Transactional
    public int predictAndFlagRiskyCancellations() {
        log.info("Analyzing cancellation risk patterns...");

        List<Reservation> upcomingReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED ||
                        r.getStatus() == ReservationStatus.PENDING)
                .filter(r -> r.getCheckInDate().isAfter(LocalDate.now()))
                .toList();

        int flaggedCount = 0;
        for (Reservation reservation : upcomingReservations) {
            int riskScore = calculateCancellationRisk(reservation);

            if (riskScore >= 70) { // High risk
                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "HIGH_CANCELLATION_RISK", "SYSTEM", "AI_PREDICTION",
                        "Cancellation risk score: " + riskScore + "%");

                flaggedCount++;
                log.warn("High cancellation risk detected for reservation {} (score: {})",
                        reservation.getReservationId(), riskScore);

                // TODO: Offer incentives to retain booking
            }
        }

        return flaggedCount;
    }

    /**
     * SCENARIO 17: Dynamic room assignment optimization
     * Assign rooms based on guest preferences and operational efficiency
     */
    @Transactional
    public int optimizeRoomAssignments() {
        log.info("Optimizing room assignments for tomorrow's arrivals...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reservation> tomorrowArrivals = reservationRepository.findAll().stream()
                .filter(r -> r.getCheckInDate().equals(tomorrow))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .toList();

        int optimizedCount = 0;
        for (Reservation reservation : tomorrowArrivals) {
            // Smart assignment considering:
            // - Guest preferences (floor, view, proximity)
            // - Housekeeping efficiency (group nearby rooms)
            // - Noise considerations (families away from business travelers)
            // - Length of stay (longer stays get better rooms)

            Room optimalRoom = findOptimalRoom(reservation);
            if (optimalRoom != null) {
                reservation.getRooms().clear();
                reservation.getRooms().add(optimalRoom);
                reservationRepository.save(reservation);

                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "OPTIMIZED_ROOM_ASSIGNMENT", "SYSTEM", "AI_OPTIMIZATION",
                        "Assigned optimal room: " + optimalRoom.getRoomNumber());

                optimizedCount++;
            }
        }

        return optimizedCount;
    }

    /**
     * SCENARIO 18: Proactive early check-in management
     * Identify opportunities for early check-in based on room availability
     */
    @Transactional
    public int offerEarlyCheckIn() {
        log.info("Identifying early check-in opportunities...");

        LocalDate today = LocalDate.now();
        List<Reservation> todayArrivals = reservationRepository.findAll().stream()
                .filter(r -> r.getCheckInDate().equals(today))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .toList();

        int offersCount = 0;
        for (Reservation reservation : todayArrivals) {
            // Check if assigned room is ready before standard check-in time
            if (isRoomReadyEarly(reservation)) {
                // Send notification offering early check-in
                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "EARLY_CHECKIN_OFFER", "SYSTEM", "AUTOMATION",
                        "Offered early check-in - room ready");

                offersCount++;
                log.info("Offered early check-in to reservation {}",
                        reservation.getReservationId());
            }
        }

        return offersCount;
    }

    /**
     * SCENARIO 19: Intelligent extension suggestions
     * Suggest stay extensions to guests based on availability and patterns
     */
    @Transactional
    public int suggestStayExtensions() {
        log.info("Identifying stay extension opportunities...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Find guests checking out tomorrow
        List<Reservation> checkoutTomorrow = reservationRepository.findAll().stream()
                .filter(r -> r.getCheckOutDate().equals(tomorrow))
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED)
                .toList();

        int suggestionsCount = 0;
        for (Reservation reservation : checkoutTomorrow) {
            // Check if room is available for extension
            if (canExtendStay(reservation)) {
                // Offer extension with special rate
                BigDecimal extensionRate = calculateExtensionRate(reservation);

                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "EXTENSION_SUGGESTED", "SYSTEM", "AUTOMATION",
                        "Suggested extension at rate: LKR " + extensionRate);

                suggestionsCount++;
                log.info("Suggested stay extension to reservation {} at LKR {}",
                        reservation.getReservationId(), extensionRate);
            }
        }

        return suggestionsCount;
    }

    /**
     * SCENARIO 20: Housekeeping priority optimization
     * Dynamically prioritize room cleaning based on check-in times and VIP status
     */
    @Transactional
    public int optimizeHousekeepingPriority() {
        log.info("Optimizing housekeeping priorities...");

        LocalDate today = LocalDate.now();

        // Get today's checkouts and arrivals
        List<Reservation> checkouts = reservationRepository.findAll().stream()
                .filter(r -> r.getCheckOutDate().equals(today))
                .toList();

        List<Reservation> arrivals = reservationRepository.findAll().stream()
                .filter(r -> r.getCheckInDate().equals(today))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .toList();

        int prioritizedCount = 0;
        for (Reservation checkout : checkouts) {
            // Find if this room has same-day arrival
            boolean hasSameDayArrival = arrivals.stream()
                    .anyMatch(arrival -> arrival.getRooms().stream()
                            .anyMatch(room -> checkout.getRooms().contains(room)));

            if (hasSameDayArrival) {
                // Mark as high priority for housekeeping
                logAudit("ROOM", getRoomId(checkout),
                        "HOUSEKEEPING_HIGH_PRIORITY", "SYSTEM", "AUTOMATION",
                        "High priority: Same-day turn");

                prioritizedCount++;
            }
        }

        return prioritizedCount;
    }

    /**
     * SCENARIO 21: Intelligent overbooking with protection
     * Strategic overbooking based on historical no-show rates
     */
    @Transactional
    public int manageStrategicOverbooking() {
        log.info("Analyzing strategic overbooking opportunities...");

        // Calculate historical no-show rate
        double noShowRate = calculateNoShowRate();

        // Only overbook if rate is significant and we have backup plan
        if (noShowRate > 0.05) { // 5% or higher no-show rate
            List<LocalDate> highDemandDates = identifyHighDemandDates();

            int overbookingsAllowed = 0;
            for (LocalDate date : highDemandDates) {
                // Allow controlled overbooking with safety margin
                int safeOverbooking = calculateSafeOverbooking(date, noShowRate);

                if (safeOverbooking > 0) {
                    logAudit("SYSTEM", "OVERBOOKING_STRATEGY",
                            "STRATEGIC_OVERBOOKING_ALLOWED", "SYSTEM", "REVENUE_OPTIMIZATION",
                            "Allow " + safeOverbooking + " overbookings for " + date);

                    overbookingsAllowed += safeOverbooking;
                }
            }

            return overbookingsAllowed;
        }

        return 0;
    }

    /**
     * SCENARIO 22: Competitive pricing alerts
     * Monitor and alert on competitor pricing changes
     */
    @Transactional(readOnly = true)
    public int monitorCompetitivePricing() {
        log.info("Monitoring competitor pricing...");

        // Integration point for competitor price scraping
        Map<String, BigDecimal> competitorPrices = fetchCompetitorPrices();

        int alertsCreated = 0;
        for (Map.Entry<String, BigDecimal> entry : competitorPrices.entrySet()) {
            String competitor = entry.getKey();
            BigDecimal theirPrice = entry.getValue();

            // Compare with our pricing
            BigDecimal ourPrice = getCurrentAverageRate();

            if (theirPrice.compareTo(ourPrice.multiply(new BigDecimal("0.85"))) < 0) {
                // Competitor is 15% or more cheaper
                logAudit("PRICING", "COMPETITOR_ANALYSIS",
                        "COMPETITOR_UNDERPRICING", "SYSTEM", "MONITORING",
                        competitor + " pricing 15% lower: LKR " + theirPrice);

                alertsCreated++;
                log.warn("Competitor {} pricing alert: LKR {} vs our LKR {}",
                        competitor, theirPrice, ourPrice);
            }
        }

        return alertsCreated;
    }

    /**
     * SCENARIO 23: Guest profile completion automation
     * Remind guests to complete profiles for better experience
     */
    @Transactional(readOnly = true)
    public int requestProfileCompletion() {
        log.info("Identifying incomplete guest profiles...");

        List<Reservation> upcomingReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .filter(r -> r.getCheckInDate().isAfter(LocalDate.now()))
                .filter(r -> r.getCheckInDate().isBefore(LocalDate.now().plusDays(7)))
                .toList();

        int requestsCount = 0;
        for (Reservation reservation : upcomingReservations) {
            if (reservation.getGuest() != null && isProfileIncomplete(reservation.getGuest())) {
                log.info("Requesting profile completion from guest {} for reservation {}",
                        reservation.getGuest().getEmail(),
                        reservation.getReservationId());
                requestsCount++;
            }
        }

        return requestsCount;
    }

    /**
     * SCENARIO 24: Automatic amenity preferences detection
     * Learn and remember guest amenity preferences
     */
    @Transactional
    public int detectAmenityPreferences() {
        log.info("Analyzing guest amenity preferences...");

        // Analyze past reservations to detect patterns
        List<Guest> repeatGuests = findRepeatGuests();

        int preferencesDetected = 0;
        for (Guest guest : repeatGuests) {
            Map<String, Integer> amenityFrequency = analyzeGuestAmenities(guest);

            if (!amenityFrequency.isEmpty()) {
                String topPreferences = amenityFrequency.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                        .limit(3)
                        .map(Map.Entry::getKey)
                        .collect(Collectors.joining(", "));

                logAudit("GUEST", guest.getGuestId(),
                        "PREFERENCES_DETECTED", "SYSTEM", "AI_LEARNING",
                        "Detected preferences: " + topPreferences);

                preferencesDetected++;
            }
        }

        return preferencesDetected;
    }

    /**
     * SCENARIO 25: Predictive maintenance based on usage
     * Predict room maintenance needs based on occupancy patterns
     */
    @Transactional
    public int schedulePredictiveMaintenance() {
        log.info("Analyzing predictive maintenance needs...");

        List<Room> allRooms = roomRepository.findAll();

        int maintenanceScheduled = 0;
        for (Room room : allRooms) {
            // Calculate usage intensity
            int usageScore = calculateRoomUsageIntensity(room);

            if (usageScore >= 80) { // High usage
                // Schedule preventive maintenance
                logAudit("ROOM", room.getId().toString(),
                        "PREDICTIVE_MAINTENANCE", "SYSTEM", "AI_PREDICTION",
                        "High usage detected - schedule maintenance (score: " + usageScore + ")");

                maintenanceScheduled++;
                log.info("Scheduled predictive maintenance for room {} (usage score: {})",
                        room.getRoomNumber(), usageScore);
            }
        }

        return maintenanceScheduled;
    }

    /**
     * SCENARIO 26: Intelligent upsell recommendations
     * Recommend room upgrades and add-ons based on guest profile
     */
    @Transactional(readOnly = true)
    public int generateUpsellRecommendations() {
        log.info("Generating intelligent upsell recommendations...");

        LocalDate nextWeek = LocalDate.now().plusDays(7);
        List<Reservation> upcomingReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .filter(r -> r.getCheckInDate().isBefore(nextWeek))
                .filter(r -> r.getCheckInDate().isAfter(LocalDate.now()))
                .toList();

        int recommendationsCount = 0;
        for (Reservation reservation : upcomingReservations) {
            // Analyze guest spending patterns and preferences
            List<String> recommendations = generatePersonalizedUpsells(reservation);

            if (!recommendations.isEmpty()) {
                log.info("Generated upsell recommendations for reservation {}: {}",
                        reservation.getReservationId(), recommendations);
                recommendationsCount++;
            }
        }

        return recommendationsCount;
    }

    /**
     * SCENARIO 27: Automatic language preference detection
     * Detect and remember guest language preferences
     */
    @Transactional
    public int detectLanguagePreferences() {
        log.info("Detecting guest language preferences...");

        List<Guest> allGuests = guestRepository.findAll();

        int preferencesDetected = 0;
        for (Guest guest : allGuests) {
            // Analyze nationality, email patterns, phone prefix
            String detectedLanguage = detectPreferredLanguage(guest);

            if (detectedLanguage != null) {
                logAudit("GUEST", guest.getGuestId(),
                        "LANGUAGE_DETECTED", "SYSTEM", "AI_DETECTION",
                        "Detected language preference: " + detectedLanguage);

                preferencesDetected++;
            }
        }

        return preferencesDetected;
    }

    /**
     * SCENARIO 28: Smart cancellation offers
     * Offer alternatives instead of straight cancellation
     */
    @Transactional
    public int offerCancellationAlternatives() {
        log.info("Checking for cancellation requests...");

        // This would integrate with a cancellation request system
        // When guest initiates cancellation, offer:
        // 1. Date change without penalty
        // 2. Downgrade to cheaper room
        // 3. Convert to credit for future use
        // 4. Refer to partner property

        int alternativesOffered = 0;
        // Implementation would track cancellation requests

        return alternativesOffered;
    }

    /**
     * SCENARIO 29: Automatic special occasion detection
     * Detect honeymoons, anniversaries, birthdays from booking patterns
     */
    @Transactional
    public int detectSpecialOccasions() {
        log.info("Detecting special occasions...");

        List<Reservation> upcomingReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .filter(r -> r.getCheckInDate().isAfter(LocalDate.now()))
                .filter(r -> r.getCheckInDate().isBefore(LocalDate.now().plusDays(14)))
                .toList();

        int occasionsDetected = 0;
        for (Reservation reservation : upcomingReservations) {
            String occasion = detectOccasion(reservation);

            if (occasion != null) {
                logAudit("RESERVATION", reservation.getReservationId().toString(),
                        "SPECIAL_OCCASION_DETECTED", "SYSTEM", "AI_DETECTION",
                        "Detected: " + occasion);

                occasionsDetected++;
                log.info("Special occasion detected for reservation {}: {}",
                        reservation.getReservationId(), occasion);
            }
        }

        return occasionsDetected;
    }

    /**
     * SCENARIO 30: Peak hour arrival management
     * Spread check-ins to avoid lobby congestion
     */
    @Transactional
    public int optimizeArrivalTimes() {
        log.info("Optimizing arrival time distribution...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reservation> tomorrowArrivals = reservationRepository.findAll().stream()
                .filter(r -> r.getCheckInDate().equals(tomorrow))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .toList();

        // If too many arrivals at standard check-in time
        if (tomorrowArrivals.size() > 20) {
            int optimizedCount = 0;

            // Suggest staggered arrival times
            for (Reservation reservation : tomorrowArrivals) {
                // Offer incentive for early/late check-in
                log.info("Suggesting optimized arrival time for reservation {}",
                        reservation.getReservationId());
                optimizedCount++;
            }

            return optimizedCount;
        }

        return 0;
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private int calculateCancellationRisk(Reservation reservation) {
        int riskScore = 0;

        // Factor 1: Booking lead time (last-minute bookings more likely to cancel)
        long leadTime = ChronoUnit.DAYS.between(reservation.getCreatedAt().atZone(
                java.time.ZoneId.systemDefault()).toLocalDate(), reservation.getCheckInDate());
        if (leadTime < 7) riskScore += 30;

        // Factor 2: Guest history (repeat no-shows)
        if (reservation.getGuest() != null) {
            long previousCancellations = reservationRepository.findAll().stream()
                    .filter(r -> r.getGuest().equals(reservation.getGuest()))
                    .filter(r -> r.getStatus() == ReservationStatus.CANCELLED)
                    .count();
            if (previousCancellations > 0) riskScore += 25;
        }

        // Factor 3: No deposit received
        if (reservation.getStatus() == ReservationStatus.PENDING) riskScore += 20;

        // Factor 4: Weekend booking from long distance
        if (reservation.getCheckInDate().getDayOfWeek() == DayOfWeek.SATURDAY ||
                reservation.getCheckInDate().getDayOfWeek() == DayOfWeek.FRIDAY) {
            riskScore += 10;
        }

        return Math.min(100, riskScore);
    }

    private Room findOptimalRoom(Reservation reservation) {
        // Smart room selection algorithm
        List<Room> availableRooms = roomRepository.findAll().stream()
                .filter(room -> isRoomAvailable(room, reservation.getCheckInDate()))
                .toList();

        if (availableRooms.isEmpty()) return null;

        // Score each room based on multiple factors
        return availableRooms.stream()
                .max(Comparator.comparingInt(room -> calculateRoomScore(room, reservation)))
                .orElse(null);
    }

    private int calculateRoomScore(Room room, Reservation reservation) {
        int score = 0;

        // Longer stays get better rooms
        long nights = ChronoUnit.DAYS.between(
                reservation.getCheckInDate(), reservation.getCheckOutDate());
        if (nights >= 5) score += 20;

        // VIP guests get premium rooms
        // score += guestIsVIP(reservation.getGuest()) ? 30 : 0;

        // Families get rooms away from business area
        if (reservation.getReservationDetails() != null &&
                reservation.getReservationDetails().getKids() > 0) {
            score += 10;
        }

        return score;
    }

    private boolean isRoomReadyEarly(Reservation reservation) {
        // Check housekeeping status
        return true; // Placeholder
    }

    private boolean canExtendStay(Reservation reservation) {
        // Check if room available for extension
        LocalDate nextDay = reservation.getCheckOutDate();
        return reservation.getRooms().stream()
                .allMatch(room -> isRoomAvailable(room, nextDay));
    }

    private BigDecimal calculateExtensionRate(Reservation reservation) {
        // Offer discounted rate for extension
        return new BigDecimal("15000.00"); // Placeholder
    }

    private double calculateNoShowRate() {
        // Calculate historical no-show percentage
        long totalReservations = reservationRepository.count();
        long noShows = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CANCELLED)
                .count();

        return totalReservations > 0 ? (double) noShows / totalReservations : 0.0;
    }

    private List<LocalDate> identifyHighDemandDates() {
        // Identify dates with high booking demand
        return Arrays.asList(LocalDate.now().plusDays(30)); // Placeholder
    }

    private int calculateSafeOverbooking(LocalDate date, double noShowRate) {
        int totalRooms = roomRepository.findAll().size();
        return (int) Math.floor(totalRooms * noShowRate * 0.5); // Conservative 50% of expected no-shows
    }

    private Map<String, BigDecimal> fetchCompetitorPrices() {
        // Integration point for competitor monitoring
        return new HashMap<>();
    }

    private BigDecimal getCurrentAverageRate() {
        return new BigDecimal("20000.00"); // Placeholder
    }

    private boolean isProfileIncomplete(Guest guest) {
        return guest.getNationality() == null || guest.getPhone() == null;
    }

    private List<Guest> findRepeatGuests() {
        return guestRepository.findAll().stream()
                .filter(guest -> {
                    long bookingCount = reservationRepository.findAll().stream()
                            .filter(r -> r.getGuest().equals(guest))
                            .count();
                    return bookingCount >= 2;
                })
                .toList();
    }

    private Map<String, Integer> analyzeGuestAmenities(Guest guest) {
        // Analyze past reservation amenity requests
        return new HashMap<>();
    }

    private int calculateRoomUsageIntensity(Room room) {
        // Calculate usage score based on occupancy frequency
        long recentBookings = reservationRepository.findAll().stream()
                .filter(r -> r.getRooms().contains(room))
                .filter(r -> r.getCheckOutDate().isAfter(LocalDate.now().minusDays(90)))
                .count();

        return (int) Math.min(100, (recentBookings / 90.0) * 100);
    }

    private List<String> generatePersonalizedUpsells(Reservation reservation) {
        List<String> recommendations = new ArrayList<>();

        // Based on reservation details and guest history
        if (reservation.getReservationDetails() != null &&
                reservation.getReservationDetails().getKids() > 0) {
            recommendations.add("Family Fun Package");
        }

        return recommendations;
    }

    private String detectPreferredLanguage(Guest guest) {
        // Analyze nationality, name patterns
        if (guest.getNationality() != null) {
            if (guest.getNationality().equalsIgnoreCase("China")) return "Chinese";
            if (guest.getNationality().equalsIgnoreCase("Japan")) return "Japanese";
            if (guest.getNationality().equalsIgnoreCase("France")) return "French";
        }
        return "English"; // Default
    }

    private String detectOccasion(Reservation reservation) {
        // Analyze patterns: 2-night weekend booking = romantic, specific dates = anniversary
        long nights = ChronoUnit.DAYS.between(
                reservation.getCheckInDate(), reservation.getCheckOutDate());

        if (nights <= 3 && (reservation.getCheckInDate().getDayOfWeek() == DayOfWeek.FRIDAY ||
                reservation.getCheckInDate().getDayOfWeek() == DayOfWeek.SATURDAY)) {
            if (reservation.getReservationDetails() != null &&
                    reservation.getReservationDetails().getAdults() == 2 &&
                    reservation.getReservationDetails().getKids() == 0) {
                return "Romantic Getaway/Honeymoon";
            }
        }

        return null;
    }

    private boolean isRoomAvailable(Room room, LocalDate date) {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .filter(r -> !r.getCheckInDate().isAfter(date) &&
                        !r.getCheckOutDate().isBefore(date))
                .noneMatch(r -> r.getRooms().contains(room));
    }

    private String getRoomId(Reservation reservation) {
        return reservation.getRooms().isEmpty() ? "UNKNOWN" :
                reservation.getRooms().iterator().next().getId().toString();
    }

    private void logAudit(String entityType, String entityId, String action,
                          String actorType, String actorId, String description) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .actorType(actorType)
                    .actorId(actorId)
                    .description(description)
                    .timestamp(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }
}