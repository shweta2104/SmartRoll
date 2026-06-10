package com.smartroll.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import com.smartroll.backend.dto.AttendanceQrTokenGenerateRequest;
import com.smartroll.backend.dto.AttendanceQrTokenResponse;
import com.smartroll.backend.dto.AttendanceQrVerifyRequest;
import com.smartroll.backend.dto.AttendanceQrVerifyResponse;
import com.smartroll.backend.dto.StudentAttendanceRowDto;
import com.smartroll.backend.dto.TeacherAttendanceListResponseDto;
import com.smartroll.backend.dto.StudentAttendanceForTeacherRowDto;
import com.smartroll.backend.entity.Attendance;

import com.smartroll.backend.entity.Schedule;
import com.smartroll.backend.entity.Subject;
import com.smartroll.backend.repository.AttendanceRepository;
import com.smartroll.backend.repository.AttendanceQrTokenRepository;
import com.smartroll.backend.service.SubjectService;
import com.smartroll.backend.service.TeacherService;

import com.smartroll.backend.entity.AttendanceQrToken;
import com.smartroll.backend.entity.Student;
import com.smartroll.backend.entity.ClassEntity;
import com.smartroll.backend.repository.StudentRepository;
import com.smartroll.backend.repository.ClassEntityRepository;

@Service

public class AttendanceService {

    public AttendanceQrTokenResponse generateQrToken(AttendanceQrTokenGenerateRequest request, Long teacherId) {

        if (request == null || request.getScheduleId() == null || request.getClassId() == null || request.getDate() == null) {
            throw new IllegalArgumentException("Invalid request");
        }

        if (teacherId == null) {
            throw new IllegalArgumentException("Teacher not resolved");
        }

        long minutes = request.getExpiresInMinutes() != null ? request.getExpiresInMinutes() : 15L;
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(minutes);

        String tokenValue = UUID.randomUUID().toString();

        AttendanceQrToken token = new AttendanceQrToken();
        token.setTokenValue(tokenValue);
        token.setScheduleId(request.getScheduleId());
        token.setClassId(request.getClassId());
        token.setDate(request.getDate());
        token.setCreatedAt(createdAt);
        token.setExpiresAt(expiresAt);
        token.setActive(true);
        token.setGeneratedByTeacherId(teacherId);

        AttendanceQrToken saved = attendanceQrTokenRepository.save(token);

        return new AttendanceQrTokenResponse(saved.getId(), saved.getTokenValue(), saved.getScheduleId(), saved.getClassId(), saved.getDate(), saved.getExpiresAt());
    }

    @Autowired
    private StudentService studentService;

    // Student dashboard: fetch the current active teacher QR token (for today)
    public AttendanceQrTokenResponse getCurrentActiveTeacherQrTokenForLoggedInStudentToday() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;
        String email = null;

        if (principal instanceof Integer i) {
            userId = i;
        } else if (principal instanceof String s) {
            // JwtFilter sets principal = email (String)
            email = s;
        }

        if (userId == null && (email == null || email.isBlank())) {
            return null;
        }

        var studentOpt = (userId != null)
                ? studentService.getStudentByUserId(userId)
                : studentService.getStudentByEmail(email);

        if (studentOpt == null || studentOpt.isEmpty()) {
            return null;
        }

        Integer studentId = studentOpt.get().getStudentId();
        LocalDate today = LocalDate.now();

        var tokenOpt = attendanceQrTokenRepository
                .findTopByDateAndActiveTrueOrderByCreatedAtDesc(today);

        if (tokenOpt == null || tokenOpt.isEmpty()) {
            return null;
        }

        var token = tokenOpt.get();
        if (token.getExpiresAt() == null || LocalDateTime.now().isAfter(token.getExpiresAt())) {
            return null;
        }

