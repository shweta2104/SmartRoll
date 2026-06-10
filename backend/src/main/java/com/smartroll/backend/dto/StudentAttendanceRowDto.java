package com.smartroll.backend.dto;

public class StudentAttendanceRowDto {
    private String date; // formatted dd/MM/yyyy
    private String subject;
    private String status; // Present/Absent

    public StudentAttendanceRowDto() {
    }

    public StudentAttendanceRowDto(String date, String subject, String status) {
        this.date = date;
        this.subject = subject;
        this.status = status;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

