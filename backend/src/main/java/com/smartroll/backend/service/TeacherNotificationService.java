package com.smartroll.backend.service;

import org.springframework.stereotype.Service;

@Service
public class TeacherNotificationService implements NotificationService {

    @Override
    public String getWelcomeMessage() {
        return "Welcome, Teacher! Manage your classes and track student attendance.";
    }

    @Override
    public String getRoleSpecificInfo() {
        return "As a teacher, you can manage your assigned classes, subjects, and mark attendance.";
    }
}
