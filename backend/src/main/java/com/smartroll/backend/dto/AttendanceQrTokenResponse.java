package com.smartroll.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceQrTokenResponse {

    private Long id;
    private String tokenValue;
    private Long scheduleId;
    private Integer classId;
    private LocalDate date;
    private LocalDateTime expiresAt;

    public AttendanceQrTokenResponse() {}

    public AttendanceQrTokenResponse(Long id, String tokenValue, Long scheduleId, Integer classId, LocalDate date,
            LocalDateTime expiresAt) {
        this.id = id;
        this.tokenValue = tokenValue;
        this.scheduleId = scheduleId;
        this.classId = classId;
        this.date = date;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenValue() {
        return tokenValue;
    }

    public void setTokenValue(String tokenValue) {
        this.tokenValue = tokenValue;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Integer getClassId() {
        return classId;
    }

    public void setClassId(Integer classId) {
        this.classId = classId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}

