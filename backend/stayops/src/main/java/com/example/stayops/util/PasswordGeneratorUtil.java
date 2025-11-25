package com.example.stayops.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Password generator for web application users
 * Generates passwords for: Manager table and Receptionist table
 * Staff table is NOT included (minor staff don't access web application)
 */
public class PasswordGeneratorUtil {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("=".repeat(80));
        System.out.println("STAYOPS WEB APPLICATION PASSWORD GENERATOR");
        System.out.println("For: System Admin, Operational Manager, Service Manager, Receptionist");
        System.out.println("=".repeat(80));
        System.out.println();

        // Generate passwords
        String[] passwords = {
                "admin123",
                "opmanager123",
                "servicemanager123",
                "receptionist123"
        };

        System.out.println("ENCODED PASSWORDS:");
        System.out.println("-".repeat(80));
        for (String password : passwords) {
            String encoded = encoder.encode(password);
            System.out.printf("Original: %-25s | Encoded: %s%n", password, encoded);
        }

        System.out.println();
        System.out.println("=".repeat(80));
        System.out.println("SQL INSERT STATEMENTS FOR MANAGERS TABLE");
        System.out.println("=".repeat(80));
        System.out.println();

        // Generate SQL for System Admin (Manager table)
        String adminPassword = encoder.encode("admin123");
        System.out.println("-- SYSTEM ADMIN (Managers table)");
        System.out.println("INSERT INTO managers (username, password, full_name, email, phone, role, active, created_at, updated_at)");
        System.out.println("VALUES (");
        System.out.println("  'admin',");
        System.out.println("  '" + adminPassword + "',");
        System.out.println("  'System Administrator',");
        System.out.println("  'admin@stayops.com',");
        System.out.println("  '+94771234567',");
        System.out.println("  'ADMIN',");
        System.out.println("  true,");
        System.out.println("  NOW(),");
        System.out.println("  NOW()");
        System.out.println(");");
        System.out.println();

        // Generate SQL for Operational Manager (Manager table)
        String opManagerPassword = encoder.encode("opmanager123");
        System.out.println("-- OPERATIONAL MANAGER (Managers table)");
        System.out.println("INSERT INTO managers (username, password, full_name, email, phone, role, active, created_at, updated_at)");
        System.out.println("VALUES (");
        System.out.println("  'opmanager',");
        System.out.println("  '" + opManagerPassword + "',");
        System.out.println("  'Operational Manager',");
        System.out.println("  'opmanager@stayops.com',");
        System.out.println("  '+94771234568',");
        System.out.println("  'OPERATIONAL_MANAGER',");
        System.out.println("  true,");
        System.out.println("  NOW(),");
        System.out.println("  NOW()");
        System.out.println(");");
        System.out.println();

        // Generate SQL for Service Manager (Manager table)
        String serviceManagerPassword = encoder.encode("servicemanager123");
        System.out.println("-- SERVICE MANAGER (Managers table)");
        System.out.println("INSERT INTO managers (username, password, full_name, email, phone, role, active, created_at, updated_at)");
        System.out.println("VALUES (");
        System.out.println("  'servicemanager',");
        System.out.println("  '" + serviceManagerPassword + "',");
        System.out.println("  'Service Manager',");
        System.out.println("  'servicemanager@stayops.com',");
        System.out.println("  '+94771234569',");
        System.out.println("  'SERVICE_MANAGER',");
        System.out.println("  true,");
        System.out.println("  NOW(),");
        System.out.println("  NOW()");
        System.out.println(");");
        System.out.println();

        System.out.println("=".repeat(80));
        System.out.println("SQL INSERT STATEMENTS FOR RECEPTIONISTS TABLE");
        System.out.println("=".repeat(80));
        System.out.println();

        // Generate SQL for Receptionist (Receptionists table)
        String receptionistPassword = encoder.encode("receptionist123");
        System.out.println("-- RECEPTIONIST (Receptionists table)");
        System.out.println("INSERT INTO receptionists (username, password, full_name, email, phone, active, shift_type, created_at, updated_at)");
        System.out.println("VALUES (");
        System.out.println("  'receptionist',");
        System.out.println("  '" + receptionistPassword + "',");
        System.out.println("  'Front Desk Staff',");
        System.out.println("  'receptionist@stayops.com',");
        System.out.println("  '+94771234570',");
        System.out.println("  true,");
        System.out.println("  'MORNING',");
        System.out.println("  NOW(),");
        System.out.println("  NOW()");
        System.out.println(");");
        System.out.println();

        System.out.println("=".repeat(80));
        System.out.println("WEB APPLICATION TEST CREDENTIALS");
        System.out.println("=".repeat(80));
        System.out.println();
        System.out.println("SYSTEM ADMIN (Managers table):");
        System.out.println("  Email: admin@stayops.com");
        System.out.println("  Password: admin123");
        System.out.println("  Dashboard: /admin/dashboard");
        System.out.println();
        System.out.println("OPERATIONAL MANAGER (Managers table):");
        System.out.println("  Email: opmanager@stayops.com");
        System.out.println("  Password: opmanager123");
        System.out.println("  Dashboard: /manager/dashboard");
        System.out.println();
        System.out.println("SERVICE MANAGER (Managers table):");
        System.out.println("  Email: servicemanager@stayops.com");
        System.out.println("  Password: servicemanager123");
        System.out.println("  Dashboard: /service-manager/dashboard");
        System.out.println();
        System.out.println("RECEPTIONIST (Receptionists table):");
        System.out.println("  Email: receptionist@stayops.com");
        System.out.println("  Password: receptionist123");
        System.out.println("  Dashboard: /receptionist/dashboard");
        System.out.println();
        System.out.println("=".repeat(80));
        System.out.println("DATABASE TABLE STRUCTURE");
        System.out.println("=".repeat(80));
        System.out.println();
        System.out.println("MANAGERS TABLE: System Admin, Operational Manager, Service Manager");
        System.out.println("RECEPTIONISTS TABLE: Receptionists");
        System.out.println("STAFF TABLE: Minor staff (housekeeping, maintenance, etc.) - NO WEB LOGIN");
        System.out.println();
        System.out.println("=".repeat(80));
        System.out.println("IMPORTANT NOTES");
        System.out.println("=".repeat(80));
        System.out.println();
        System.out.println("1. Staff entity is for MINOR STAFF ONLY (no web access)");
        System.out.println("2. Manager entity is for WEB APPLICATION USERS (3 management roles)");
        System.out.println("3. Receptionist entity is for FRONT DESK STAFF");
        System.out.println("4. All web users login via email and password");
        System.out.println("5. Passwords are BCrypt-encoded for security");
        System.out.println();
        System.out.println("=".repeat(80));
    }
}