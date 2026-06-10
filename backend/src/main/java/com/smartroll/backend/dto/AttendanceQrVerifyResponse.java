package com.smartroll.backend.dto;

import java.time.LocalDate;

public class AttendanceQrVerifyResponse {

    private boolean success;
    private String message;

    private Long scheduleId;
    private Integer classId;
    private LocalDate date;

    // Additional metadata for student UI
    private String subjectName;
    private String teacherName;
    private String classTime;

    public AttendanceQrVerifyResponse() {
    }

    public static AttendanceQrVerifyResponse success(
            Long scheduleId,
            Integer classId,
            LocalDate date,
            String subjectName,
            String teacherName,
            String classTime
    ) {
        AttendanceQrVerifyResponse r = new AttendanceQrVerifyResponse();
        r.success = true;
        r.message = "Attendance marked successfully";
        r.scheduleId = scheduleId;
        r.classId = classId;
        r.date = date;
        r.subjectName = subjectName;
        r.teacherName = teacherName;
        r.classTime = classTime;
        return r;
    }

    // Backward-compatible overload
    public static AttendanceQrVerifyResponse success(Long scheduleId, Integer classId, LocalDate date) {
        return success(scheduleId, classId, date, null, null, null);
    }

    public static AttendanceQrVerifyResponse failure(String message) {
        AttendanceQrVerifyResponse r = new AttendanceQrVerifyResponse();
        r.success = false;
        r.message = message;
        return r;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getClassTime() {
        return classTime;
    }

    public void setClassTime(String classTime) {
        this.classTime = classTime;
    }
}
