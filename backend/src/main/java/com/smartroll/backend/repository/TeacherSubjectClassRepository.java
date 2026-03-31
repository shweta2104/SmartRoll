package com.smartroll.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.TeacherSubjectClass;

@Repository
public interface TeacherSubjectClassRepository extends JpaRepository<TeacherSubjectClass, Long> {

    @Query("SELECT tsc FROM TeacherSubjectClass tsc JOIN FETCH tsc.teacher JOIN FETCH tsc.subject JOIN FETCH tsc.classEntity")
    List<TeacherSubjectClass> findAllWithDetails();

    @Query("SELECT tsc FROM TeacherSubjectClass tsc JOIN FETCH tsc.subject JOIN FETCH tsc.classEntity WHERE tsc.teacher.id = :teacherId")
    List<TeacherSubjectClass> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT tsc FROM TeacherSubjectClass tsc WHERE tsc.subject.id = :subjectId")
    List<TeacherSubjectClass> findBySubjectId(@Param("subjectId") Long subjectId);

    @Query("SELECT tsc FROM TeacherSubjectClass tsc WHERE tsc.classEntity.id = :classId")
    List<TeacherSubjectClass> findByClassId(@Param("classId") Long classId);

    @Modifying
    @Query("DELETE FROM TeacherSubjectClass tsc WHERE tsc.classEntity.id = :classId")
    void deleteByClassId(@Param("classId") Long classId);

    boolean existsByTeacherIdAndSubjectIdAndClassEntityId(Long teacherId, Long subjectId, Long classId);
}
