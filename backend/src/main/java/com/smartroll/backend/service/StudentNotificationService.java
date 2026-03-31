package com.smartroll.backend.service;

import org.springframework.stereotype.Service;

@Service
public class StudentNotificationService implements NotificationService {

    @Override
    public String getWelcomeMessage() {
        return "Welcome, Student! Access your class schedules and attendance records.";
    }

    @Override
    public String getRoleSpecificInfo() {
        return "As a student, you can view your class schedules and check your attendance.";
    }
}
