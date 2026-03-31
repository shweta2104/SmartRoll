package com.smartroll.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.ClassEntity;
import com.smartroll.backend.service.ClassEntityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/classes")
public class ClassEntityController {

    @Autowired
    private ClassEntityService classEntityService;

    @GetMapping
    public List<ClassEntity> getAllClasses() {
        return classEntityService.getAllClasses();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalClassesCount() {
        long count = classEntityService.getTotalClassesCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ClassEntity> getClassById(@PathVariable Long id) {
        ClassEntity classEntity = classEntityService.getClassById(id);
        if (classEntity != null) {
            return ResponseEntity.ok(classEntity);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassEntity> createClass(@Valid @RequestBody ClassEntity classEntity) {
        ClassEntity savedClass = classEntityService.saveClass(classEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedClass);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassEntity> updateClass(@PathVariable Long id, @Valid @RequestBody ClassEntity classEntity) {
        ClassEntity updatedClass = classEntityService.updateClass(id, classEntity);
        if (updatedClass != null) {
            return ResponseEntity.ok(updatedClass);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        ClassEntity classEntity = classEntityService.getClassById(id);
        if (classEntity != null) {
            classEntityService.deleteClass(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<ClassEntity> getClassesByTeacherId(@PathVariable Long teacherId) {
        return classEntityService.getClassesByTeacherId(teacherId);
    }
}
