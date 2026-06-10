package com.smartroll.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public class AttendanceQrTokenGenerateRequest {

    @NotNull
    private Long scheduleId;

    @NotNull
    private Integer classId;

    @NotNull
    private LocalDate date;

    /**
     * Token expiry in minutes from generation time.
     */
    @NotNull
    private Integer expiresInMinutes;

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

    public Integer getExpiresInMinutes() {
        return expiresInMinutes;
    }

    public void setExpiresInMinutes(Integer expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }
}

