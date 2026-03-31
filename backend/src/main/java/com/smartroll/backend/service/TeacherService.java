package com.smartroll.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.repository.TeacherRepository;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }

    public Optional<Teacher> getTeacherByTeacherId(String teacherId) {
        return teacherRepository.findByTeacherId(teacherId);
    }

    public Optional<Teacher> getTeacherByTeacherIdAndName(String teacherId, String firstName, String lastName) {
        return teacherRepository.findByTeacherIdAndFirstNameAndLastName(teacherId, firstName, lastName);
    }

    public Optional<Teacher> getTeacherByNameIgnoreCase(String firstName, String lastName) {
        return teacherRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(firstName, lastName);
    }

    public Optional<Teacher> getTeacherByEmail(String email) {
        List<Teacher> teachers = teacherRepository.findByEmail(email);
        if (teachers.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(teachers.get(0));
        }
    }

    public Optional<Teacher> getTeacherByUserId(Integer userId) {
        List<Teacher> teachers = teacherRepository.findByUserId(userId);
        if (teachers.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(teachers.get(0));
        }
    }

    public Teacher saveTeacher(Teacher teacher) {
        // Generate teacherId if not provided
        if (teacher.getTeacherId() == null || teacher.getTeacherId().isEmpty()) {
            String generatedTeacherId = generateTeacherId();
            teacher.setTeacherId(generatedTeacherId);
        }
        return teacherRepository.save(teacher);
    }

    private String generateTeacherId() {
        Integer maxNum = teacherRepository.findMaxTeacherIdNumber();
        if (maxNum == null) {
            maxNum = 0;
        }
        return String.format("T%03d", maxNum + 1);
    }

    public void deleteTeacher(Long id) {
        teacherRepository.deleteById(id);
    }

    public long getTotalTeachersCount() {
        return teacherRepository.count();
    }
}
