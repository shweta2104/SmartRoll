package com.smartroll.backend.dto;

import java.util.List;

public class TeacherAttendanceListResponseDto {

    private Long scheduleId;
    private Integer classId;
    private String date; // YYYY-MM-DD
    private List<StudentAttendanceForTeacherRowDto> rows;

    public TeacherAttendanceListResponseDto() {
    }

    public TeacherAttendanceListResponseDto(Long scheduleId, Integer classId, String date, List<StudentAttendanceForTeacherRowDto> rows) {
        this.scheduleId = scheduleId;
        this.classId = classId;
        this.date = date;
        this.rows = rows;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<StudentAttendanceForTeacherRowDto> getRows() {
        return rows;
    }

    public void setRows(List<StudentAttendanceForTeacherRowDto> rows) {
        this.rows = rows;
    }
}
