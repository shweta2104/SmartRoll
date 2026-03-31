package com.smartroll.backend.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.Subject;
import com.smartroll.backend.repository.SubjectRepository;
import com.smartroll.backend.service.SubjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private static final Logger logger = LoggerFactory.getLogger(SubjectController.class);

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public List<Subject> getAllSubjects() {
        logger.debug("Fetching all subjects");
        List<Subject> subjects = subjectService.getAllSubjects();
        logger.debug("Found {} subjects", subjects.size());
        return subjects;
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalSubjectsCount() {
        long count = subjectService.getTotalSubjectsCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        Optional<Subject> subject = subjectService.getSubjectById(id);
        return subject.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Subject createSubject(@RequestBody @Valid Subject subject) {
        if (subjectRepository.findByCode(subject.getCode()).isPresent()) {
            throw new IllegalArgumentException("Subject code already exists");
        }
        return subjectService.saveSubject(subject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subjectDetails) {
        Optional<Subject> subjectOptional = subjectService.getSubjectById(id);
        if (subjectOptional.isPresent()) {
            Subject subject = subjectOptional.get();
            subject.setCode(subjectDetails.getCode());
            subject.setName(subjectDetails.getName());
            subject.setDescription(subjectDetails.getDescription());
            subject.setStatus(subjectDetails.getStatus());
            return ResponseEntity.ok(subjectService.saveSubject(subject));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        if (subjectService.getSubjectById(id).isPresent()) {
            subjectService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
