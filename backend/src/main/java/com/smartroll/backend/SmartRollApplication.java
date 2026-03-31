package com.smartroll.backend;

import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.smartroll.backend.entity.Admin;
import com.smartroll.backend.entity.ClassEntity;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.AdminService;
import com.smartroll.backend.service.ClassEntityService;
import com.smartroll.backend.service.UserService;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class SmartRollApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartRollApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializeData(UserService userService, AdminService adminService, ClassEntityService classEntityService, PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialize default admin user if not exists
            Optional<User> existingAdmin = userService.getUserByEmail("admin@smartroll.com");
            if (existingAdmin.isEmpty()) {
                System.out.println("Creating default admin user...");
                // Create User entity for admin
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setName("Administrator");
                adminUser.setEmail("admin@smartroll.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole(User.Role.ADMIN);
                adminUser.setCreatedAt(java.time.LocalDateTime.now());
                adminUser.setUpdatedAt(java.time.LocalDateTime.now());
                User savedUser = userService.saveUser(adminUser);

                // Create Admin entity
                Admin admin = new Admin();
                admin.setUserId(savedUser.getUserId());
                admin.setEmail("admin@smartroll.com");
                admin.setStatus(Admin.Status.ACTIVE);
                adminService.saveAdmin(admin);
                System.out.println("Default admin user created with email: admin@smartroll.com and password: admin123");
            } else {
                System.out.println("Updating default admin user password...");
                User adminUser = existingAdmin.get();
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setUpdatedAt(java.time.LocalDateTime.now());
                userService.saveUser(adminUser);
                System.out.println("Default admin user password updated.");
            }

            // Check if classes already exist
            if (classEntityService.getAllClasses().isEmpty()) {
                ClassEntity classA = new ClassEntity();
                classA.setClassCode("FY-CS-A");
                classA.setDivision("A");
                classA.setSem("Sem 1");
                classA.setStatus("ACTIVE");

                ClassEntity classB = new ClassEntity();
                classB.setClassCode("FY-CS-B");
                classB.setDivision("B");
                classB.setSem("Sem 1");
                classB.setStatus("ACTIVE");

                ClassEntity classC = new ClassEntity();
                classC.setClassCode("FY-CS-C");
                classC.setDivision("C");
                classC.setSem("Sem 1");
                classC.setStatus("ACTIVE");

                ClassEntity classD = new ClassEntity();
                classD.setClassCode("FY-CS-D");
                classD.setDivision("D");
                classD.setSem("Sem 1");
                classD.setStatus("ACTIVE");

                classEntityService.saveClass(classA);
                classEntityService.saveClass(classB);
                classEntityService.saveClass(classC);
                classEntityService.saveClass(classD);
            }
        };
    }

}
