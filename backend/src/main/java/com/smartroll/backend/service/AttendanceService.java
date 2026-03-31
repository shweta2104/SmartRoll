package com.smartroll.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import com.smartroll.backend.entity.Attendance;
import com.smartroll.backend.entity.Schedule;
import com.smartroll.backend.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ScheduleService scheduleService;

    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    public Optional<Attendance> getAttendanceById(Integer id) {
        return attendanceRepository.findById(id);
    }

    public List<Attendance> getAttendancesByStudentId(Integer studentId) {
        return attendanceRepository.findByStudentId(studentId);
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
        Optional<Attendance> existingAttendance = attendanceRepository.findByStudentIdAndDateAndClassId(
                attendance.getStudentId(), attendance.getDate(), attendance.getClassId());

        if (existingAttendance.isPresent()) {
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
}
