package com.smartroll.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.controller.LoginResponse;
import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.EmailService;
import com.smartroll.backend.service.TeacherService;
import com.smartroll.backend.service.UserService;
import com.smartroll.backend.util.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "http://localhost:5173")
public class TeacherController {

    @Autowired
    private EmailService emailService;

    private static final Logger logger = LoggerFactory.getLogger(TeacherController.class);

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/public/teacher")
    public ResponseEntity<Map<String, String>> getTeacherEmail(@RequestParam(required = false) String teacherId,
            @RequestParam String firstName,
            @RequestParam String lastName) {
        Optional<Teacher> teacher;
        if (teacherId != null && !teacherId.trim().isEmpty()) {
            teacher = teacherService.getTeacherByTeacherIdAndName(teacherId, firstName, lastName);
        } else {
            teacher = teacherService.getTeacherByNameIgnoreCase(firstName, lastName);
        }
        if (teacher.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("email", teacher.get().getEmail());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public List<Teacher> getAllTeachers() {
        logger.debug("Fetching all teachers");
        List<Teacher> teachers = teacherService.getAllTeachers();
        logger.debug("Found {} teachers", teachers.size());
        return teachers;
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalTeachersCount() {
        long count = teacherService.getTotalTeachersCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        Optional<Teacher> teacher = teacherService.getTeacherById(id);
        return teacher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/teacherId/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> getTeacherByTeacherId(@PathVariable String teacherId) {
        Optional<Teacher> teacher = teacherService.getTeacherByTeacherId(teacherId);
        return teacher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> getTeacherByEmail(@PathVariable String email) {
        Optional<Teacher> teacher = teacherService.getTeacherByEmail(email);
        return teacher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/userId/{userId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Teacher> getTeacherByUserId(@PathVariable Integer userId) {
        try {
            logger.debug("Fetching teacher for userId: {}", userId);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
                logger.warn("User not authenticated for userId: {}", userId);
                return ResponseEntity.status(403).build();
            }
            String email = authentication.getName();
            logger.debug("Authenticated user email: {}", email);

            Optional<User> authenticatedUser = userService.getUserByEmail(email);
            if (authenticatedUser.isEmpty()) {
                logger.warn("Authenticated user not found: {}", email);
                return ResponseEntity.status(403).build();
            }
            User authUser = authenticatedUser.get();

            if (authUser.getRole() != User.Role.ADMIN && !authUser.getUserId().equals(userId)) {
                logger.warn("User {} unauthorized to access teacher {}", authUser.getUserId(), userId);
                return ResponseEntity.status(403).build();
            }

            Optional<Teacher> teacher = teacherService.getTeacherByUserId(userId);
            if (teacher.isPresent()) {
                logger.debug("Teacher found: {}", teacher.get().getId());
                return ResponseEntity.ok(teacher.get());
            } else {
                logger.debug("Teacher not found, checking if user exists and is TEACHER role");
                Optional<User> user = userService.getUserById(userId);
                if (user.isPresent() && user.get().getRole() == User.Role.TEACHER) {
                    logger.debug("User found: {}, name: {}, email: {}", user.get().getUserId(), user.get().getName(), user.get().getEmail());
                    Optional<Teacher> existingTeacherOpt = teacherService.getTeacherByEmail(user.get().getEmail());
                    if (existingTeacherOpt.isPresent() && existingTeacherOpt.get().getUserId() == null) {
                        logger.debug("Updating existing teacher record with userId: {}", userId);
                        Teacher existingTeacherObj = existingTeacherOpt.get();
                        existingTeacherObj.setUserId(userId);
                        String fullName = user.get().getName();
                        if (fullName != null && !fullName.trim().isEmpty()) {
                            String[] parts = fullName.trim().split("\\s+", 2);
                            existingTeacherObj.setFirstName(parts[0]);
                            existingTeacherObj.setLastName(parts.length > 1 ? parts[1] : "N/A");
                        } else {
                            existingTeacherObj.setFirstName("Unknown");
                            existingTeacherObj.setLastName("N/A");
                        }
                        logger.debug("Saving updated teacher: firstName={}, lastName={}, email={}", existingTeacherObj.getFirstName(), existingTeacherObj.getLastName(), existingTeacherObj.getEmail());
                        Teacher savedTeacher = teacherService.saveTeacher(existingTeacherObj);
                        logger.debug("Teacher updated with id: {}", savedTeacher.getId());
                        return ResponseEntity.ok(savedTeacher);
                    } else {
                        logger.debug("Creating new teacher record for userId: {}", userId);
                        Teacher newTeacher = new Teacher();
                        newTeacher.setUserId(userId);
                        String fullName = user.get().getName();
                        if (fullName != null && !fullName.trim().isEmpty()) {
                            String[] parts = fullName.trim().split("\\s+", 2);
                            newTeacher.setFirstName(parts[0]);
                            newTeacher.setLastName(parts.length > 1 ? parts[1] : "N/A");
                        } else {
                            newTeacher.setFirstName("Unknown");
                            newTeacher.setLastName("N/A");
                        }
                        newTeacher.setEmail(user.get().getEmail());
                        logger.debug("Saving new teacher: firstName={}, lastName={}, email={}", newTeacher.getFirstName(), newTeacher.getLastName(), newTeacher.getEmail());
                        Teacher savedTeacher = teacherService.saveTeacher(newTeacher);
                        logger.debug("New teacher created with id: {}", savedTeacher.getId());
                        return ResponseEntity.ok(savedTeacher);
                    }
                } else {
                    logger.warn("User {} not found or not a teacher", userId);
                    return ResponseEntity.notFound().build();
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching teacher for userId: {}", userId, e);
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    static class TeacherRegisterRequest {

        private String email;
        private String password;

        // Default constructor
        public TeacherRegisterRequest() {
        }

        public TeacherRegisterRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        // Getters and setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerTeacher(@RequestBody TeacherRegisterRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            logger.debug("Teacher registration for email: {}", request.getEmail());

            // Check if Teacher record exists without userId (admin pre-created)
            Optional<Teacher> teacherOpt = teacherService.getTeacherByEmail(request.getEmail());
            if (teacherOpt.isEmpty()) {
                response.put("error", "Email not recognized. Contact admin for approval.");
                return ResponseEntity.badRequest().body(response);
            }
            Teacher teacher = teacherOpt.get();
            if (teacher.getUserId() != null) {
                response.put("error", "Account already registered.");
                return ResponseEntity.badRequest().body(response);
            }

            // Create User for authentication
            User user = new User();
            user.setEmail(request.getEmail());
            user.setUsername(request.getEmail()); // Use email as username
            user.setPassword(request.getPassword());
            user.setRole(User.Role.TEACHER);
            user.setName(teacher.getFirstName() + " " + teacher.getLastName()); // Use teacher name
            User savedUser = userService.saveUser(user);

            // Link to teacher
            teacher.setUserId(savedUser.getUserId());
            teacherService.saveTeacher(teacher);

            logger.info("Teacher registered successfully: email={}, userId={}", request.getEmail(), savedUser.getUserId());

            // Send welcome email (non-blocking)
            try {
                emailService.sendTeacherWelcomeEmail(
                        teacher.getEmail(),
                        teacher.getFirstName() + " " + teacher.getLastName(),
                        "http://localhost:5173"
                );
                logger.info("Welcome email sent to {}", teacher.getEmail());
            } catch (Exception emailEx) {
                logger.warn("Failed to send welcome email to {}: {}", teacher.getEmail(), emailEx.getMessage());
            }

            response.put("message", "Registration successful! You can login now.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Teacher registration error for {}: {}", request.getEmail(), e.getMessage());
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> createTeacher(@RequestBody @Valid Teacher teacher) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            logger.debug("POST /api/teachers called by user: {}, roles: {}", auth.getName(), auth.getAuthorities());
            Teacher savedTeacher = teacherService.saveTeacher(teacher);
            return ResponseEntity.ok(savedTeacher);
        } catch (Exception e) {
            logger.error("Error saving teacher", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacherDetails) {
        Optional<Teacher> teacherOptional = teacherService.getTeacherById(id);
        if (teacherOptional.isPresent()) {
            Teacher teacher = teacherOptional.get();
            teacher.setTeacherId(teacherDetails.getTeacherId());
            teacher.setFirstName(teacherDetails.getFirstName());
            teacher.setLastName(teacherDetails.getLastName());
            teacher.setEmail(teacherDetails.getEmail());
            teacher.setDept(teacherDetails.getDept());
            teacher.setPhone(teacherDetails.getPhone());
            teacher.setStatus(teacherDetails.getStatus());
            teacher.setCreatedAt(teacherDetails.getCreatedAt());
            return ResponseEntity.ok(teacherService.saveTeacher(teacher));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        if (teacherService.getTeacherById(id).isPresent()) {
            teacherService.deleteTeacher(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            Optional<User> userOptional = userService.getUserByEmail(loginRequest.getEmail());
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            User user = userOptional.get();
            if (user.getRole() != User.Role.TEACHER) {
                return ResponseEntity.status(401).body("Invalid role for teacher login");
            }
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtil.generateToken(user.getEmail(), user.getUserId(), user.getRole().toString());
            return ResponseEntity.ok(new LoginResponse(
                    user.getUserId(),
                    user.getEmail(),
                    user.getUsername(),
                    user.getName(),
                    user.getRole().toString(),
                    token
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
}