        return new AttendanceQrTokenResponse(
                token.getId(),
                token.getTokenValue(),
                token.getScheduleId(),
                token.getClassId(),
                token.getDate(),
                token.getExpiresAt());
    }

    public AttendanceQrVerifyResponse verifyQrAndMarkAttendance(AttendanceQrVerifyRequest request) {
        try {
            System.out.println("[DEBUG][QR_VERIFY] verifyQrAndMarkAttendance called. tokenValuePresent=" + (request != null && request.getTokenValue() != null));
            if (request == null || request.getTokenValue() == null || request.getTokenValue().isBlank()) {
                return AttendanceQrVerifyResponse.failure("Token is required");
            }

            var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return AttendanceQrVerifyResponse.failure("Not authenticated");
            }

            Object principal = authentication.getPrincipal();
            Integer userId = null;
            if (principal instanceof Integer i) {
                userId = i;
            }

            // In your JwtFilter, principal is email (String) not userId.
            String email = null;
            if (principal instanceof String s) {
                email = s;
            }

            System.out.println("[DEBUG][QR_VERIFY] principalType=" + (principal == null ? "null" : principal.getClass().getName())
                    + ", userId=" + userId + ", email=" + email + ", authenticationName=" + authentication.getName());

            if (userId == null && (email == null || email.isBlank())) {
                return AttendanceQrVerifyResponse.failure("Unable to resolve student identity");
            }

            var studentOpt = (userId != null)
                    ? studentService.getStudentByUserId(userId)
                    : studentService.getStudentByEmail(email);

            System.out.println("[DEBUG][QR_VERIFY] student lookup present=" + (studentOpt != null && studentOpt.isPresent())
                    + ", studentId=" + (studentOpt != null && studentOpt.isPresent() ? studentOpt.get().getStudentId() : null));

            if (studentOpt == null || studentOpt.isEmpty()) {
                return AttendanceQrVerifyResponse.failure("Student not found");
            }

            Integer studentId = studentOpt.get().getStudentId();
            if (studentId == null) {
                return AttendanceQrVerifyResponse.failure("StudentId not available");
            }

            var tokens = attendanceQrTokenRepository.findByTokenValue(request.getTokenValue());
            int tokenSize = tokens == null ? 0 : tokens.size();
            System.out.println("[DEBUG][QR_VERIFY] token lookup tokenListSize=" + tokenSize);

            if (tokens == null || tokens.isEmpty()) {
                return AttendanceQrVerifyResponse.failure("Invalid or inactive QR token");
            }

            // Correctness guard: tokenValue should be unique. If duplicates exist in DB,
            // selecting one “best” token can cause false "already marked" errors.
            // Fail fast so the teacher can regenerate a clean QR token.
            if (tokens.size() > 1) {
                return AttendanceQrVerifyResponse.failure("Duplicate QR token detected. Please regenerate QR.");
            }

            AttendanceQrToken token = tokens.get(0);

            if (token == null || !token.isActive()) {
                return AttendanceQrVerifyResponse.failure("Invalid or inactive QR token");
            }

            if (token.getExpiresAt() == null || java.time.LocalDateTime.now().isAfter(token.getExpiresAt())) {
                return AttendanceQrVerifyResponse.failure("QR token expired");
            }

            // Basic token field validation (prevents DB constraint failures)
            if (token.getDate() == null) {
                return AttendanceQrVerifyResponse.failure("Token date missing");
            }
            if (token.getScheduleId() == null) {
                return AttendanceQrVerifyResponse.failure("Token schedule missing");
            }
            if (token.getClassId() == null) {
                return AttendanceQrVerifyResponse.failure("Token class missing");
            }

// Ensure student has not marked already for this schedule/date/class
            LocalDate tokenDate = token.getDate();
            Integer tokenClassId = token.getClassId();

            System.out.println("[DEBUG][QR_VERIFY] studentId=" + studentId
                    + ", tokenDate=" + tokenDate
                    + ", tokenClassId=" + tokenClassId
                    + ", scheduleId=" + token.getScheduleId()
                    + ", tokenValue=" + (request.getTokenValue() == null ? "null" : request.getTokenValue().substring(0, Math.min(8, request.getTokenValue().length())))
                    + (request.getTokenValue() != null && request.getTokenValue().length() > 8 ? "..." : ""));

            System.out.println("[DEBUG][QR_VERIFY] About to check existing attendance: studentId=" + studentId
                    + ", tokenDate=" + tokenDate + ", tokenClassId=" + tokenClassId
                    + ", scheduleId=" + token.getScheduleId());

            List<Attendance> existing = attendanceRepository.findByStudentIdAndDateAndClassId(
                    studentId,
                    tokenDate,
                    tokenClassId);

            System.out.println("[DEBUG][QR_VERIFY] existingCount=" + (existing == null ? 0 : existing.size())
                    + (existing != null && !existing.isEmpty() ? ", existingAttendanceId=" + existing.get(0).getAttendanceId() : "")
                    + ", enteringExistingBranch=" + (existing != null && !existing.isEmpty()));

            if (existing != null && !existing.isEmpty()) {
                // If attendance already exists, treat QR scan as an update (idempotent *and* refresh markedAt/status).
                Attendance existingAttendance = existing.get(0);
                // Ensure latest status/time are reflected for the student UI/reporting.
                existingAttendance.setStatus(Attendance.AttendanceStatus.PRESENT);
                existingAttendance.setMarkedAt(LocalDateTime.now());

                try {
                    attendanceRepository.save(existingAttendance);
                    System.out.println("[DEBUG][QR_VERIFY] Attendance updated (already existed) attendanceId="
                            + existingAttendance.getAttendanceId());
                } catch (Exception dbEx) {
                    System.out.println("[DEBUG][QR_VERIFY] DB exception during attendanceRepository.save(existingAttendance): "
                            + (dbEx.getMessage() != null ? dbEx.getMessage() : "database error"));
                    dbEx.printStackTrace();
                    // Keep returning success to avoid UI blocking; QR already scanned.
                }

                Long scheduleId = token.getScheduleId();
                String subjectName = null;
                String teacherName = null;
                String classTime = null;

                try {
                    if (scheduleId != null) {
                        var scheduleOpt = scheduleService.getScheduleById(scheduleId);
                        if (scheduleOpt.isPresent()) {
                            Schedule schedule = scheduleOpt.get();

                            if (schedule.getSubjectId() != null) {
                                var subjectOpt = subjectService.getSubjectById(schedule.getSubjectId());
                                if (subjectOpt.isPresent()) {
                                    subjectName = subjectOpt.get().getName();
                                }
                            }

                            if (schedule.getStartTime() != null && schedule.getEndTime() != null) {
                                String start = schedule.getStartTime().toString();
                                String end = schedule.getEndTime().toString();
                                classTime = start.length() >= 5 ? start.substring(0, 5) : start + " - "
                                        + (end.length() >= 5 ? end.substring(0, 5) : end);

                                if (classTime != null && (start.length() < 5 || end.length() < 5)) {
                                    classTime = start + " - " + end;
                                }
                            }
                        }
                    }

                    if (token.getGeneratedByTeacherId() != null) {
                        var teacherOpt = teacherService.getTeacherById(token.getGeneratedByTeacherId());
                        if (teacherOpt.isPresent()) {
                            var t = teacherOpt.get();
                            String name = (t.getFirstName() != null ? t.getFirstName() : "")
                                    + (t.getLastName() != null ? " " + t.getLastName() : "");
                            teacherName = name.trim();

                            if (t.getDept() != null && !t.getDept().isBlank()) {
                                teacherName = teacherName + " (" + t.getDept() + ")";
                            }
                        }
                    }
                } catch (Exception ignored) {
                    // keep nulls
                }

                System.out.println(
                        "[DEBUG][QR_VERIFY] Attendance already existed; attendanceId=" + existingAttendance.getAttendanceId()
                        + ", studentId=" + existingAttendance.getStudentId()
                        + ", classId=" + existingAttendance.getClassId()
                        + ", date=" + existingAttendance.getDate()
                        + ", status=" + existingAttendance.getStatus());

                return AttendanceQrVerifyResponse.success(
                        token.getScheduleId(),
                        token.getClassId(),
                        token.getDate(),
                        subjectName,
                        teacherName,
                        classTime
                );
            }

            System.out.println("[DEBUG][QR_VERIFY] existingCount was 0 -> attempting INSERT. studentId=" + studentId
                    + ", tokenDate=" + token.getDate() + ", tokenClassId=" + token.getClassId() + ", scheduleId=" + token.getScheduleId());

            Attendance attendance = new Attendance();
            attendance.setStudentId(studentId);
            attendance.setClassId(token.getClassId());
            attendance.setDate(token.getDate());
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            attendance.setScheduleId(token.getScheduleId());
            attendance.setMarkedAt(LocalDateTime.now());

            // Persist attendance (separate guard)
            try {
                Attendance saved = attendanceRepository.save(attendance);
                System.out.println(
                        "[DEBUG] Attendance saved via QR verify: "
                        + "attendanceId=" + saved.getAttendanceId() + ", "
                        + "studentId=" + saved.getStudentId() + ", "
                        + "classId=" + saved.getClassId() + ", "
                        + "scheduleId=" + saved.getScheduleId() + ", "
                        + "date=" + saved.getDate() + ", "
                        + "status=" + saved.getStatus() + ", "
                        + "markedAt=" + saved.getMarkedAt()
                );
            } catch (Exception dbEx) {
                System.out.println("[DEBUG][QR_VERIFY] DB exception during attendanceRepository.save: "
                        + (dbEx.getMessage() != null ? dbEx.getMessage() : "database error"));
                dbEx.printStackTrace();
                return AttendanceQrVerifyResponse.failure("Failed to mark attendance: " + (dbEx.getMessage() != null ? dbEx.getMessage() : "database error"));
            }

            // Fetch additional metadata for UI
            String subjectName = null;
            String teacherName = null;
            String classTime = null;

            try {
                Long scheduleId = token.getScheduleId();
                if (scheduleId != null) {
                    var scheduleOpt = scheduleService.getScheduleById(scheduleId);
                    if (scheduleOpt.isPresent()) {
                        Schedule schedule = scheduleOpt.get();

                        if (schedule.getSubjectId() != null) {
                            var subjectOpt = subjectService.getSubjectById(schedule.getSubjectId());
                            if (subjectOpt.isPresent()) {
                                subjectName = subjectOpt.get().getName();
                            }
                        }

                        // Class time formatted as "HH:mm - HH:mm"
                        if (schedule.getStartTime() != null && schedule.getEndTime() != null) {
                            String start = schedule.getStartTime().toString();
                            String end = schedule.getEndTime().toString();

                            classTime = start.length() >= 5 ? start.substring(0, 5) : start + " - "
                                    + (end.length() >= 5 ? end.substring(0, 5) : end);
                            // safer override if needed
                            if (classTime != null && (start.length() < 5 || end.length() < 5)) {
                                classTime = start + " - " + end;
                            }
                        }

                    }
                }

                // Teacher name from generatedByTeacherId
                if (token.getGeneratedByTeacherId() != null) {
                    var teacherOpt = teacherService.getTeacherById(token.getGeneratedByTeacherId());

                    if (teacherOpt.isPresent()) {
                        var t = teacherOpt.get();
                        String name = (t.getFirstName() != null ? t.getFirstName() : "")
                                + (t.getLastName() != null ? " " + t.getLastName() : "");
                        teacherName = name.trim();
                        // If dept exists, you can append it (optional)
                        if (t.getDept() != null && !t.getDept().isBlank()) {
                            teacherName = teacherName + " (" + t.getDept() + ")";
                        }
                    }
                }
            } catch (Exception ignored) {
                // keep nulls
            }

            // Optionally deactivate token after one scan (not requested). Keeping active for other students.
            return AttendanceQrVerifyResponse.success(
                    token.getScheduleId(),
                    token.getClassId(),
                    token.getDate(),
                    subjectName,
                    teacherName,
                    classTime
            );
        } catch (Exception ex) {
            return AttendanceQrVerifyResponse.failure("Failed to mark attendance: " + (ex.getMessage() != null ? ex.getMessage() : "unexpected error"));
        }
    }

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private AttendanceQrTokenRepository attendanceQrTokenRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassEntityRepository classEntityRepository;


    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    public Optional<Attendance> getAttendanceById(Integer id) {
        return attendanceRepository.findById(id);
    }

    public List<Attendance> getAttendancesByStudentId(Integer studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAttendanceListByStudentIdAndDate(Integer studentId, LocalDate date) {
        if (studentId == null || date == null) {
            return List.of();
        }
        // No dedicated repository method exists; filter in memory.
        return attendanceRepository.findByStudentId(studentId)
                .stream()
                .filter(a -> a.getDate() != null && date.equals(a.getDate()))
                .toList();
    }

    public List<Attendance> getAttendancesByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public List<Attendance> getAttendancesByClassId(Integer classId) {
        return attendanceRepository.findByClassId(classId);
    }

    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public void deleteAttendance(@Nullable Integer id) {
        attendanceRepository.deleteById(id);
    }

    public Attendance markAttendance(Attendance attendance) {

        // Check if attendance already exists for the student on the same date and class
        List<Attendance> existingAttendance = attendanceRepository.findByStudentIdAndDateAndClassId(
                attendance.getStudentId(), attendance.getDate(), attendance.getClassId());

        if (existingAttendance != null && !existingAttendance.isEmpty()) {
            throw new IllegalArgumentException("Attendance already marked for this student on this date and class");
        }

        // Check constraint: if lecture time is 10:00 AM to 11:00 AM, cannot add attendance after 8:00 PM on same day
        Optional<Schedule> scheduleOpt = scheduleService.getScheduleById(attendance.getScheduleId());
        if (scheduleOpt.isPresent()) {
            Schedule schedule = scheduleOpt.get();
            LocalTime lectureStartTime = schedule.getStartTime().toLocalTime();
            LocalTime lectureEndTime = schedule.getEndTime().toLocalTime();
            LocalTime constraintStart = LocalTime.of(10, 0);
            LocalTime constraintEnd = LocalTime.of(11, 0);
            LocalTime cutoffTime = LocalTime.of(20, 0); // 8:00 PM

            if (lectureStartTime.equals(constraintStart) && lectureEndTime.equals(constraintEnd)) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime cutoffDateTime = LocalDateTime.of(attendance.getDate(), cutoffTime);
                if (now.isAfter(cutoffDateTime)) {
                    throw new IllegalArgumentException("Cannot mark attendance after 8:00 PM for lectures from 10:00 AM to 11:00 AM on the same day");
                }
            }
        }

        attendance.setMarkedAt(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public TeacherAttendanceListResponseDto getTeacherAttendanceList(Long scheduleId, Integer classId, LocalDate date) {

        if (classId == null || date == null) {
            return new TeacherAttendanceListResponseDto(scheduleId, classId, date != null ? date.toString() : null, List.of());
        }

        // All students for the selected class
        List<Student> students = studentRepository.findByClassId(classId.longValue());
        if (students == null) {
            students = List.of();
        }

        // Attendance rows for the selected lecture (schedule + date)
        // (We still also filter by classId for safety)
        List<Attendance> attendanceRows = attendanceRepository.findByScheduleIdAndDate(scheduleId, date);
        if (attendanceRows == null) {
            attendanceRows = List.of();
        }

        java.util.Map<Integer, Attendance.AttendanceStatus> statusByStudentId = new java.util.HashMap<>();
        for (Attendance a : attendanceRows) {
            if (a == null) continue;
            if (a.getClassId() != null && !a.getClassId().equals(classId)) continue;
            if (a.getStudentId() != null && a.getStatus() != null) {
                statusByStudentId.put(a.getStudentId(), a.getStatus());
            }
        }

        // Division is stored in classes table (ClassEntity.division)
        String division = null;
        String classSem = null;

        try {
            // classId here maps to ClassEntity.id
            var classOpt = classEntityRepository.findById(classId.longValue());
            if (classOpt.isPresent()) {
                ClassEntity ce = classOpt.get();
                division = ce.getDivision();
                classSem = ce.getSem();
            }
        } catch (Exception ignored) {
        }

        // Prefer sem from each student (student.sem) else use class sem from ClassEntity.


        // Build rows
        List<StudentAttendanceForTeacherRowDto> rows = new java.util.ArrayList<>();
        for (Student s : students) {
            if (s == null) continue;

            Integer sid = s.getStudentId();
            Attendance.AttendanceStatus st = sid != null ? statusByStudentId.get(sid) : null;

            String status = st != null ? (st == Attendance.AttendanceStatus.PRESENT ? "PRESENT" : "ABSENT") : "ABSENT";

            String rowSem = s.getSem() != null ? s.getSem() : classSem;
            String rowDivision = division; // from ClassEntity


            // If division not available, try to read from student's class sem/whatever you already store
            // (Your current Student entity does not include division, so this will often stay null.)

            rows.add(new StudentAttendanceForTeacherRowDto(
                    sid,
                    s.getRollNo(),
                    s.getFirstName(),
                    s.getLastName(),
                    rowSem,
                    rowDivision,
                    status
            ));
        }

        return new TeacherAttendanceListResponseDto(scheduleId, classId, date.toString(), rows);
    }

    // Dashboard Analytics Methods
    public double getTodayAttendancePercentage(List<Integer> classIds, LocalDate date) {
        if (classIds == null || classIds.isEmpty()) {
            return 0.0;
        }
        List<Attendance> attendances = attendanceRepository.findByClassIdInAndDate(classIds, date);
        if (attendances.isEmpty()) {
            return 0.0;
        }
        long presentCount = attendances.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
        return (presentCount * 100.0) / attendances.size();
    }

    public long getAbsentStudentsCount(List<Integer> classIds, LocalDate date) {
        if (classIds == null || classIds.isEmpty()) {
            return 0L;
        }
        List<Attendance> attendances = attendanceRepository.findByClassIdInAndDate(classIds, date);
        return attendances.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT)
                .count();
    }

    public List<Attendance> getMonthlyAttendanceTrend(List<Integer> classIds, LocalDate startDate, LocalDate endDate) {
        if (classIds == null || classIds.isEmpty()) {
            return List.of();
        }
        return attendanceRepository.findByDateBetween(startDate, endDate);
    }

    // Method to get attendance report by scheduleId and date
    public List<Attendance> getAttendanceReport(Long scheduleId, LocalDate date) {
        return attendanceRepository.findByScheduleIdAndDate(scheduleId, date);
    }

    // Recent attendance rows (Date, Subject, Status) for the student
    // Returns the most recent N rows based on date.
    public List<StudentAttendanceRowDto> getRecentAttendanceRowsByStudentId(Integer studentId, int limit) {

        if (studentId == null || limit <= 0) {
            return List.of();
        }

        List<Attendance> all = attendanceRepository.findByStudentId(studentId);
        if (all == null || all.isEmpty()) {
            return List.of();
        }

        // Sort by date desc (and keep deterministic ordering)
        all = all.stream()
                .filter(a -> a.getDate() != null)
                .sorted((a, b) -> {
                    int c = b.getDate().compareTo(a.getDate());
                    if (c != 0) {
                        return c;
                    }
                    Integer aidA = a.getAttendanceId();
                    Integer aidB = b.getAttendanceId();
                    return aidA != null && aidB != null ? Integer.compare(aidB, aidA) : 0;
                })
                .toList();

        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");

        return all.stream()
                .limit(limit)
                .map(a -> {
                    String date = a.getDate() != null ? a.getDate().format(fmt) : "";
                    String status = a.getStatus() == Attendance.AttendanceStatus.PRESENT ? "Present" : "Absent";

                    String subjectName = "";
                    try {
                        Long scheduleId = a.getScheduleId();
                        if (scheduleId != null) {
                            var scheduleOpt = scheduleService.getScheduleById(scheduleId);
                            if (scheduleOpt.isPresent() && scheduleOpt.get().getSubjectId() != null) {
                                Long subjectId = scheduleOpt.get().getSubjectId();
                                var subjectOpt = subjectService.getSubjectById(subjectId);
                                if (subjectOpt.isPresent()) {
                                    Subject s = subjectOpt.get();
                                    subjectName = s.getName();
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }

                    return new StudentAttendanceRowDto(date, subjectName, status);
                })
                .toList();
    }
}
