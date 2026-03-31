package com.smartroll.backend.controller;

import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RestController;

import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.TeacherService;
import com.smartroll.backend.service.UserService;
import com.smartroll.backend.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@RequestBody @Valid User user) {
        return userService.saveUser(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setUsername(userDetails.getUsername());
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setPassword(userDetails.getPassword());
            user.setRole(userDetails.getRole());
            user.setUpdatedAt(java.time.LocalDateTime.now());
            return ResponseEntity.ok(userService.saveUser(user));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        if (userService.getUserById(id).isPresent()) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/encode-passwords")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> encodeExistingPasswords() {
        try {
            userService.encodeExistingPasswords();
            return ResponseEntity.ok("Passwords encoded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error encoding passwords: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> login(@RequestBody User loginRequest, HttpServletRequest request) {
        try {
            // First, find the user by email
            Optional<User> userOptional;
            try {
                userOptional = userService.getUserByEmail(loginRequest.getEmail());
            } catch (Exception e) {
                // Handle case where user data is invalid (e.g., invalid role enum)
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            User user = userOptional.get();

            // Check if the role matches (compare enums safely)
            if (user.getRole() == null || loginRequest.getRole() == null || user.getRole() != loginRequest.getRole()) {
                return ResponseEntity.status(401).body("Invalid role");
            }

            // Authenticate using email as username
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getUserId(), user.getRole().toString());

            // Return user data with JWT token
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
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            String email = authentication.getName();
            Optional<User> user = userService.getUserByEmail(email);
            return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/register")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<String> register(@RequestBody @Valid User userRequest) {
        try {
            // Only allow registration for TEACHER and STUDENT roles
            if (userRequest.getRole() != User.Role.TEACHER && userRequest.getRole() != User.Role.STUDENT) {
                return ResponseEntity.status(400).body("Only TEACHER and STUDENT roles can register");
            }

            // Check if user already exists
            if (userService.getUserByEmail(userRequest.getEmail()).isPresent()) {
                return ResponseEntity.status(400).body("User with this email already exists");
            }

            // Set default values
            userRequest.setCreatedAt(java.time.LocalDateTime.now());

            // Save the user (password will be encoded in UserService.saveUser)
            User savedUser = userService.saveUser(userRequest);

            // If the user is a teacher, create a teacher record
            if (savedUser.getRole() == User.Role.TEACHER) {
                Teacher teacher = new Teacher();
                teacher.setUserId(savedUser.getUserId());
                String fullName = savedUser.getName();
                if (fullName != null && !fullName.trim().isEmpty()) {
                    String[] parts = fullName.trim().split("\\s+", 2);
                    teacher.setFirstName(parts[0]);
                    teacher.setLastName(parts.length > 1 ? parts[1] : "N/A");
                } else {
                    teacher.setFirstName("Unknown");
                    teacher.setLastName("N/A");
                }
                teacher.setEmail(savedUser.getEmail());
                teacherService.saveTeacher(teacher);
            }

            return ResponseEntity.ok("Registration successful");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
}
