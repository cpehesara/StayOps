package com.example.stayops.controller;

import com.example.stayops.entity.Department;
import com.example.stayops.service.EnhancedPerformanceService;
import com.example.stayops.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST APIs for Department Performance Tracking
 *
 * Endpoints:
 * - POST   /api/performance/update-all          → Update all departments now
 * - POST   /api/performance/update/{id}         → Update specific department
 * - GET    /api/performance/department/{id}     → Get department performance details
 * - GET    /api/performance/factors/{id}        → Get performance calculation factors
 * - GET    /api/performance/analysis/{score}    → Get performance rating text
 * - GET    /api/performance/leaderboard         → Get top performing departments
 * - GET    /api/performance/status              → Check system status
 */

@Slf4j
@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PerformanceController {

    private final EnhancedPerformanceService performanceService;
    private final DepartmentRepository departmentRepository;

    /**
     * Update all department performance scores immediately
     * POST /api/performance/update-all
     *
     * Use this for:
     * - Manual testing
     * - Admin dashboard refresh
     * - Emergency recalculation
     */
    @PostMapping("/update-all")
    public ResponseEntity<Map<String, Object>> updateAllPerformances() {
        log.info("📊 Manual update requested for all departments");

        try {
            performanceService.updateAllDepartmentPerformances();

            List<Department> departments = departmentRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All department performances updated successfully");
            response.put("total_departments", departments.size());
            response.put("timestamp", java.time.Instant.now());
            response.put("departments", departments.stream()
                    .map(d -> Map.of(
                            "id", d.getId(),
                            "name", d.getName(),
                            "performance", d.getPerformance() != null ? d.getPerformance() : 0,
                            "status", d.getStatus().name()
                    ))
                    .collect(Collectors.toList())
            );

            log.info("✅ Successfully updated {} departments", departments.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error updating all performances: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating performances: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Update specific department performance
     * POST /api/performance/update/{id}
     *
     * Use this to immediately recalculate one department
     */
    @PostMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateDepartmentPerformance(@PathVariable Long id) {
        log.info("📊 Manual update requested for department ID: {}", id);

        try {
            Department updated = performanceService.updateDepartmentPerformance(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Department performance updated successfully");
            response.put("department", Map.of(
                    "id", updated.getId(),
                    "name", updated.getName(),
                    "performance", updated.getPerformance(),
                    "status", updated.getStatus().name(),
                    "analysis", performanceService.getPerformanceAnalysis(updated.getPerformance())
            ));
            response.put("timestamp", java.time.Instant.now());

            log.info("✅ Department {} performance updated to: {}", updated.getName(), updated.getPerformance());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Department not found: {}", id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Department not found: " + id);

            return ResponseEntity.status(404).body(response);

        } catch (Exception e) {
            log.error("❌ Error updating department {}: {}", id, e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating performance: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get department performance details
     * GET /api/performance/department/{id}
     *
     * Returns complete performance information for a department
     */
    @GetMapping("/department/{id}")
    public ResponseEntity<Map<String, Object>> getDepartmentPerformance(@PathVariable Long id) {
        try {
            Department department = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found: " + id));

            int performance = department.getPerformance() != null ? department.getPerformance() : 0;

            Map<String, Object> response = new HashMap<>();
            response.put("id", department.getId());
            response.put("name", department.getName());
            response.put("performance", performance);
            response.put("status", department.getStatus().name());
            response.put("analysis", performanceService.getPerformanceAnalysis(performance));
            response.put("rating", getPerformanceRating(performance));
            response.put("total_staff", department.getStaff() != null ? department.getStaff().size() : 0);
            response.put("active_staff", department.getStaff() != null ?
                    department.getStaff().stream().filter(s -> "ACTIVE".equals(s.getStatus().name())).count() : 0);
            response.put("created_at", department.getCreatedAt());
            response.put("updated_at", department.getUpdatedAt());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Department not found");
            return ResponseEntity.status(404).body(response);
        }
    }

    /**
     * Get performance calculation factors (debugging)
     * GET /api/performance/factors/{id}
     *
     * Shows all factors that contribute to performance score
     */
    @GetMapping("/factors/{id}")
    public ResponseEntity<Map<String, Object>> getPerformanceFactors(@PathVariable Long id) {
        try {
            Department department = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found: " + id));

            String factors = performanceService.getPerformanceFactors(department);

            Map<String, Object> response = new HashMap<>();
            response.put("department_id", id);
            response.put("department_name", department.getName());
            response.put("factors", factors);
            response.put("timestamp", java.time.Instant.now());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Department not found");
            return ResponseEntity.status(404).body(response);
        }
    }

    /**
     * Get performance analysis for any score
     * GET /api/performance/analysis/{score}
     *
     * Returns the performance rating text for a given score
     */
    @GetMapping("/analysis/{score}")
    public ResponseEntity<Map<String, Object>> getPerformanceAnalysis(@PathVariable int score) {
        if (score < 0 || score > 100) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Score must be between 0 and 100");
            return ResponseEntity.badRequest().body(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("analysis", performanceService.getPerformanceAnalysis(score));
        response.put("rating", getPerformanceRating(score));
        response.put("color", getPerformanceColor(score));

        return ResponseEntity.ok(response);
    }

    /**
     * Get performance leaderboard
     * GET /api/performance/leaderboard
     *
     * Returns top performing departments
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<Map<String, Object>> getPerformanceLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {

        List<Department> allDepartments = departmentRepository.findAll();

        List<Map<String, Object>> leaderboard = allDepartments.stream()
                .sorted((d1, d2) -> {
                    int perf1 = d1.getPerformance() != null ? d1.getPerformance() : 0;
                    int perf2 = d2.getPerformance() != null ? d2.getPerformance() : 0;
                    return Integer.compare(perf2, perf1); // Descending
                })
                .limit(limit)
                .map(d -> {
                    int performance = d.getPerformance() != null ? d.getPerformance() : 0;
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("id", d.getId());
                    entry.put("name", d.getName());
                    entry.put("performance", performance);
                    entry.put("rating", getPerformanceRating(performance));
                    entry.put("status", d.getStatus().name());
                    return entry;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("leaderboard", leaderboard);
        response.put("total_departments", allDepartments.size());
        response.put("timestamp", java.time.Instant.now());

        return ResponseEntity.ok(response);
    }

    /**
     * Check performance system status
     * GET /api/performance/status
     *
     * Verifies that the performance tracking system is working
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        List<Department> departments = departmentRepository.findAll();

        long totalDepartments = departments.size();
        long departmentsWithScore = departments.stream()
                .filter(d -> d.getPerformance() != null && d.getPerformance() > 0)
                .count();

        double avgPerformance = departments.stream()
                .mapToInt(d -> d.getPerformance() != null ? d.getPerformance() : 0)
                .average()
                .orElse(0.0);

        Map<String, Object> response = new HashMap<>();
        response.put("system_active", true);
        response.put("total_departments", totalDepartments);
        response.put("departments_with_scores", departmentsWithScore);
        response.put("coverage_percentage", totalDepartments > 0 ?
                (departmentsWithScore * 100.0 / totalDepartments) : 0);
        response.put("average_performance", Math.round(avgPerformance));
        response.put("timestamp", java.time.Instant.now());
        response.put("next_scheduled_update", "Every 30 minutes (check logs for last run)");

        return ResponseEntity.ok(response);
    }

    // Helper methods

    private String getPerformanceRating(int score) {
        if (score >= 90) return "EXCEPTIONAL";
        if (score >= 75) return "EXCELLENT";
        if (score >= 60) return "GOOD";
        if (score >= 45) return "FAIR";
        if (score >= 30) return "BELOW_AVERAGE";
        return "CRITICAL";
    }

    private String getPerformanceColor(int score) {
        if (score >= 90) return "#10b981"; // Green
        if (score >= 75) return "#3b82f6"; // Blue
        if (score >= 60) return "#f59e0b"; // Orange
        if (score >= 45) return "#ef4444"; // Red
        return "#991b1b"; // Dark Red
    }
}