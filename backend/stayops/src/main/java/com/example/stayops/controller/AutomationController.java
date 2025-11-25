package com.example.stayops.controller;

import com.example.stayops.automation.*;
import com.example.stayops.config.AutomationConfig;
import com.example.stayops.entity.FraudAlert;
import com.example.stayops.entity.HousekeepingTask;
import com.example.stayops.entity.PricingRule;
import com.example.stayops.repository.FraudAlertRepository;
import com.example.stayops.repository.HousekeepingTaskRepository;
import com.example.stayops.repository.PricingRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/automation")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class AutomationController {

    private final AutomationConfig automationConfig;
    private final DynamicPricingService pricingService;
    private final FraudDetectionService fraudService;
    private final ChannelManagerService channelService;
    private final HousekeepingTaskRepository housekeepingRepo;
    private final PricingRuleRepository pricingRuleRepo;
    private final FraudAlertRepository fraudAlertRepo;

    // ========== CONFIGURATION & STATUS ==========

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getAutomationConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("holdTtlMinutes", automationConfig.getHoldTtlMinutes());
        config.put("noShowGracePeriodHours", automationConfig.getNoShowGracePeriodHours());
        config.put("stalePendingHours", automationConfig.getStalePendingHours());
        config.put("paymentTimeoutMinutes", automationConfig.getPaymentTimeoutMinutes());
        config.put("autoAssignRooms", automationConfig.isAutoAssignRooms());
        config.put("autoCreateHousekeeping", automationConfig.isAutoCreateHousekeeping());
        config.put("autoMarkNoShows", automationConfig.isAutoMarkNoShows());
        config.put("autoConfirmOnPayment", automationConfig.isAutoConfirmOnPayment());
        return ResponseEntity.ok(config);
    }

    @PutMapping("/config")
    public ResponseEntity<Map<String, Object>> updateAutomationConfig(
            @RequestBody Map<String, Object> updates) {

        if (updates.containsKey("autoAssignRooms")) {
            automationConfig.setAutoAssignRooms((Boolean) updates.get("autoAssignRooms"));
        }
        if (updates.containsKey("autoCreateHousekeeping")) {
            automationConfig.setAutoCreateHousekeeping((Boolean) updates.get("autoCreateHousekeeping"));
        }
        if (updates.containsKey("autoMarkNoShows")) {
            automationConfig.setAutoMarkNoShows((Boolean) updates.get("autoMarkNoShows"));
        }

        return getAutomationConfig();
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAutomationStatus() {
        Map<String, Object> status = new HashMap<>();

        // Housekeeping stats
        long pendingTasks = housekeepingRepo.findByStatus("PENDING").size();
        long urgentTasks = housekeepingRepo.findUrgentTasks().size();

        // Fraud stats
        long pendingAlerts = fraudAlertRepo.findByStatus("PENDING").size();
        long highRiskAlerts = fraudAlertRepo.findBySeverityAndStatus("HIGH", "PENDING").size();

        status.put("housekeeping", Map.of(
                "pendingTasks", pendingTasks,
                "urgentTasks", urgentTasks
        ));

        status.put("fraud", Map.of(
                "pendingAlerts", pendingAlerts,
                "highRiskAlerts", highRiskAlerts
        ));

        status.put("automationsEnabled", Map.of(
                "roomAssignment", automationConfig.isAutoAssignRooms(),
                "housekeeping", automationConfig.isAutoCreateHousekeeping(),
                "noShows", automationConfig.isAutoMarkNoShows(),
                "paymentConfirmation", automationConfig.isAutoConfirmOnPayment()
        ));

        return ResponseEntity.ok(status);
    }

    // ========== HOUSEKEEPING MANAGEMENT ==========

    @GetMapping("/housekeeping/pending")
    public ResponseEntity<List<HousekeepingTask>> getPendingTasks() {
        return ResponseEntity.ok(housekeepingRepo.findByStatus("PENDING"));
    }

    @GetMapping("/housekeeping/urgent")
    public ResponseEntity<List<HousekeepingTask>> getUrgentTasks() {
        return ResponseEntity.ok(housekeepingRepo.findUrgentTasks());
    }

    @GetMapping("/housekeeping/date/{date}")
    public ResponseEntity<List<HousekeepingTask>> getTasksByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(housekeepingRepo.findByScheduledDate(date));
    }

    @PatchMapping("/housekeeping/{id}/complete")
    public ResponseEntity<HousekeepingTask> completeTask(
            @PathVariable Long id,
            @RequestParam String completedBy) {

        HousekeepingTask task = housekeepingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus("COMPLETED");
        task.setCompletedBy(completedBy);
        task.setCompletedAt(java.time.Instant.now());

        return ResponseEntity.ok(housekeepingRepo.save(task));
    }

    // ========== DYNAMIC PRICING ==========

    @GetMapping("/pricing/rules")
    public ResponseEntity<List<PricingRule>> getAllPricingRules() {
        return ResponseEntity.ok(pricingRuleRepo.findAll());
    }

    @GetMapping("/pricing/rules/active")
    public ResponseEntity<List<PricingRule>> getActivePricingRules() {
        return ResponseEntity.ok(pricingRuleRepo.findByIsActiveTrueOrderByPriorityAsc());
    }

    @PostMapping("/pricing/rules")
    public ResponseEntity<PricingRule> createPricingRule(@RequestBody PricingRule rule) {
        return ResponseEntity.ok(pricingRuleRepo.save(rule));
    }

    @PutMapping("/pricing/rules/{id}")
    public ResponseEntity<PricingRule> updatePricingRule(
            @PathVariable Long id,
            @RequestBody PricingRule rule) {

        PricingRule existing = pricingRuleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        existing.setRuleName(rule.getRuleName());
        existing.setRuleType(rule.getRuleType());
        existing.setIsActive(rule.getIsActive());
        existing.setPriority(rule.getPriority());
        existing.setMinDaysToArrival(rule.getMinDaysToArrival());
        existing.setMaxDaysToArrival(rule.getMaxDaysToArrival());
        existing.setMinOccupancyPercent(rule.getMinOccupancyPercent());
        existing.setMaxOccupancyPercent(rule.getMaxOccupancyPercent());
        existing.setPriceMultiplier(rule.getPriceMultiplier());
        existing.setPriceAddition(rule.getPriceAddition());
        existing.setPriceReduction(rule.getPriceReduction());
        existing.setMinPrice(rule.getMinPrice());
        existing.setMaxPrice(rule.getMaxPrice());
        existing.setDescription(rule.getDescription());

        return ResponseEntity.ok(pricingRuleRepo.save(existing));
    }

    @DeleteMapping("/pricing/rules/{id}")
    public ResponseEntity<Void> deletePricingRule(@PathVariable Long id) {
        pricingRuleRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/pricing/update-all")
    public ResponseEntity<Map<String, String>> triggerPriceUpdate() {
        pricingService.updateRoomPrices();
        return ResponseEntity.ok(Map.of("status", "Price update triggered"));
    }

    // ========== FRAUD DETECTION ==========

    @GetMapping("/fraud/alerts/pending")
    public ResponseEntity<List<FraudAlert>> getPendingFraudAlerts() {
        return ResponseEntity.ok(fraudService.getPendingAlerts());
    }

    @GetMapping("/fraud/alerts/high-risk")
    public ResponseEntity<List<FraudAlert>> getHighRiskAlerts() {
        return ResponseEntity.ok(fraudService.getHighRiskAlerts());
    }

    @GetMapping("/fraud/alerts")
    public ResponseEntity<List<FraudAlert>> getAllFraudAlerts() {
        return ResponseEntity.ok(fraudAlertRepo.findAll());
    }

    @PatchMapping("/fraud/alerts/{id}/review")
    public ResponseEntity<FraudAlert> reviewFraudAlert(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam String reviewedBy,
            @RequestParam(required = false) String notes) {

        FraudAlert alert = fraudAlertRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setStatus(status);
        alert.setReviewedBy(reviewedBy);
        alert.setReviewedAt(java.time.Instant.now());
        alert.setReviewNotes(notes);

        return ResponseEntity.ok(fraudAlertRepo.save(alert));
    }

    // ========== OTA CHANNEL MANAGEMENT ==========

    @PostMapping("/ota/sync-availability")
    public ResponseEntity<Map<String, String>> syncAvailabilityToOTA(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        channelService.syncAvailabilityToOTA(startDate, endDate);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Availability synced for " + startDate + " to " + endDate
        ));
    }

    @PostMapping("/ota/sync-rates")
    public ResponseEntity<Map<String, String>> syncRatesToOTA(
            @RequestBody Map<String, Double> roomTypeRates) {

        channelService.syncRatesToOTA(roomTypeRates);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Rates synced for " + roomTypeRates.size() + " room types"
        ));
    }

    @PostMapping("/ota/incoming-booking")
    public ResponseEntity<Map<String, Object>> processOTABooking(@RequestBody String otaPayload) {
        var reservation = channelService.processOTABooking(otaPayload);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "reservationId", reservation.getReservationId()
        ));
    }

    // ========== MANUAL TRIGGERS ==========

    @PostMapping("/jobs/process-no-shows")
    public ResponseEntity<Map<String, String>> triggerNoShowProcessing() {
        // This would call the scheduled job manually
        return ResponseEntity.ok(Map.of(
                "status", "triggered",
                "message", "No-show processing job started"
        ));
    }

    @PostMapping("/jobs/nightly-audit")
    public ResponseEntity<Map<String, String>> triggerNightlyAudit() {
        // This would call the nightly audit job manually
        return ResponseEntity.ok(Map.of(
                "status", "triggered",
                "message", "Nightly audit job started"
        ));
    }
}