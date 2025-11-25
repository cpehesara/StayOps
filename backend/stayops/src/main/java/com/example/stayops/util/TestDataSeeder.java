package com.example.stayops.util;

import com.example.stayops.entity.PricingRule;
import com.example.stayops.repository.PricingRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("dev") // Only run in dev profile
@RequiredArgsConstructor
@Slf4j
public class TestDataSeeder implements CommandLineRunner {

    private final PricingRuleRepository pricingRuleRepo;

    @Override
    public void run(String... args) {
        log.info("Seeding test data for automations...");

        // Seed pricing rules if empty
        if (pricingRuleRepo.count() == 0) {
            seedPricingRules();
        }

        log.info("Test data seeding completed");
    }

    private void seedPricingRules() {
        // Early Bird Discount (30+ days advance)
        pricingRuleRepo.save(PricingRule.builder()
                .ruleName("Early Bird Special - 30 Days")
                .ruleType("EARLY_BIRD")
                .isActive(true)
                .priority(1)
                .minDaysToArrival(30)
                .priceMultiplier(new BigDecimal("0.85")) // 15% discount
                .minPrice(new BigDecimal("10000")) // Floor: LKR 10,000
                .description("15% discount for bookings 30+ days in advance")
                .build());

        // Last Minute Premium
        pricingRuleRepo.save(PricingRule.builder()
                .ruleName("Last Minute Premium")
                .ruleType("LAST_MINUTE")
                .isActive(true)
                .priority(2)
                .maxDaysToArrival(3)
                .priceMultiplier(new BigDecimal("1.20")) // 20% increase
                .description("20% increase for bookings within 3 days")
                .build());

        // Weekend Premium
        pricingRuleRepo.save(PricingRule.builder()
                .ruleName("Weekend Premium")
                .ruleType("SEASONAL")
                .isActive(true)
                .priority(3)
                .dayOfWeek("FRIDAY")
                .priceMultiplier(new BigDecimal("1.15")) // 15% increase
                .description("15% increase for Friday-Sunday stays")
                .build());

        // High Occupancy Surge
        pricingRuleRepo.save(PricingRule.builder()
                .ruleName("High Demand Surge")
                .ruleType("OCCUPANCY_BASED")
                .isActive(true)
                .priority(4)
                .minOccupancyPercent(new BigDecimal("80"))
                .priceMultiplier(new BigDecimal("1.25")) // 25% increase
                .maxPrice(new BigDecimal("60000")) // Ceiling: LKR 60,000
                .description("25% surge when occupancy exceeds 80%")
                .build());

        // Festive Season (December)
        pricingRuleRepo.save(PricingRule.builder()
                .ruleName("December Festive Premium")
                .ruleType("SEASONAL")
                .isActive(true)
                .priority(5)
                .seasonStartDate(java.time.LocalDate.of(2024, 12, 1))
                .seasonEndDate(java.time.LocalDate.of(2024, 12, 31))
                .priceMultiplier(new BigDecimal("1.30")) // 30% increase
                .description("30% premium for December festive season")
                .build());

        log.info("Created 5 pricing rules");
    }
}