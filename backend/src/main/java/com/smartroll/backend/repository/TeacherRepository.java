package com.smartroll.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.Teacher;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByTeacherId(String teacherId);

    List<Teacher> findByEmail(String email);

    List<Teacher> findByUserId(Integer userId);

    @Query("SELECT MAX(CAST(SUBSTRING(t.teacherId, 2) AS int)) FROM Teacher t WHERE t.teacherId LIKE 'T%'")
    Integer findMaxTeacherIdNumber();

    @Query("SELECT t.teacherId FROM Teacher t WHERE t.teacherId LIKE 'T%'")
    List<String> findAllTeacherIds();

    Optional<Teacher> findByTeacherIdAndFirstNameAndLastName(String teacherId, String firstName, String lastName);

    @Query("SELECT t FROM Teacher t WHERE LOWER(TRIM(t.firstName)) = LOWER(TRIM(:firstName)) AND LOWER(TRIM(t.lastName)) = LOWER(TRIM(:lastName))")
    Optional<Teacher> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
}
