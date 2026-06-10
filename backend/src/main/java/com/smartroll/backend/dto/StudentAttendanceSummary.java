package com.smartroll.backend.dto;

public class StudentAttendanceSummary {
    private double overallAttendancePercentage;
    private int presentClasses;
    private int absentClasses;
    private String todayStatus;

    public StudentAttendanceSummary() {
    }

    public StudentAttendanceSummary(double overallAttendancePercentage, int presentClasses, int absentClasses, String todayStatus) {
        this.overallAttendancePercentage = overallAttendancePercentage;
        this.presentClasses = presentClasses;
        this.absentClasses = absentClasses;
        this.todayStatus = todayStatus;
    }

    public double getOverallAttendancePercentage() {
        return overallAttendancePercentage;
    }

    public void setOverallAttendancePercentage(double overallAttendancePercentage) {
        this.overallAttendancePercentage = overallAttendancePercentage;
    }

    public int getPresentClasses() {
        return presentClasses;
    }

    public void setPresentClasses(int presentClasses) {
        this.presentClasses = presentClasses;
    }

    public int getAbsentClasses() {
        return absentClasses;
    }

    public void setAbsentClasses(int absentClasses) {
        this.absentClasses = absentClasses;
    }

    public String getTodayStatus() {
        return todayStatus;
    }

    public void setTodayStatus(String todayStatus) {
        this.todayStatus = todayStatus;
    }
}

