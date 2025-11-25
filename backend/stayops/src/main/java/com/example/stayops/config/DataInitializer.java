package com.example.stayops.config;

import com.example.stayops.dto.*;
import com.example.stayops.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "default"})
public class DataInitializer implements CommandLineRunner {

    private final SystemAdminService systemAdminService;
    private final ServiceManagerService serviceManagerService;
    private final OperationalManagerService operationalManagerService;
    private final ReceptionistService receptionistService;

    @Override
    public void run(String... args) {
        log.info("========================================");
        log.info("🚀 INITIALIZING WEB USER DATA");
        log.info("========================================");

        createWebUsers();

        log.info("========================================");
        log.info("✅ WEB USER INITIALIZATION COMPLETE");
        log.info("========================================");
    }

    private void createWebUsers() {

        // SYSTEM ADMIN
        try {
            SystemAdminCreateDTO admin = SystemAdminCreateDTO.builder()
                    .username("admin")
                    .password("admin123")
                    .email("admin@stayops.com")
                    .fullName("System Administrator")
                    .phone("+94771234567")
                    .department("IT Department")
                    .permissions("ALL_PERMISSIONS")
                    .build();
            systemAdminService.createSystemAdmin(admin);
            log.info("✅ Created System Admin: admin@stayops.com / admin123");
        } catch (Exception e) {
            log.warn("⚠️  System Admin already exists: {}", e.getMessage());
        }

        // SERVICE MANAGER
        try {
            ServiceManagerCreateDTO serviceManager = ServiceManagerCreateDTO.builder()
                    .username("servicemanager")
                    .password("service123")
                    .email("service@gmail.com")
                    .fullName("Service Manager")
                    .phone("+94771234568")
                    .department("Services Department")
                    .serviceAreas("Housekeeping, Maintenance, Room Service")
                    .certification("Hotel Management Diploma")
                    .build();
            serviceManagerService.createServiceManager(serviceManager);
            log.info("✅ Created Service Manager: service@gmail.com / service123");
        } catch (Exception e) {
            log.warn("⚠️  Service Manager already exists: {}", e.getMessage());
        }

        // OPERATIONAL MANAGER
        try {
            OperationalManagerCreateDTO opManager = OperationalManagerCreateDTO.builder()
                    .username("opmanager")
                    .password("opmanager123")
                    .email("opmanager@stayops.com")
                    .fullName("Operational Manager")
                    .phone("+94771234569")
                    .department("Operations Department")
                    .operationalAreas("Front Desk, Reception, Guest Services")
                    .shiftType("FULL_TIME")
                    .build();
            operationalManagerService.createOperationalManager(opManager);
            log.info("✅ Created Operational Manager: opmanager@stayops.com / opmanager123");
        } catch (Exception e) {
            log.warn("⚠️  Operational Manager already exists: {}", e.getMessage());
        }

        // RECEPTIONIST
        try {
            ReceptionistCreateDTO receptionist = ReceptionistCreateDTO.builder()
                    .username("receptionist")
                    .password("reception@123")
                    .email("reception@gmail.com")
                    .fullName("Front Desk Receptionist")
                    .phone("+94771234570")
                    .shiftType("MORNING")
                    .deskNumber("DESK-001")
                    .build();
            receptionistService.createReceptionist(receptionist);
            log.info("✅ Created Receptionist: reception@gmail.com / reception@123");
        } catch (Exception e) {
            log.warn("⚠️  Receptionist already exists: {}", e.getMessage());
        }

        log.info("");
        log.info("========================================");
        log.info("📋 WEB LOGIN CREDENTIALS");
        log.info("========================================");
        log.info("");
        log.info("🔑 SYSTEM ADMIN:");
        log.info("   Email: admin@stayops.com");
        log.info("   Password: admin123");
        log.info("");
        log.info("🔑 SERVICE MANAGER:");
        log.info("   Email: service@gmail.com");
        log.info("   Password: service123");
        log.info("");
        log.info("🔑 OPERATIONAL MANAGER:");
        log.info("   Email: opmanager@stayops.com");
        log.info("   Password: opmanager123");
        log.info("");
        log.info("🔑 RECEPTIONIST:");
        log.info("   Email: reception@gmail.com");
        log.info("   Password: reception@123");
        log.info("");
        log.info("========================================");
        log.info("NOTE: Guest and Staff login separately");
        log.info("========================================");
    }
}