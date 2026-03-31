package com.smartroll.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.entity.TeacherSubjectClass;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.TeacherService;
import com.smartroll.backend.service.TeacherSubjectClassService;
import com.smartroll.backend.service.UserService;

@RestController
@RequestMapping("/api/teacher-subject-class")
@CrossOrigin(origins = "http://localhost:5173")
public class TeacherSubjectClassController {

    @Autowired
    private TeacherSubjectClassService service;

    @Autowired
    private UserService userService;

    @Autowired
    private TeacherService teacherService;

    @GetMapping
    public ResponseEntity<List<TeacherSubjectClass>> getAllAssignments() {
        List<TeacherSubjectClass> assignments = service.getAllAssignments();
        return ResponseEntity.ok(assignments);
    }

    @PostMapping
    public ResponseEntity<TeacherSubjectClass> createAssignment(@RequestBody TeacherSubjectClass assignment) {
        try {
            TeacherSubjectClass savedAssignment = service.saveAssignment(assignment);
            return ResponseEntity.ok(savedAssignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherSubjectClass> updateAssignment(@PathVariable Long id, @RequestBody TeacherSubjectClass assignment) {
        try {
            assignment.setId(id);
            TeacherSubjectClass updatedAssignment = service.saveAssignment(assignment);
            return ResponseEntity.ok(updatedAssignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        service.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<TeacherSubjectClass>> getAssignmentsByUser(@PathVariable Integer userId) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(403).build();
        }
        String email = authentication.getName();
        Optional<User> authenticatedUser = userService.getUserByEmail(email);
        if (authenticatedUser.isEmpty()) {
            return ResponseEntity.status(403).build();
        }
        User authUser = authenticatedUser.get();

        // Check if the authenticated user is admin or the user themselves
        if (authUser.getRole() != User.Role.ADMIN && !authUser.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        // Find the teacher by userId
        Optional<Teacher> teacher = teacherService.getTeacherByUserId(userId);
        if (teacher.isEmpty()) {
            return ResponseEntity.ok(List.of()); // No assignments if no teacher record
        }

        List<TeacherSubjectClass> assignments = service.getAssignmentsByTeacher(teacher.get().getId());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TeacherSubjectClass>> getAssignmentsBySubject(@PathVariable Long subjectId) {
        List<TeacherSubjectClass> assignments = service.getAssignmentsBySubject(subjectId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<TeacherSubjectClass>> getAssignmentsByClass(@PathVariable Long classId) {
        List<TeacherSubjectClass> assignments = service.getAssignmentsByClass(classId);
        return ResponseEntity.ok(assignments);
    }
}
