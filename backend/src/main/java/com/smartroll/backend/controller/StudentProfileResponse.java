package com.smartroll.backend.controller;

public class StudentProfileResponse {
    private Integer studentId;
    private String fullName;
    private String email;
    private String contactNumber;

    public StudentProfileResponse() {
    }

    public StudentProfileResponse(Integer studentId, String fullName, String email, String contactNumber) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.email = email;
        this.contactNumber = contactNumber;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}

