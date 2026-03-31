package com.smartroll.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByStudentId(Integer studentId);

    List<Attendance> findByScheduleId(Long scheduleId);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByClassId(Integer classId);

    Optional<Attendance> findByStudentIdAndDateAndClassId(Integer studentId, LocalDate date, Integer classId);

    // For dashboard analytics
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Attendance> findByClassIdAndDateBetween(Integer classId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT a FROM Attendance a WHERE a.classId IN :classIds AND a.date = :date")
    List<Attendance> findByClassIdInAndDate(@Param("classIds") List<Integer> classIds, @Param("date") LocalDate date);

    // New method to find attendance by scheduleId and date
    List<Attendance> findByScheduleIdAndDate(Long scheduleId, LocalDate date);
}
