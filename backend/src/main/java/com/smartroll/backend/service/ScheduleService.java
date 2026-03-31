package com.smartroll.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartroll.backend.entity.Schedule;
import com.smartroll.backend.repository.ScheduleRepository;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    public Schedule createSchedule(Long classId, Long subjectId, Long teacherId, LocalDateTime startTime, LocalDateTime endTime, String room) {
        Schedule schedule = new Schedule();
        schedule.setClassId(classId);
        schedule.setSubjectId(subjectId);
        schedule.setTeacherId(teacherId);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setRoom(room);
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Schedule> getSchedulesByTeacherId(Long teacherId) {
        return scheduleRepository.findByTeacherId(teacherId);
    }

    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }
}
