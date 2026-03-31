package com.smartroll.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.Teacher;

import com.smartroll.backend.entity.Admin;
import com.smartroll.backend.entity.Schedule;
import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.AdminService;
import com.smartroll.backend.service.ClassEntityService;
import com.smartroll.backend.service.ScheduleService;
import com.smartroll.backend.service.StudentService;
import com.smartroll.backend.service.SubjectService;
import com.smartroll.backend.service.TeacherService;
import com.smartroll.backend.service.UserService;
import com.smartroll.backend.util.JwtUtil;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ClassEntityService classEntityService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest loginRequest) {
        String loginId = loginRequest.getUsername();
        try {
            if (loginId == null || loginId.trim().isEmpty()) {
                logger.warn("Admin login failed: no username provided");
                return ResponseEntity.status(401).body("Username required");
            }
            logger.debug("Admin login attempt for loginId: {}", loginId);

            Optional<User> userOptional = userService.getUserByEmail(loginId);
            if (userOptional.isEmpty()) {
                logger.warn("Admin login failed: user not found for {}", loginId);
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            User user = userOptional.get();
            if (user.getRole() == null || user.getRole() != User.Role.ADMIN) {
                logger.warn("Admin login failed: user {} not ADMIN role", loginId);
                return ResponseEntity.status(401).body("Invalid role for admin login");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginId, loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateToken(user.getEmail(), user.getUserId(), user.getRole().toString());

            logger.info("Admin login successful for userId: {}", user.getUserId());

            return ResponseEntity.ok(new LoginResponse(
                    user.getUserId(),
                    user.getEmail(),
                    user.getUsername(),
                    user.getName(),
                    user.getRole().toString(),
                    token
            ));
        } catch (Exception e) {
            logger.warn("Admin login failed: bad credentials for {}", loginId);
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            Optional<Admin> admin = adminService.getAdminByEmail(email);
            if (admin.isPresent()) {
                return ResponseEntity.ok(admin.get());
            }
            Optional<User> user = userService.getUserByEmail(email);
            return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Admin> getAllAdmins() {
        return adminService.getAllAdmins();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Admin> getAdminById(@PathVariable Integer id) {
        Optional<Admin> admin = adminService.getAdminById(id);
        return admin.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalTeachers", teacherService.getTotalTeachersCount());
        stats.put("totalStudents", studentService.getTotalStudentsCount());
        stats.put("totalClasses", (long) classEntityService.getAllClasses().size());
        stats.put("totalSubjects", subjectService.getTotalSubjectsCount());
        logger.info("Admin dashboard stats: {}", stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        logger.debug("Admin fetching all teachers");
        List<Teacher> teachers = teacherService.getAllTeachers();
        logger.debug("Found {} teachers for admin", teachers.size());
        return ResponseEntity.ok(teachers);
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> createTeacher(@RequestBody Teacher teacher) {
        try {
            logger.debug("Admin creating teacher: {}", teacher.getEmail());
            Teacher savedTeacher = teacherService.saveTeacher(teacher);
            logger.info("Teacher created successfully: id={}, email={}", savedTeacher.getId(), savedTeacher.getEmail());
            return ResponseEntity.ok(savedTeacher);
        } catch (Exception e) {
            logger.error("Error creating teacher: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacherDetails) {
        try {
            logger.debug("Admin updating teacher id: {}", id);
            Optional<Teacher> teacherOptional = teacherService.getTeacherById(id);
            if (teacherOptional.isPresent()) {
                Teacher teacher = teacherOptional.get();
                teacher.setFirstName(teacherDetails.getFirstName());
                teacher.setLastName(teacherDetails.getLastName());
                teacher.setEmail(teacherDetails.getEmail());
                teacher.setPhone(teacherDetails.getPhone());
                teacher.setGender(teacherDetails.getGender());
                teacher.setDept(teacherDetails.getDept());
                teacher.setStatus(teacherDetails.getStatus());
                Teacher savedTeacher = teacherService.saveTeacher(teacher);
                logger.info("Teacher updated successfully: id={}", id);
                return ResponseEntity.ok(savedTeacher);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating teacher id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Schedule> createSchedule(@RequestBody Map<String, String> request) {
        try {
            Long classId = Long.parseLong(request.get("classId"));
            Long subjectId = Long.parseLong(request.get("subjectId"));
            Long teacherId = Long.parseLong(request.get("teacherId"));
            LocalDateTime startTime = LocalDateTime.parse(request.get("startTime"));
            LocalDateTime endTime = LocalDateTime.parse(request.get("endTime"));
            String room = request.get("room");

            Schedule schedule = scheduleService.createSchedule(classId, subjectId, teacherId, startTime, endTime, room);
            return ResponseEntity.ok(schedule);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid ID format: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schedule: " + e.getMessage());
        }
    }
}
