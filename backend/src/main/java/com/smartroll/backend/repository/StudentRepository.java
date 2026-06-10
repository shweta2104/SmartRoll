package com.smartroll.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(Integer studentId);

    Optional<Student> findByUserId(Integer userId);

    Optional<Student> findByRollNo(String rollNo);

    Optional<Student> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    Optional<Student> findByEmail(String email);

    List<Student> findByClassId(Long classId);

    List<Student> findByStatusNot(String status);

}

