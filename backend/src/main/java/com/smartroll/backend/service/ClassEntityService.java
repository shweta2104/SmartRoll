package com.smartroll.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartroll.backend.entity.ClassEntity;
import com.smartroll.backend.entity.TeacherSubjectClass;
import com.smartroll.backend.repository.ClassEntityRepository;
import com.smartroll.backend.repository.TeacherSubjectClassRepository;

@Service
public class ClassEntityService {

    @Autowired
    private ClassEntityRepository classEntityRepository;

    @Autowired
    private TeacherSubjectClassRepository teacherSubjectClassRepository;

    public List<ClassEntity> getAllClasses() {
        return classEntityRepository.findAll();
    }

    public ClassEntity getClassById(Long id) {
        return classEntityRepository.findById(id).orElse(null);
    }

    public ClassEntity saveClass(ClassEntity classEntity) {
        return classEntityRepository.save(classEntity);
    }

    public ClassEntity updateClass(Long id, ClassEntity classEntity) {
        if (classEntityRepository.existsById(id)) {
            classEntity.setId(id);
            return classEntityRepository.save(classEntity);
        }
        return null;
    }

    @Transactional
    public void deleteClass(Long id) {
        // First, delete all assignments for this class
        teacherSubjectClassRepository.deleteByClassId(id);
        // Then delete the class
        classEntityRepository.deleteById(id);
    }

    public long getTotalClassesCount() {
        return classEntityRepository.count();
    }

    public List<ClassEntity> getClassesByTeacherId(Long teacherId) {
        List<TeacherSubjectClass> assignments = teacherSubjectClassRepository.findByTeacherId(teacherId);
        List<ClassEntity> classes = assignments.stream()
                .map(TeacherSubjectClass::getClassEntity)
                .distinct()
                .collect(Collectors.toList());
        System.out.println("Classes for teacher " + teacherId + " via assignments: " + classes.size());
        return classes;
    }
}
