package com.smartroll.backend.dto;

public class StudentAttendanceForTeacherRowDto {

    private Integer studentId;
    private String rollNo;
    private String firstName;
    private String lastName;
    private String sem;
    private String division;
    private String status; // PRESENT | ABSENT

    public StudentAttendanceForTeacherRowDto() {
    }

    public StudentAttendanceForTeacherRowDto(
            Integer studentId,
            String rollNo,
            String firstName,
            String lastName,
            String sem,
            String division,
            String status
    ) {
        this.studentId = studentId;
        this.rollNo = rollNo;
        this.firstName = firstName;
        this.lastName = lastName;
        this.sem = sem;
        this.division = division;
        this.status = status;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getSem() {
        return sem;
    }

    public void setSem(String sem) {
        this.sem = sem;
    }

    public String getDivision() {
        return division;
    }

    public void setDivision(String division) {
        this.division = division;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
