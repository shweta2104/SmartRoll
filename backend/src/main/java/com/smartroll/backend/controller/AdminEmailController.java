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

import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.service.EmailService;
import com.smartroll.backend.service.TeacherService;

class BulkEmailRequest {

    public List<Long> teacherIds;
    public String subject;
    public String body;
}

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmailController {

    private static final Logger logger = LoggerFactory.getLogger(AdminEmailController.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private TeacherService teacherService;

    @PostMapping("/teachers/bulk-email")
    public ResponseEntity<String> sendBulkEmail(@RequestBody BulkEmailRequest request) {
        try {
            List<Teacher> teachers = teacherService.getAllTeachers().stream()
                    .filter(t -> request.teacherIds.contains(t.getId()))
                    .collect(Collectors.toList());

            int sentCount = 0;
            for (Teacher teacher : teachers) {
                try {
                    String teacherName = (teacher.getFirstName() != null ? teacher.getFirstName() : "") + " " + (teacher.getLastName() != null ? teacher.getLastName() : "");
                    teacherName = teacherName.trim().isEmpty() ? "Teacher" : teacherName;
                    emailService.sendEmail(teacher.getEmail(), request.subject, request.body); // Use custom subject/body
                    sentCount++;
                } catch (Exception e) {
                    logger.error("Failed to send email to teacher {} ({}): {}", teacher.getId(), teacher.getEmail(), e.getMessage());
                }
            }

            logger.info("Bulk email completed: {}/{} sent successfully", sentCount, teachers.size());
            return ResponseEntity.ok(String.format("Sent %d/%d emails successfully!", sentCount, teachers.size()));
        } catch (Exception e) {
            logger.error("Bulk email process failed", e);
            return ResponseEntity.internalServerError().body("Failed to process bulk email: " + e.getMessage());
        }
    }
}
