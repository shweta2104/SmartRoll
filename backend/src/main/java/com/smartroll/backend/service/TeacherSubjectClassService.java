package com.smartroll.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartroll.backend.entity.TeacherSubjectClass;
import com.smartroll.backend.repository.TeacherSubjectClassRepository;

@Service
public class TeacherSubjectClassService {

    @Autowired
    private TeacherSubjectClassRepository repository;

    public List<TeacherSubjectClass> getAllAssignments() {
        return repository.findAllWithDetails();
    }

    public TeacherSubjectClass saveAssignment(TeacherSubjectClass assignment) {
        if (repository.existsByTeacherIdAndSubjectIdAndClassEntityId(
                assignment.getTeacher().getId(),
                assignment.getSubject().getId(),
                assignment.getClassEntity().getId())) {
            throw new RuntimeException("Assignment already exists for this teacher, subject, and class combination");
        }
        return repository.save(assignment);
    }

    public void deleteAssignment(Long id) {
        repository.deleteById(id);
    }

    public List<TeacherSubjectClass> getAssignmentsByTeacher(Long teacherId) {
        return repository.findByTeacherId(teacherId);
    }

    public List<TeacherSubjectClass> getAssignmentsBySubject(Long subjectId) {
        return repository.findBySubjectId(subjectId);
    }

    public List<TeacherSubjectClass> getAssignmentsByClass(Long classId) {
        return repository.findByClassId(classId);
    }
}
