package com.example.stayops.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "stayops.automation")
@Data
public class AutomationConfig {
    private int holdTtlMinutes = 15;
    private int noShowGracePeriodHours = 24;
    private int stalePendingHours = 72;
    private int paymentTimeoutMinutes = 30;
    private boolean autoAssignRooms = true;
    private boolean autoCreateHousekeeping = true;
    private boolean autoMarkNoShows = true;
    private boolean autoConfirmOnPayment = true;
}