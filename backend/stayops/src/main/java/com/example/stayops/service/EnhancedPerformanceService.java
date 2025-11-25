package com.example.stayops.service;

import com.example.stayops.entity.Department;
import com.example.stayops.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * ENHANCED DEPARTMENT PERFORMANCE TRACKING SERVICE
 * ================================================
 *
 * MATHEMATICAL CALCULATION LOGIC:
 * --------------------------------
 *
 * The performance score (0-100) uses a TIME-BASED DYNAMIC CALCULATION:
 *
 * FORMULA:
 * Performance = Base_Score × Time_Multiplier × Status_Factor × Efficiency_Ratio + Trend_Adjustment
 *
 * WHERE:
 *
 * 1. BASE SCORE (50 points)
 *    - Starting baseline for all departments
 *    - Ensures departments don't start at 0
 *
 * 2. TIME MULTIPLIER (Sine Wave Oscillation)
 *    - Formula: 1 + 0.3 × sin(2π × (hour_of_day / 24))
 *    - Range: 0.7 to 1.3
 *    - Logic: Simulates natural performance cycles throughout the day
 *      * Peak hours (10 AM - 2 PM): Higher multiplier (1.2-1.3)
 *      * Off-peak hours (2 AM - 6 AM): Lower multiplier (0.7-0.8)
 *    - Why: Reflects real-world operational patterns
 *
 * 3. HOURLY MOMENTUM (Cosine Wave)
 *    - Formula: 5 × cos(2π × (minute_of_hour / 60))
 *    - Range: -5 to +5 points
 *    - Logic: Creates micro-fluctuations within each hour
 *    - Why: Adds realistic variability to performance tracking
 *
 * 4. STATUS FACTOR
 *    - ACTIVE: 1.0× (100% performance potential)
 *    - MAINTENANCE: 0.65× (reduced operations)
 *    - INACTIVE: 0.25× (minimal activity)
 *    - Why: Department status directly impacts performance capability
 *
 * 5. EFFICIENCY RATIO
 *    - Formula: (Active_Staff / Total_Staff) × 100
 *    - Range: 0% to 100%
 *    - Logic: More active staff = higher performance
 *    - Special cases:
 *      * No staff: 40% (default efficiency)
 *      * All inactive: 20% (minimal operations)
 *
 * 6. TREND ADJUSTMENT (Time-Based Growth/Decay)
 *    - Formula: ±10 × sin(2π × (day_of_month / 30))
 *    - Logic: Simulates monthly performance cycles
 *      * Early month: Positive trend (ramp up)
 *      * Mid month: Peak performance
 *      * Late month: Slight decline (fatigue)
 *
 * 7. SMOOTHING ALGORITHM (Prevents Drastic Changes)
 *    - Formula: New_Score = (Previous_Score × 0.65) + (Calculated_Score × 0.35)
 *    - Why: Ensures gradual, realistic transitions
 *    - Prevents: Score jumping from 30 to 80 instantly
 *
 * FINAL CLAMPING: Ensures score stays within 0-100 range
 *
 * UPDATE FREQUENCY: Every 30 minutes (configurable via cron)
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class EnhancedPerformanceService {

    private final DepartmentRepository departmentRepository;

    // Mathematical constants for time-based calculations
    private static final double TWO_PI = 2.0 * Math.PI;
    private static final double BASE_SCORE = 50.0;
    private static final double TIME_AMPLITUDE = 0.3;
    private static final double MOMENTUM_AMPLITUDE = 5.0;
    private static final double TREND_AMPLITUDE = 10.0;
    private static final double SMOOTHING_FACTOR = 0.65; // 65% previous, 35% new

    /**
     * SCHEDULED TASK: Updates all department performance scores every 30 minutes
     * Cron Expression: "0 0/30 * * * *" means "At minute 0 and 30 of every hour"
     */
    @Scheduled(cron = "0 0/30 * * * *")
    @Transactional
    public void updateAllDepartmentPerformances() {
        log.info("🔄 Starting scheduled performance update cycle...");

        List<Department> departments = departmentRepository.findAll();
        int updatedCount = 0;

        for (Department department : departments) {
            try {
                int newScore = calculatePerformanceScore(department);
                department.setPerformance(newScore);
                department.setUpdatedAt(Instant.from(LocalDateTime.now()));
                departmentRepository.save(department);

                log.info("📊 Updated {} - Performance: {} → {}",
                        department.getName(),
                        department.getPerformance(),
                        newScore);

                updatedCount++;
            } catch (Exception e) {
                log.error("❌ Error updating performance for {}: {}",
                        department.getName(), e.getMessage());
            }
        }

        log.info("✅ Performance update complete! Updated {} departments", updatedCount);
    }

    /**
     * Calculate performance score using time-based mathematical formula
     */
    public int calculatePerformanceScore(Department department) {
        LocalDateTime now = LocalDateTime.now();

        // 1. TIME MULTIPLIER (Daily Cycle - Sine Wave)
        double hourOfDay = now.getHour() + (now.getMinute() / 60.0);
        double timeMultiplier = 1.0 + TIME_AMPLITUDE * Math.sin(TWO_PI * (hourOfDay / 24.0));

        // 2. HOURLY MOMENTUM (Micro-fluctuations - Cosine Wave)
        double minuteOfHour = now.getMinute();
        double hourlyMomentum = MOMENTUM_AMPLITUDE * Math.cos(TWO_PI * (minuteOfHour / 60.0));

        // 3. STATUS FACTOR
        double statusFactor = getStatusMultiplier(department.getStatus().name());

        // 4. EFFICIENCY RATIO (Staff Utilization)
        double efficiencyRatio = calculateEfficiencyRatio(department);

        // 5. TREND ADJUSTMENT (Monthly Cycle)
        int dayOfMonth = now.getDayOfMonth();
        double trendAdjustment = TREND_AMPLITUDE * Math.sin(TWO_PI * (dayOfMonth / 30.0));

        // 6. AGE FACTOR (How long department has existed)
        double ageFactor = calculateAgeFactor(LocalDateTime.from(department.getCreatedAt()), now);

        // CALCULATE RAW SCORE
        double rawScore = (BASE_SCORE * timeMultiplier * statusFactor * (efficiencyRatio / 100.0))
                + hourlyMomentum
                + trendAdjustment
                + ageFactor;

        // 7. APPLY SMOOTHING (Prevent drastic changes)
        double previousScore = department.getPerformance() != null ? department.getPerformance() : 50.0;
        double smoothedScore = (previousScore * SMOOTHING_FACTOR) + (rawScore * (1.0 - SMOOTHING_FACTOR));

        // 8. CLAMP TO 0-100 RANGE
        int finalScore = (int) Math.round(Math.max(0, Math.min(100, smoothedScore)));

        log.debug("Performance Calculation for {}: Raw={}, Smoothed={}, Final={}",
                department.getName(), rawScore, smoothedScore, finalScore);

        return finalScore;
    }

    /**
     * Calculate staff efficiency ratio
     */
    private double calculateEfficiencyRatio(Department department) {
        if (department.getStaff() == null || department.getStaff().isEmpty()) {
            return 40.0; // Default efficiency for empty departments
        }

        long totalStaff = department.getStaff().size();
        long activeStaff = department.getStaff().stream()
                .filter(staff -> "ACTIVE".equals(staff.getStatus().name()))
                .count();

        if (totalStaff == 0) {
            return 40.0;
        }

        double ratio = (activeStaff * 100.0) / totalStaff;

        // Boost ratio slightly if all staff are active
        if (activeStaff == totalStaff && totalStaff > 0) {
            ratio = Math.min(100.0, ratio * 1.1);
        }

        return ratio;
    }

    /**
     * Get status multiplier based on department status
     */
    private double getStatusMultiplier(String status) {
        return switch (status) {
            case "ACTIVE" -> 1.0;
            case "MAINTENANCE" -> 0.65;
            case "INACTIVE" -> 0.25;
            default -> 0.8;
        };
    }

    /**
     * Calculate age factor (departments improve over time initially)
     */
    private double calculateAgeFactor(LocalDateTime createdAt, LocalDateTime now) {
        if (createdAt == null) {
            return 0.0;
        }

        Duration age = Duration.between(createdAt, now);
        double daysOld = age.toDays();

        // Logarithmic growth: New departments grow quickly, then plateau
        // Formula: 10 × ln(days + 1) / ln(365)
        // Result: 0 to +10 points over first year
        if (daysOld < 365) {
            return 10.0 * (Math.log(daysOld + 1) / Math.log(365));
        }

        return 10.0; // Mature departments get full age bonus
    }

    /**
     * Manual update for a single department (for testing/admin use)
     */
    @Transactional
    public Department updateDepartmentPerformance(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentId));

        int newScore = calculatePerformanceScore(department);
        department.setPerformance(newScore);
        department.setUpdatedAt(Instant.from(LocalDateTime.now()));

        return departmentRepository.save(department);
    }

    /**
     * Get performance analysis text
     */
    public String getPerformanceAnalysis(int score) {
        if (score >= 90) return "🌟 Exceptional - Operating at peak efficiency";
        if (score >= 75) return "✅ Excellent - Strong performance across metrics";
        if (score >= 60) return "👍 Good - Solid operational performance";
        if (score >= 45) return "⚠️ Fair - Room for improvement needed";
        if (score >= 30) return "⚠️ Below Average - Requires attention";
        return "🚨 Critical - Immediate intervention required";
    }

    /**
     * Get real-time performance factors for debugging
     */
    public String getPerformanceFactors(Department department) {
        LocalDateTime now = LocalDateTime.now();
        double hourOfDay = now.getHour() + (now.getMinute() / 60.0);

        return String.format("""
            Performance Factors for %s:
            - Time Multiplier: %.2f (Hour: %.2f)
            - Status Factor: %.2f (%s)
            - Efficiency: %.1f%%
            - Current Score: %d
            - Trend: %s
            """,
                department.getName(),
                1.0 + TIME_AMPLITUDE * Math.sin(TWO_PI * (hourOfDay / 24.0)),
                hourOfDay,
                getStatusMultiplier(department.getStatus().name()),
                department.getStatus(),
                calculateEfficiencyRatio(department),
                department.getPerformance(),
                department.getPerformance() >= 60 ? "↗️ Upward" : "↘️ Needs Improvement"
        );
    }
}