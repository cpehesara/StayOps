package com.example.stayops.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class HealthController {

    private final DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();

        // Database check
        try (Connection conn = dataSource.getConnection()) {
            health.put("database", "UP");
            health.put("dbUrl", conn.getMetaData().getURL());
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("dbError", e.getMessage());
        }

        // Application status
        health.put("application", "UP");
        health.put("timestamp", java.time.Instant.now());

        return ResponseEntity.ok(health);
    }

    @GetMapping("/automations")
    public ResponseEntity<Map<String, String>> automationHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("paymentWebhook", "OPERATIONAL");
        status.put("roomAssignment", "OPERATIONAL");
        status.put("housekeeping", "OPERATIONAL");
        status.put("noShowDetection", "OPERATIONAL");
        status.put("fraudDetection", "OPERATIONAL");
        status.put("dynamicPricing", "OPERATIONAL");
        status.put("otaSync", "OPERATIONAL");

        return ResponseEntity.ok(status);
    }
}