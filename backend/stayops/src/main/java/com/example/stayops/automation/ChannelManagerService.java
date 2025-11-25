package com.example.stayops.automation;

import com.example.stayops.entity.ChannelMapping;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.ChannelMappingRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.repository.RoomRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelManagerService {

    private final ChannelMappingRepository channelMappingRepository;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    // Channel Manager API Configuration
    private static final String CHANNEL_MANAGER_API_URL = "https://api.channelmanager.example.com";
    private static final String API_KEY = "your-api-key"; // Move to config

    /**
     * Sync room availability to channel manager
     */
    @Transactional
    public void syncAvailabilityToOTA(LocalDate startDate, LocalDate endDate) {
        log.info("Syncing availability to OTA for dates {} to {}", startDate, endDate);

        try {
            List<Room> allRooms = roomRepository.findAll();
            Map<LocalDate, Map<String, Integer>> availability = new HashMap<>();

            LocalDate current = startDate;
            while (!current.isAfter(endDate)) {
                Map<String, Integer> roomTypeAvailability = calculateAvailabilityForDate(current, allRooms);
                availability.put(current, roomTypeAvailability);
                current = current.plusDays(1);
            }

            // Send to channel manager API
            Map<String, Object> payload = new HashMap<>();
            payload.put("hotel_id", "YOUR_HOTEL_ID");
            payload.put("availability", availability);

            String response = sendToChannelManager("/availability/update", payload);
            log.info("Availability sync response: {}", response);

        } catch (Exception e) {
            log.error("Error syncing availability to OTA: {}", e.getMessage(), e);
        }
    }

    /**
     * Sync rates to channel manager
     */
    @Transactional
    public void syncRatesToOTA(Map<String, Double> roomTypeRates) {
        log.info("Syncing rates to OTA: {}", roomTypeRates);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("hotel_id", "YOUR_HOTEL_ID");
            payload.put("rates", roomTypeRates);
            payload.put("currency", "LKR");

            String response = sendToChannelManager("/rates/update", payload);
            log.info("Rate sync response: {}", response);

        } catch (Exception e) {
            log.error("Error syncing rates to OTA: {}", e.getMessage(), e);
        }
    }

    /**
     * Process incoming OTA booking
     */
    @Transactional
    public Reservation processOTABooking(String otaPayload) {
        log.info("Processing OTA booking");

        try {
            JsonNode bookingData = objectMapper.readTree(otaPayload);

            String externalBookingId = bookingData.path("booking_id").asText();
            String channelCode = bookingData.path("channel").asText();

            // Check for duplicate
            if (channelMappingRepository.findByExternalBookingId(externalBookingId).isPresent()) {
                log.warn("Duplicate OTA booking received: {}", externalBookingId);
                return channelMappingRepository.findByExternalBookingId(externalBookingId)
                        .get().getReservation();
            }

            // Parse booking details
            LocalDate checkIn = LocalDate.parse(bookingData.path("check_in").asText());
            LocalDate checkOut = LocalDate.parse(bookingData.path("check_out").asText());
            String guestEmail = bookingData.path("guest_email").asText();

            // Create reservation (simplified - in reality, create guest first)
            Reservation reservation = Reservation.builder()
                    .checkInDate(checkIn)
                    .checkOutDate(checkOut)
                    .status(ReservationStatus.CONFIRMED)
                    .build();

            reservation = reservationRepository.save(reservation);

            // Create channel mapping
            ChannelMapping mapping = ChannelMapping.builder()
                    .reservation(reservation)
                    .channelCode(channelCode)
                    .externalBookingId(externalBookingId)
                    .channelData(otaPayload)
                    .guestEmailFromChannel(guestEmail)
                    .isChannelCollectedPayment(true)
                    .lastSyncedAt(Instant.now())
                    .build();

            channelMappingRepository.save(mapping);

            log.info("Created reservation {} from OTA booking {}",
                    reservation.getReservationId(), externalBookingId);

            return reservation;

        } catch (Exception e) {
            log.error("Error processing OTA booking: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process OTA booking", e);
        }
    }

    private Map<String, Integer> calculateAvailabilityForDate(LocalDate date, List<Room> allRooms) {
        Map<String, Integer> availability = new HashMap<>();

        // Group rooms by type
        Map<String, List<Room>> roomsByType = allRooms.stream()
                .collect(java.util.stream.Collectors.groupingBy(Room::getType));

        for (Map.Entry<String, List<Room>> entry : roomsByType.entrySet()) {
            String roomType = entry.getKey();
            List<Room> rooms = entry.getValue();

            int availableCount = 0;
            for (Room room : rooms) {
                if (isRoomAvailable(room, date)) {
                    availableCount++;
                }
            }

            availability.put(roomType, availableCount);
        }

        return availability;
    }

    private boolean isRoomAvailable(Room room, LocalDate date) {
        List<Reservation> conflicts = reservationRepository
                .findOverlappingReservationsForRoom(room.getId(), date, date);

        return conflicts.stream()
                .noneMatch(r -> r.getStatus() != ReservationStatus.CANCELLED &&
                        r.getStatus() != ReservationStatus.CHECKED_OUT);
    }

    private String sendToChannelManager(String endpoint, Map<String, Object> payload) {
        try {
            String url = CHANNEL_MANAGER_API_URL + endpoint;

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + API_KEY);
            headers.set("Content-Type", "application/json");

            org.springframework.http.HttpEntity<Map<String, Object>> request =
                    new org.springframework.http.HttpEntity<>(payload, headers);

            org.springframework.http.ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            return response.getBody();

        } catch (Exception e) {
            log.error("Error sending to channel manager: {}", e.getMessage(), e);
            throw new RuntimeException("Channel manager sync failed", e);
        }
    }
}