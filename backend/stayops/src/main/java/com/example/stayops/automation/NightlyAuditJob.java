package com.example.stayops.automation;

import com.example.stayops.entity.Reservation;
import com.example.stayops.enums.ReservationStatus;
import com.example.stayops.repository.HousekeepingTaskRepository;
import com.example.stayops.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NightlyAuditJob {

    private final ReservationRepository reservationRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;

    /**
     * Night audit job - runs at 2 AM daily
     * Finalizes day revenue, generates reports
     */
    @Scheduled(cron = "0 0 2 * * *") // 2 AM daily
    @Transactional
    public void runNightAudit() {
        log.info("===== STARTING NIGHTLY AUDIT =====");

        try {
            LocalDate auditDate = LocalDate.now().minusDays(1);

            // 1. Generate arrival/departure lists for today
            generateDailyLists(LocalDate.now());

            // 2. Check for overdue housekeeping tasks
            checkOverdueTasks(LocalDate.now());

            // 3. Generate occupancy report
            generateOccupancyReport(LocalDate.now());

            // 4. TODO: Close folios for checked-out guests
            // 5. TODO: Generate revenue report
            // 6. TODO: Sync with accounting system

            log.info("===== NIGHTLY AUDIT COMPLETED SUCCESSFULLY =====");

        } catch (Exception e) {
            log.error("===== NIGHTLY AUDIT FAILED =====", e);
        }
    }

    private void generateDailyLists(LocalDate date) {
        log.info("Generating daily lists for: {}", date);

        List<Reservation> arrivals = reservationRepository.findByCheckInDate(date);
        List<Reservation> departures = reservationRepository.findByCheckOutDate(date);

        log.info("Expected Arrivals: {}", arrivals.size());
        log.info("Expected Departures: {}", departures.size());

        // Log VIP guests
        arrivals.stream()
                .filter(r -> r.getReservationDetails() != null &&
                        r.getReservationDetails().getSpecialRequests() != null &&
                        r.getReservationDetails().getSpecialRequests().toUpperCase().contains("VIP"))
                .forEach(r -> log.info("VIP Arrival: Guest {}, Rooms: {}",
                        r.getGuest() != null ? r.getGuest().getGuestId() : "Unknown",
                        r.getRooms() != null ? r.getRooms().size() : 0));
    }

    private void checkOverdueTasks(LocalDate date) {
        var overdueTasks = housekeepingTaskRepository.findOverdueTasks(date.minusDays(1));

        if (!overdueTasks.isEmpty()) {
            log.warn("Found {} overdue housekeeping tasks", overdueTasks.size());
            // TODO: Send alert to housekeeping manager
        }
    }

    private void generateOccupancyReport(LocalDate date) {
        List<Reservation> occupiedReservations = reservationRepository.findAll().stream()
                .filter(r -> (r.getStatus() == ReservationStatus.CHECKED_IN ||
                        r.getStatus() == ReservationStatus.OCCUPIED) &&
                        !r.getCheckInDate().isAfter(date) &&
                        !r.getCheckOutDate().isBefore(date))
                .toList();

        int occupiedRooms = (int) occupiedReservations.stream()
                .flatMap(r -> r.getRooms() != null ? r.getRooms().stream() : java.util.stream.Stream.empty())
                .distinct()
                .count();

        log.info("Occupancy Report for {}: {} occupied rooms from {} reservations",
                date, occupiedRooms, occupiedReservations.size());
    }
}