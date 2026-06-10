package com.smartroll.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.Student;
import com.smartroll.backend.service.EmailService;
import com.smartroll.backend.service.StudentService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentEmailController {

    private static final Logger logger = LoggerFactory.getLogger(AdminStudentEmailController.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private StudentService studentService;

    @PostMapping("/students/bulk-email")
    public ResponseEntity<String> sendBulkEmail(@RequestBody StudentBulkEmailRequest request) {
        try {
            if (request == null || request.studentIds == null || request.studentIds.isEmpty()) {
                return ResponseEntity.badRequest().body("No studentIds provided");
            }

            String subject = request.subject != null ? request.subject : "Announcement from SmartRoll Admin";
            String body = request.body != null ? request.body : "Please check your schedule and announcements.";

            List<Student> students = studentService.getAllStudents().stream()
                    .filter(s -> request.studentIds.contains(s.getId()))
                    .collect(Collectors.toList());

            int sentCount = 0;
            for (Student student : students) {
                try {
                    emailService.sendEmail(student.getEmail(), subject, body);
                    sentCount++;
                } catch (Exception e) {
                    logger.error("Failed to send email to student {} ({}): {}", student.getId(), student.getEmail(), e.getMessage());
                }
            }

            logger.info("Bulk email completed: {}/{} sent successfully", sentCount, students.size());
            return ResponseEntity.ok(String.format("Sent %d/%d emails successfully!", sentCount, students.size()));
        } catch (Exception e) {
            logger.error("Bulk email process failed", e);
            return ResponseEntity.internalServerError().body("Failed to process bulk email: " + e.getMessage());
        }
    }
}
