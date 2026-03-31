package com.smartroll.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.Attendance;
import com.smartroll.backend.service.AttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<Attendance> getAllAttendances() {
        return attendanceService.getAllAttendances();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Integer id) {
        Optional<Attendance> attendance = attendanceService.getAttendanceById(id);
        return attendance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public List<Attendance> getAttendancesByStudentId(@PathVariable Integer studentId) {
        return attendanceService.getAttendancesByStudentId(studentId);
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<Attendance> getAttendancesByClassId(@PathVariable Integer classId) {
        return attendanceService.getAttendancesByClassId(classId);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<Attendance> getAttendancesByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getAttendancesByDate(date);
    }

    @PostMapping("/mark")
    @PreAuthorize("hasRole('TEACHER')")
    public Attendance markAttendance(@RequestBody @Valid Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Integer id) {
        if (attendanceService.getAttendanceById(id).isPresent()) {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Dashboard Analytics Endpoints
    @GetMapping("/dashboard/today-percentage")
    @PreAuthorize("hasRole('TEACHER')")
    public double getTodayAttendancePercentage(@RequestParam List<Integer> classIds) {
        return attendanceService.getTodayAttendancePercentage(classIds, LocalDate.now());
    }

    @GetMapping("/dashboard/today-absent")
    @PreAuthorize("hasRole('TEACHER')")
    public long getAbsentStudentsToday(@RequestParam List<Integer> classIds) {
        return attendanceService.getAbsentStudentsCount(classIds, LocalDate.now());
    }

    @GetMapping("/dashboard/monthly-trend")
    @PreAuthorize("hasRole('TEACHER')")
    public List<Attendance> getMonthlyAttendanceTrend(
            @RequestParam List<Integer> classIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return attendanceService.getMonthlyAttendanceTrend(classIds, startDate, endDate);
    }

    // New endpoint to get attendance report by scheduleId and date
    @GetMapping("/report")
    @PreAuthorize("hasRole('TEACHER')")
    public List<Attendance> getAttendanceReport(
            @RequestParam Long scheduleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getAttendanceReport(scheduleId, date);
    }
}
