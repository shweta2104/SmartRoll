package com.smartroll.backend.dto;

public class StudentPastLectureDto {

    private String date;
    private String subjectName;
    private String subjectCode;
    private String teacherName;

    private String startTime;
    private String endTime;
    private String room;

    private String status;

    public StudentPastLectureDto() {}

    public StudentPastLectureDto(
            String date,
            String subjectName,
            String subjectCode,
            String teacherName,
            String startTime,
            String endTime,
            String room,
            String status
    ) {
        this.date = date;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.teacherName = teacherName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.status = status;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

