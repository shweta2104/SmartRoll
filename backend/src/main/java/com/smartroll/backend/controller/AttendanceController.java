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

import com.smartroll.backend.dto.AttendanceQrTokenGenerateRequest;
import com.smartroll.backend.dto.AttendanceQrTokenResponse;
import com.smartroll.backend.dto.AttendanceQrVerifyRequest;
import com.smartroll.backend.dto.AttendanceQrVerifyResponse;
import com.smartroll.backend.dto.StudentAttendanceSummary;
import com.smartroll.backend.dto.StudentAttendanceRowDto;
import com.smartroll.backend.dto.TeacherAttendanceListResponseDto;


import com.smartroll.backend.entity.Attendance;
import com.smartroll.backend.entity.Student;
import com.smartroll.backend.service.AttendanceService;
import com.smartroll.backend.service.StudentService;
import com.smartroll.backend.service.TeacherService;

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

    @GetMapping("/by-id/{id}")

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

    // ===== QR-code Attendance endpoints (teacher generates token, student verifies) =====
    @PostMapping("/qr/teacher/generate")
    @PreAuthorize("hasRole('TEACHER')")
    public AttendanceQrTokenResponse generateQrToken(@RequestBody @Valid AttendanceQrTokenGenerateRequest request) {
        return attendanceService.generateQrToken(request, getCurrentTeacherId());
    }

    private Long getCurrentTeacherId() {

        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        // JwtFilter sets principal = email (String)
        Object principal = authentication.getPrincipal();
        String email = principal instanceof String s ? s : null;
        if (email == null || email.isBlank()) {
            email = authentication.getName();
        }

        if (email == null || email.isBlank()) {
            return null;
        }

        var teacherOpt = teacherService.getTeacherByEmail(email);
        return teacherOpt.map(com.smartroll.backend.entity.Teacher::getId).orElse(null);
    }

    @PostMapping("/qr/student/verify")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public AttendanceQrVerifyResponse verifyQrAttendance(@RequestBody @Valid AttendanceQrVerifyRequest request) {
        return attendanceService.verifyQrAndMarkAttendance(request);
    }

    // Student dashboard: fetch the current active teacher QR token (for today)
    @GetMapping("/qr/student/current")
    @PreAuthorize("hasRole('STUDENT')")
    public AttendanceQrTokenResponse getCurrentTeacherQrToken() {
        return attendanceService.getCurrentActiveTeacherQrTokenForLoggedInStudentToday();
    }

    // New endpoint to get attendance report by scheduleId and date
    @GetMapping("/report")
    @PreAuthorize("hasRole('TEACHER')")
    public List<Attendance> getAttendanceReport(
            @RequestParam Long scheduleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getAttendanceReport(scheduleId, date);
    }

    @GetMapping("/teacher/list")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherAttendanceListResponseDto getTeacherAttendanceList(
            @RequestParam Long scheduleId,
            @RequestParam Integer classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getTeacherAttendanceList(scheduleId, classId, date);
    }


    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    // Student summary for top dashboard cards
    @GetMapping("/student/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentAttendanceSummary getStudentSummary() {

        System.out.println("[DEBUG] getStudentSummary called");

        if (studentService == null) {
            System.out.println("[DEBUG] studentService is null, returning default");
            return new StudentAttendanceSummary(0.0, 0, 0, "UNKNOWN");
        }

        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("[DEBUG] authentication is null or not authenticated");
            return new StudentAttendanceSummary(0.0, 0, 0, "UNKNOWN");
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;
        String email = null;

        if (principal instanceof Integer i) {
            userId = i;
        } else if (principal instanceof String s) {
            // JwtFilter sets Authentication principal as email (String)
            email = s;
        }

        // Fallback (safer than calling repositories with null)
        if (email == null) {
            String name = authentication.getName();
            if (name != null && !name.isBlank()) {
                email = name;
            }
        }

        System.out.println("[DEBUG] Extracted - userId: " + userId + ", email: " + email);

        Optional<Student> studentOpt = Optional.empty();
        if (userId != null) {
            studentOpt = studentService.getStudentByUserId(userId);
            System.out.println("[DEBUG] Looked up student by userId: " + userId + ", found: " + studentOpt.isPresent());
        } else if (email != null) {
            studentOpt = studentService.getStudentByEmail(email);
            System.out.println("[DEBUG] Looked up student by email: " + email + ", found: " + studentOpt.isPresent());
        }

        if (studentOpt.isEmpty()) {
            System.out.println("[DEBUG] Student not found, returning default");
            return new StudentAttendanceSummary(0.0, 0, 0, "UNKNOWN");
        }

        Student student = studentOpt.get();
        Integer studentId = student.getStudentId();
        System.out.println("[DEBUG] Found student with ID: " + studentId);

        // Overall counts
        List<Attendance> attendances = attendanceService.getAttendancesByStudentId(studentId);
        System.out.println("[DEBUG] Total attendance records found: " + attendances.size());

        long presentCount = attendances.stream()
                .filter(a -> a.getDate() != null && a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
        long absentCount = attendances.stream()
                .filter(a -> a.getDate() != null && a.getStatus() == Attendance.AttendanceStatus.ABSENT)
                .count();

        System.out.println("[DEBUG] Present: " + presentCount + ", Absent: " + absentCount);

        double overallPercentage = (presentCount + absentCount) > 0
                ? Math.round(((double) presentCount / (presentCount + absentCount)) * 1000.0) / 10.0
                : 0.0;

        // Today's status
        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendances = attendanceService
                .getAttendanceListByStudentIdAndDate(studentId, today);

        System.out.println("[DEBUG] Today's attendance records: " + todayAttendances.size());

        String todayStatus = "UNKNOWN";
        if (!todayAttendances.isEmpty()) {
            Attendance.AttendanceStatus status = todayAttendances.get(0).getStatus();
            todayStatus = status == Attendance.AttendanceStatus.PRESENT ? "PRESENT" : "ABSENT";
        }

        StudentAttendanceSummary summary = new StudentAttendanceSummary(overallPercentage, (int) presentCount, (int) absentCount, todayStatus);
        System.out.println("[DEBUG] Returning summary: " + summary.getOverallAttendancePercentage() + "%, Present: " + summary.getPresentClasses() + ", Absent: " + summary.getAbsentClasses() + ", Today: " + todayStatus);

        return summary;
    }

    // Recent attendance rows (Date, Subject, Status) for the student
    @GetMapping("/student/rows")
    @PreAuthorize("hasRole('STUDENT')")
    public List<StudentAttendanceRowDto> getStudentAttendanceRows() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return List.of();
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;
        String email = null;

        if (principal instanceof Integer i) {
            userId = i;
        } else if (principal instanceof String s) {
            email = s;
        }

        if (email == null) {
            String name = authentication.getName();
            if (name != null && !name.isBlank()) {
                email = name;
            }
        }

        Optional<Student> studentOpt = Optional.empty();
        if (userId != null) {
            studentOpt = studentService.getStudentByUserId(userId);
        } else if (email != null) {
            studentOpt = studentService.getStudentByEmail(email);
        }

        if (studentOpt.isEmpty()) {
            return List.of();
        }

        Integer studentId = studentOpt.get().getStudentId();
        return attendanceService.getRecentAttendanceRowsByStudentId(studentId, 3);
    }
}
