package com.smartroll.backend.service;

import org.springframework.stereotype.Service;

@Service
public class AdminNotificationService implements NotificationService {

    @Override
    public String getWelcomeMessage() {
        return "Welcome, Administrator! You have full access to manage the system.";
    }

    @Override
    public String getRoleSpecificInfo() {
        return "As an admin, you can manage users, classes, subjects, and schedules.";
    }
}
