package com.example.stayops.controller;

import com.example.stayops.automation.AutomationMetricsService;
import com.example.stayops.dto.AutomationMetricsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class MetricsController {

    private final AutomationMetricsService metricsService;

    @GetMapping("/automation/daily")
    public ResponseEntity<AutomationMetricsDTO> getDailyMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(metricsService.getDailyMetrics(date));
    }

    @GetMapping("/automation/today")
    public ResponseEntity<AutomationMetricsDTO> getTodayMetrics() {
        return ResponseEntity.ok(metricsService.getDailyMetrics(LocalDate.now()));
    }
}