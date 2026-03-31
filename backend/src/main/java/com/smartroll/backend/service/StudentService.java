package com.smartroll.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartroll.backend.entity.Student;
import com.smartroll.backend.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll().stream()
                .filter(s -> !"DELETED".equals(s.getStatus()))
                .collect(Collectors.toList());
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByStudentId(Integer studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    public Optional<Student> getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo);
    }

    public Student saveStudent(Student student) {
        // Add validation logic here if needed
        return studentRepository.save(student);
    }

    public boolean existsById(Long id) {
        return studentRepository.existsById(id);
    }

    public void deleteStudent(Long id) {
        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            student.setStatus("DELETED");
            studentRepository.save(student);
        }
    }

    public long getTotalStudentsCount() {
        return studentRepository.count();
    }

    public List<Student> getStudentsByClassId(Long classId) {
        return studentRepository.findByClassId(classId).stream()
                .filter(s -> !"DELETED".equals(s.getStatus()))
                .collect(Collectors.toList());
    }
}
