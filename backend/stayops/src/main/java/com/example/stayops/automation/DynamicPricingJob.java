package com.example.stayops.automation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicPricingJob {

    private final DynamicPricingService dynamicPricingService;

    /**
     * Update room prices daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void updateDailyPrices() {
        log.info("Running daily dynamic pricing update");
        try {
            dynamicPricingService.updateRoomPrices();
            log.info("Daily dynamic pricing update completed");
        } catch (Exception e) {
            log.error("Error in dynamic pricing update: {}", e.getMessage(), e);
        }
    }
}