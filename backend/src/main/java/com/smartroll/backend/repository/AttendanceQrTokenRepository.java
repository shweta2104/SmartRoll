package com.smartroll.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.AttendanceQrToken;

@Repository
public interface AttendanceQrTokenRepository extends JpaRepository<AttendanceQrToken, Long> {

    // tokenValue should be unique; however in DB duplicates exist, so avoid failing with
    // "Query did not return a unique result".
    List<AttendanceQrToken> findByTokenValue(String tokenValue);


    List<AttendanceQrToken> findByScheduleIdAndDate(Long scheduleId, LocalDate date);

    List<AttendanceQrToken> findByScheduleIdAndDateAndActiveTrue(Long scheduleId, LocalDate date);

    Optional<AttendanceQrToken> findTopByDateAndActiveTrueOrderByCreatedAtDesc(LocalDate date);
}


