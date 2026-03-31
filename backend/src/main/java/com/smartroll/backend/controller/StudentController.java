package com.smartroll.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.smartroll.backend.entity.Student;
import com.smartroll.backend.service.StudentService;

import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.smartroll.backend.controller.LoginResponse;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.UserService;
import com.smartroll.backend.util.JwtUtil;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentService.getStudentById(id);
        return student.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/studentId/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<Student> getStudentByStudentId(@PathVariable Integer studentId) {
        Optional<Student> student = studentService.getStudentByStudentId(studentId);
        return student.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/rollNo/{rollNo}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<Student> getStudentByRollNo(@PathVariable String rollNo) {
        Optional<Student> student = studentService.getStudentByRollNo(rollNo);
        return student.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public Student createStudent(@RequestBody @Valid Student student) {
        return studentService.saveStudent(student);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody @Valid Student studentDetails) {
        Optional<Student> studentOptional = studentService.getStudentById(id);
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            student.setStudentId(studentDetails.getStudentId());
            student.setUserId(studentDetails.getUserId());
            student.setRollNo(studentDetails.getRollNo());
            student.setClassId(studentDetails.getClassId());
            student.setFirstName(studentDetails.getFirstName());
            student.setLastName(studentDetails.getLastName());
            student.setEmail(studentDetails.getEmail());
            student.setPhone(studentDetails.getPhone());
            student.setGender(studentDetails.getGender());
            student.setSem(studentDetails.getSem());
            student.setDept(studentDetails.getDept());
            student.setStatus(studentDetails.getStatus());
            return ResponseEntity.ok(studentService.saveStudent(student));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        try {
            if (studentService.existsById(id)) {
                studentService.deleteStudent(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(409).build(); // Conflict - e.g. FK constraint
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalStudentsCount() {
        long count = studentService.getTotalStudentsCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public List<Student> getStudentsByClassId(@PathVariable Long classId) {
        return studentService.getStudentsByClassId(classId);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            Optional<User> userOptional = userService.getUserByEmail(loginRequest.getEmail());
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            User user = userOptional.get();
            if (user.getRole() != User.Role.STUDENT) {
                return ResponseEntity.status(401).body("Invalid role for student login");
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

    static class StudentRegisterRequest {

        private String name;
        private String email;
        private String password;
        private String rollNo;

        // constructors, getters, setters
        public StudentRegisterRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

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

        public String getRollNo() {
            return rollNo;
        }

        public void setRollNo(String rollNo) {
            this.rollNo = rollNo;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody StudentRegisterRequest request) {
        try {
            if (userService.getUserByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(400).body("User with this email already exists");
            }
            User user = new User();
            user.setEmail(request.getEmail());
            user.setUsername(request.getEmail());
            user.setPassword(request.getPassword());
            user.setName(request.getName());
            user.setRole(User.Role.STUDENT);
            user.setCreatedAt(java.time.LocalDateTime.now());
            User savedUser = userService.saveUser(user);

            Student student = new Student();
            student.setUserId(savedUser.getUserId());
            student.setRollNo(request.getRollNo());
            student.setFirstName(request.getName().split(" ")[0]);
            student.setLastName(request.getName().split(" ").length > 1 ? request.getName().split(" ")[1] : "N/A");
            student.setEmail(savedUser.getEmail());
            studentService.saveStudent(student);

            return ResponseEntity.ok("Registration successful");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
}
