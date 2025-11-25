package com.example.stayops.automation;

import com.example.stayops.config.AutomationConfig;
import com.example.stayops.entity.HousekeepingTask;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.Room;
import com.example.stayops.event.ReservationEvent;
import com.example.stayops.repository.HousekeepingTaskRepository;
import com.example.stayops.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class HousekeepingAutomationListener {

    private final HousekeepingTaskRepository taskRepository;
    private final ReservationRepository reservationRepository;
    private final AutomationConfig config;

    @Async
    @EventListener
    @Transactional
    public void handleReservationConfirmed(ReservationEvent event) {
        if (!"CONFIRMED".equals(event.getEventType()) || !config.isAutoCreateHousekeeping()) {
            return;
        }

        log.info("Creating pre-arrival housekeeping tasks for reservation: {}",
                event.getReservationId());

        try {
            Reservation reservation = reservationRepository
                    .findById(event.getReservationId())
                    .orElseThrow(() -> new RuntimeException(
                            "Reservation not found: " + event.getReservationId()));

            if (reservation.getRooms() == null || reservation.getRooms().isEmpty()) {
                log.warn("No rooms assigned for reservation {}, skipping housekeeping task creation",
                        event.getReservationId());
                return;
            }

            // Create pre-arrival cleaning tasks
            List<HousekeepingTask> tasks = new ArrayList<>();
            for (Room room : reservation.getRooms()) {
                HousekeepingTask task = HousekeepingTask.builder()
                        .room(room)
                        .reservation(reservation)
                        .taskType("PRE_ARRIVAL")
                        .status("PENDING")
                        .scheduledDate(reservation.getCheckInDate().minusDays(1))
                        .priority("MEDIUM")
                        .notes("Prepare room for guest arrival - " +
                                (reservation.getGuest() != null ?
                                        reservation.getGuest().getFirstName() + " " +
                                                reservation.getGuest().getLastName() : "Guest"))
                        .build();
                tasks.add(task);
            }

            taskRepository.saveAll(tasks);
            log.info("Created {} pre-arrival tasks for reservation: {}",
                    tasks.size(), event.getReservationId());

        } catch (Exception e) {
            log.error("Error creating housekeeping tasks for reservation {}: {}",
                    event.getReservationId(), e.getMessage(), e);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void handleCheckout(ReservationEvent event) {
        if (!"CHECKED_OUT".equals(event.getEventType()) || !config.isAutoCreateHousekeeping()) {
            return;
        }

        log.info("Creating checkout cleaning tasks for reservation: {}",
                event.getReservationId());

        try {
            Reservation reservation = reservationRepository
                    .findById(event.getReservationId())
                    .orElseThrow(() -> new RuntimeException(
                            "Reservation not found: " + event.getReservationId()));

            if (reservation.getRooms() == null || reservation.getRooms().isEmpty()) {
                log.warn("No rooms for reservation {}, skipping checkout task creation",
                        event.getReservationId());
                return;
            }

            // Create checkout cleaning tasks
            List<HousekeepingTask> tasks = new ArrayList<>();
            for (Room room : reservation.getRooms()) {
                HousekeepingTask task = HousekeepingTask.builder()
                        .room(room)
                        .reservation(reservation)
                        .taskType("CHECKOUT_CLEAN")
                        .status("PENDING")
                        .scheduledDate(LocalDate.now())
                        .priority("HIGH")
                        .notes("Deep clean and prepare room after guest checkout - Room " +
                                room.getRoomNumber())
                        .build();
                tasks.add(task);
            }

            taskRepository.saveAll(tasks);
            log.info("Created {} checkout cleaning tasks for reservation: {}",
                    tasks.size(), event.getReservationId());

        } catch (Exception e) {
            log.error("Error creating checkout tasks for reservation {}: {}",
                    event.getReservationId(), e.getMessage(), e);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void handleCheckIn(ReservationEvent event) {
        if (!"CHECKED_IN".equals(event.getEventType()) || !config.isAutoCreateHousekeeping()) {
            return;
        }

        log.info("Creating turndown service tasks for reservation: {}",
                event.getReservationId());

        try {
            Reservation reservation = reservationRepository
                    .findById(event.getReservationId())
                    .orElseThrow(() -> new RuntimeException(
                            "Reservation not found: " + event.getReservationId()));

            if (reservation.getRooms() == null || reservation.getRooms().isEmpty()) {
                return;
            }

            // Create daily turndown service tasks for multi-day stays
            List<HousekeepingTask> tasks = new ArrayList<>();
            LocalDate currentDate = reservation.getCheckInDate();
            LocalDate checkOutDate = reservation.getCheckOutDate();

            while (currentDate.isBefore(checkOutDate)) {
                for (Room room : reservation.getRooms()) {
                    HousekeepingTask task = HousekeepingTask.builder()
                            .room(room)
                            .reservation(reservation)
                            .taskType("TURNDOWN")
                            .status("PENDING")
                            .scheduledDate(currentDate)
                            .priority("LOW")
                            .notes("Evening turndown service")
                            .build();
                    tasks.add(task);
                }
                currentDate = currentDate.plusDays(1);
            }

            if (!tasks.isEmpty()) {
                taskRepository.saveAll(tasks);
                log.info("Created {} turndown service tasks for reservation: {}",
                        tasks.size(), event.getReservationId());
            }

        } catch (Exception e) {
            log.error("Error creating turndown tasks for reservation {}: {}",
                    event.getReservationId(), e.getMessage(), e);
        }
    }
}