package com.example.stayops.automation;

import com.example.stayops.dto.AutomationMetricsDTO;
import com.example.stayops.entity.AuditLog;
import com.example.stayops.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationMetricsService {

    private final AuditLogRepository auditLogRepository;

    public AutomationMetricsDTO getDailyMetrics(LocalDate date) {
        Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<AuditLog> logs = auditLogRepository.findAll().stream()
                .filter(log -> log.getTimestamp().isAfter(startOfDay) &&
                        log.getTimestamp().isBefore(endOfDay))
                .toList();

        return AutomationMetricsDTO.builder()
                .autoConfirmedReservations(countByAction(logs, "AUTO_CONFIRM"))
                .autoAssignedRooms(countByAction(logs, "AUTO_ASSIGN_ROOM"))
                .roomAssignmentFailures(countByAction(logs, "ROOM_ASSIGN_FAIL"))
                .successfulWebhooks(countByAction(logs, "WEBHOOK_SUCCESS"))
                .failedWebhooks(countByAction(logs, "WEBHOOK_FAILURE"))
                .tasksCreated(countByEntityType(logs, "HOUSEKEEPING_TASK", "CREATE"))
                .tasksCompleted(countByEntityType(logs, "HOUSEKEEPING_TASK", "COMPLETE"))
                .markedNoShows(countByAction(logs, "NO_SHOW"))
                .cancelledStaleReservations(countByAction(logs, "STALE_CANCELLED"))
                .fraudAlertsCreated(countByEntityType(logs, "FRAUD_ALERT", "CREATE"))
                .otaBookingsProcessed(countByAction(logs, "OTA_BOOKING"))
                .date(date)
                .period("DAILY")
                .build();
    }

    private int countByAction(List<AuditLog> logs, String action) {
        return (int) logs.stream()
                .filter(log -> action.equals(log.getAction()))
                .count();
    }

    private int countByEntityType(List<AuditLog> logs, String entityType, String action) {
        return (int) logs.stream()
                .filter(log -> entityType.equals(log.getEntityType()) &&
                        action.equals(log.getAction()))
                .count();
    }
}