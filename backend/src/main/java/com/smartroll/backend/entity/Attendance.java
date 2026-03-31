package com.smartroll.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Integer attendanceId;

    @NotNull(message = "Student ID is required")
    @Column(name = "student_id")
    private Integer studentId;

    @NotNull(message = "Class ID is required")
    @Column(name = "class_id")
    private Integer classId;

    @NotNull(message = "Date is required")
    @Column(name = "date")
    private LocalDate date;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AttendanceStatus status;

    @Column(name = "marked_at")
    private LocalDateTime markedAt;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    public enum AttendanceStatus {
        PRESENT, ABSENT
    }

    // Getters and Setters
    public Integer getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Integer attendanceId) {
        this.attendanceId = attendanceId;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
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

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public LocalDateTime getMarkedAt() {
        return markedAt;
    }

    public void setMarkedAt(LocalDateTime markedAt) {
        this.markedAt = markedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    @Override
    public String toString() {
        return "Attendance{"
                + "attendanceId=" + attendanceId
                + ", studentId=" + studentId
                + ", classId=" + classId
                + ", date=" + date
                + ", status=" + status
                + ", markedAt=" + markedAt
                + ", remarks='" + remarks + '\''
                + ", scheduleId=" + scheduleId
                + '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Attendance attendance = (Attendance) o;
        return attendanceId != null && attendanceId.equals(attendance.attendanceId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
