package com.smartroll.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.ClassEntity;

@Repository
public interface ClassEntityRepository extends JpaRepository<ClassEntity, Long> {

    Optional<ClassEntity> findByDivision(String division);

    List<ClassEntity> findByTeacherId(Long teacherId);

    @Query("SELECT c FROM ClassEntity c LEFT JOIN FETCH c.teacher")
    List<ClassEntity> findAllWithTeacher();
}
