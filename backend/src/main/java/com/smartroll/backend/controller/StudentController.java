package com.smartroll.backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import com.smartroll.backend.entity.Schedule;
import com.smartroll.backend.entity.Student;
import com.smartroll.backend.entity.Subject;
import com.smartroll.backend.entity.Teacher;
import com.smartroll.backend.entity.User;
import com.smartroll.backend.service.AttendanceService;
import com.smartroll.backend.service.ClassEntityService;
import com.smartroll.backend.service.ScheduleService;
import com.smartroll.backend.service.StudentService;
import com.smartroll.backend.service.SubjectService;
import com.smartroll.backend.dto.StudentPastLectureDto;

import com.smartroll.backend.service.TeacherService;
import com.smartroll.backend.service.TeacherSubjectClassService;
import com.smartroll.backend.service.UserService;
import com.smartroll.backend.util.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    @Autowired
    private StudentService studentService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ClassEntityService classEntityService;

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private TeacherSubjectClassService teacherSubjectClassService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private AttendanceService attendanceService;

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
            logger.error("Error while deleting student", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTotalStudentsCount() {
        try {
            long count = studentService.getTotalStudentsCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Failed to get total students count", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/public/student")
    public ResponseEntity<Map<String, String>> getStudentEmail(
            @RequestParam String firstName,
            @RequestParam String lastName) {
        Optional<Student> student = studentService.getStudentByNameIgnoreCase(firstName, lastName);
        if (student.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("email", student.get().getEmail());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> getStudentsByClassId(@PathVariable Long classId) {
        try {
            List<Student> students = studentService.getStudentsByClassId(classId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            logger.error("Error fetching students for class {}: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching students: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponse> getCurrentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;

        if (principal instanceof Integer) {
            userId = (Integer) principal;
        } else {
            // JwtFilter sets Authentication principal as email (String)
            String email = authentication.getName();
            if (email != null) {
                Optional<Student> studentOpt = studentService.getStudentByEmail(email);
                if (studentOpt.isEmpty()) {
                    return ResponseEntity.notFound().build();
                }
                Student s = studentOpt.get();
                return ResponseEntity.ok(
                        new StudentProfileResponse(
                                s.getStudentId(),
                                s.getFirstName() + " " + s.getLastName(),
                                s.getEmail(),
                                s.getPhone()
                        )
                );
            }
        }

        if (userId == null) {
            return ResponseEntity.status(400).build();
        }

        Optional<Student> studentOpt = studentService.getStudentByUserId(userId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student s = studentOpt.get();
        return ResponseEntity.ok(
                new StudentProfileResponse(
                        s.getStudentId(),
                        s.getFirstName() + " " + s.getLastName(),
                        s.getEmail(),
                        s.getPhone()
                )
        );
    }

    public static class StudentSubjectResponse {
        private Long subjectId;
        private String subjectName;
        private String subjectCode;
        private String teacherName;

        public StudentSubjectResponse() {}

        public StudentSubjectResponse(Long subjectId, String subjectName, String subjectCode, String teacherName) {
            this.subjectId = subjectId;
            this.subjectName = subjectName;
            this.subjectCode = subjectCode;
            this.teacherName = teacherName;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public String getSubjectCode() {
            return subjectCode;
        }

        public void setSubjectCode(String subjectCode) {
            this.subjectCode = subjectCode;
        }

        public String getTeacherName() {
            return teacherName;
        }

        public void setTeacherName(String teacherName) {
            this.teacherName = teacherName;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof StudentSubjectResponse that)) return false;
            return subjectId != null && subjectId.equals(that.subjectId);
        }

        @Override
        public int hashCode() {
            return subjectId != null ? subjectId.hashCode() : 0;
        }
    }

    public static class StudentClassResponse {

        private Long classId;
        private String classCode;
        private String division;
        private String sem;

        // Enriched fields (for StudentClasses UI)
        private String teacherName;
        private Integer totalSubjects;
        private String nextLectureSubject;
        private String nextLectureSubjectCode;
        private String nextLectureTime;
        private String classTiming;
        private String nextLectureRoom;

        public StudentClassResponse() {
        }

        public StudentClassResponse(Long classId, String classCode, String division, String sem) {
            this.classId = classId;
            this.classCode = classCode;
            this.division = division;
            this.sem = sem;
        }

        public Long getClassId() {
            return classId;
        }

        public void setClassId(Long classId) {
            this.classId = classId;
        }

        public String getClassCode() {
            return classCode;
        }

        public void setClassCode(String classCode) {
            this.classCode = classCode;
        }

        public String getDivision() {
            return division;
        }

        public void setDivision(String division) {
            this.division = division;
        }

        public String getSem() {
            return sem;
        }

        public void setSem(String sem) {
            this.sem = sem;
        }

        public String getTeacherName() {
            return teacherName;
        }

        public void setTeacherName(String teacherName) {
            this.teacherName = teacherName;
        }

        public Integer getTotalSubjects() {
            return totalSubjects;
        }

        public void setTotalSubjects(Integer totalSubjects) {
            this.totalSubjects = totalSubjects;
        }

        public String getNextLectureSubject() {
            return nextLectureSubject;
        }

        public void setNextLectureSubject(String nextLectureSubject) {
            this.nextLectureSubject = nextLectureSubject;
        }

        public String getNextLectureSubjectCode() {
            return nextLectureSubjectCode;
        }

        public void setNextLectureSubjectCode(String nextLectureSubjectCode) {
            this.nextLectureSubjectCode = nextLectureSubjectCode;
        }

        public String getNextLectureTime() {
            return nextLectureTime;
        }

        public void setNextLectureTime(String nextLectureTime) {
            this.nextLectureTime = nextLectureTime;
        }

        public String getClassTiming() {
            return classTiming;
        }

        public void setClassTiming(String classTiming) {
            this.classTiming = classTiming;
        }

        public String getNextLectureRoom() {
            return nextLectureRoom;
        }

        public void setNextLectureRoom(String nextLectureRoom) {
            this.nextLectureRoom = nextLectureRoom;
        }
    }

    @GetMapping("/me/classes")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyClasses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;
        String email = null;

        if (principal instanceof Integer) {
            userId = (Integer) principal;
        } else {
            // JwtFilter sets Authentication principal as email (String)
            email = authentication.getName();
        }

        Optional<Student> studentOpt;
        if (userId != null) {
            studentOpt = studentService.getStudentByUserId(userId);
        } else if (email != null) {
            studentOpt = studentService.getStudentByEmail(email);
        } else {
            return ResponseEntity.status(400).build();
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        if (student.getClassId() == null) {
            return ResponseEntity.ok(List.of());
        }

        Long classId = student.getClassId().longValue();

        // Load class
        var classEntity = classEntityService.getClassById(classId);
        if (classEntity == null) {
            return ResponseEntity.notFound().build();
        }

        // Fetch schedules for this class
        var classSchedules = scheduleService.getSchedulesByClassId(classId);

        // Compute class timing: earliest start time and latest end time
        String classTiming = null;
        if (!classSchedules.isEmpty()) {

            LocalDateTime earliestStart = classSchedules.stream()
                    .map(Schedule::getStartTime)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);
            LocalDateTime latestEnd = classSchedules.stream()
                    .map(Schedule::getEndTime)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            if (earliestStart != null && latestEnd != null) {
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
                String startStr = earliestStart.format(timeFormatter);
                String endStr = latestEnd.format(timeFormatter);
                classTiming = startStr + " – " + endStr;
            }
        }

        // Compute next lecture: find the earliest upcoming schedule
        String nextLectureSubject = null;
        String nextLectureSubjectCode = null;
        String nextLectureTime = null;
        String teacherName = null;
        String nextLectureRoom = null;

        logger.info("Total schedules for classId {}: {}", classId, classSchedules.size());

        LocalDateTime now = LocalDateTime.now();
        var upcomingSchedules = classSchedules.stream()
                .filter(s -> s.getStartTime().isAfter(now))
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .toList();

        logger.info("Upcoming schedules count: {}", upcomingSchedules.size());

        Schedule nextSchedule = null;

        // If no upcoming schedules, use the most recent one
        if (!upcomingSchedules.isEmpty()) {
            nextSchedule = upcomingSchedules.get(0);
        } else if (!classSchedules.isEmpty()) {
            logger.warn("No upcoming schedules. Using most recent schedule instead.");
            nextSchedule = classSchedules.stream()
                    .max((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                    .orElse(null);
        }

        if (nextSchedule != null) {
            logger.info("Next schedule - teacherId: {}, subjectId: {}, startTime: {}",
                    nextSchedule.getTeacherId(), nextSchedule.getSubjectId(), nextSchedule.getStartTime());

            // Fetch teacher name from the teacher service
            if (nextSchedule.getTeacherId() != null) {
                logger.info("Fetching teacher with id: {}", nextSchedule.getTeacherId());
                var teacherOpt = teacherService.getTeacherById(nextSchedule.getTeacherId());
                if (teacherOpt.isPresent()) {
                    teacherName = teacherOpt.get().getName();
                    logger.info("Teacher found: {}", teacherName);
                } else {
                    logger.warn("Teacher not found for id: {}", nextSchedule.getTeacherId());
                }
            } else {
                logger.warn("Teacher ID is null for next schedule");
            }

            // Get subject name + code
            if (nextSchedule.getSubjectId() != null) {
                logger.info("Fetching subject with id: {}", nextSchedule.getSubjectId());
                var subject = subjectService.getSubjectById(nextSchedule.getSubjectId());
                if (subject.isPresent()) {
                    nextLectureSubject = subject.get().getName();
                    nextLectureSubjectCode = subject.get().getCode();
                    logger.info("Subject found - name: {}, code: {}", nextLectureSubject, nextLectureSubjectCode);
                } else {
                    logger.warn("Subject not found for id: {}", nextSchedule.getSubjectId());
                }
            } else {
                logger.warn("Subject ID is null for next schedule");
            }

            // Format time as "h:mm a"
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
            nextLectureTime = nextSchedule.getStartTime().format(timeFormatter);
            logger.info("Next lecture time: {}", nextLectureTime);

            // Get room number
            nextLectureRoom = nextSchedule.getRoom();
            if (nextLectureRoom != null) {
                logger.info("Next lecture room: {}", nextLectureRoom);
            }
        } else {
            logger.warn("No schedules found for classId: {}", classId);
        }
        // Count total subjects assigned to this class
        var assignments = teacherSubjectClassService.getAssignmentsByClass(classId);
        Set<Long> subjectIds = new HashSet<>();
        for (var assignment : assignments) {
            subjectIds.add(assignment.getSubject().getId());
        }
        Integer totalSubjects = subjectIds.size();
        StudentClassResponse resp = new StudentClassResponse(
                classEntity.getId(),
                classEntity.getClassCode(),
                classEntity.getDivision(),
                classEntity.getSem()
        );
        resp.setTeacherName(teacherName);
        resp.setTotalSubjects(totalSubjects);
        resp.setNextLectureSubject(nextLectureSubject);
        resp.setNextLectureSubjectCode(nextLectureSubjectCode);
        resp.setNextLectureTime(nextLectureTime);
        resp.setClassTiming(classTiming);
        resp.setNextLectureRoom(nextLectureRoom);

        return ResponseEntity.ok(List.of(resp));
    }

    @GetMapping("/me/subjects")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentSubjectResponse>> getMySubjects() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;
        String email = null;

        if (principal instanceof Integer) {
            userId = (Integer) principal;
        } else {
            // JwtFilter sets Authentication principal as email (String)
            email = authentication.getName();
        }

        Optional<Student> studentOpt;
        if (userId != null) {
            studentOpt = studentService.getStudentByUserId(userId);
        } else if (email != null) {
            studentOpt = studentService.getStudentByEmail(email);
        } else {
            return ResponseEntity.status(400).build();
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        if (student.getClassId() == null) {
            return ResponseEntity.ok(List.of());
        }

        Long classId = student.getClassId().longValue();
        var assignments = teacherSubjectClassService.getAssignmentsByClass(classId);

        // Map to DTO (subject name/code + teacher name)
        List<StudentSubjectResponse> resp = assignments.stream()
                .map(a -> {
                    String teacherName = null;
                    if (a.getTeacher() != null) {
                        // Teacher entity exposes getName() used elsewhere in this controller
                        teacherName = a.getTeacher().getName();
                    }

                    String subjectName = a.getSubject() != null ? a.getSubject().getName() : null;
                    String subjectCode = a.getSubject() != null ? a.getSubject().getCode() : null;

                    return new StudentSubjectResponse(
                            a.getSubject() != null ? a.getSubject().getId() : null,
                            subjectName,
                            subjectCode,
                            teacherName
                    );
                })
                // Avoid duplicates if multiple teachers map to same subject (should not happen, but safe)
                .collect(java.util.stream.Collectors.toMap(StudentSubjectResponse::getSubjectId, x -> x, (a, b) -> a, java.util.LinkedHashMap::new))
                .values()
                .stream()
                .toList();

        return ResponseEntity.ok(resp);
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
            logger.error("Authentication error", e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    public static class StudentRegisterRequest {

        private String email;
        private String password;

        // constructors, getters, setters
        public StudentRegisterRequest() {
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
    }

    @GetMapping("/me/past-lectures")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentPastLectureDto>> getPastLecturesForMe() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        Integer userId = null;
        String email = null;

        if (principal instanceof Integer) {
            userId = (Integer) principal;
        } else {
            email = authentication.getName();
        }

        Optional<Student> studentOpt;
        if (userId != null) {
            studentOpt = studentService.getStudentByUserId(userId);
        } else if (email != null) {
            studentOpt = studentService.getStudentByEmail(email);
        } else {
            return ResponseEntity.status(400).build();
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        if (student.getClassId() == null) {
            return ResponseEntity.ok(List.of());
        }

        Long classId = student.getClassId().longValue();

        var schedules = scheduleService.getSchedulesByClassId(classId);
        if (schedules == null || schedules.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // Past lectures = schedules that already started
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // attendance lookup by scheduleId + date
        List<StudentPastLectureDto> result = schedules.stream()
                .filter(s -> s.getStartTime() != null && s.getStartTime().isBefore(now))
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .limit(20)
                .map(s -> {
                    String subjectName = "—";
                    String subjectCode = "—";
                    String teacherName = "—";

                    if (s.getSubjectId() != null) {
                        subjectService.getSubjectById(s.getSubjectId()).ifPresent(sub -> {
                            // handled below by side-effect not ideal, but keeps code short
                        });
                    }

                    Optional<Subject> subjectOpt = s.getSubjectId() != null ? subjectService.getSubjectById(s.getSubjectId()) : Optional.empty();
                    if (subjectOpt.isPresent()) {
                        subjectName = subjectOpt.get().getName() != null ? subjectOpt.get().getName() : "—";
                        subjectCode = subjectOpt.get().getCode() != null ? subjectOpt.get().getCode() : "—";
                    }

                    if (s.getTeacherId() != null) {
                        var teacherOpt = teacherService.getTeacherById(s.getTeacherId());
                        if (teacherOpt.isPresent()) {
                            teacherName = teacherOpt.get().getName() != null ? teacherOpt.get().getName() : "—";
                        }
                    }

                    String startTime = s.getStartTime() != null ? s.getStartTime().format(timeFormatter) : "—";
                    String endTime = s.getEndTime() != null ? s.getEndTime().format(timeFormatter) : "—";
                    String room = s.getRoom() != null ? s.getRoom() : "";

                    String date = s.getStartTime() != null ? s.getStartTime().toLocalDate().format(dateFormatter) : "";

                    // attendance status
                    String status = "Not Marked";
                    LocalDate lectureDate = s.getStartTime() != null ? s.getStartTime().toLocalDate() : null;
                    if (lectureDate != null) {
                        Integer studentId = student.getStudentId();
                        // Attendance entity stores classId + scheduleId + date; we can match by schedule/date/student
                        // Use existing repository method (studentId + date + classId) then filter by scheduleId
                        List<com.smartroll.backend.entity.Attendance> attendances = attendanceService.getAttendanceListByStudentIdAndDate(studentId, lectureDate);
                        if (attendances != null) {
                            for (var a : attendances) {
                                if (a.getScheduleId() != null && a.getScheduleId().equals(s.getId())) {
                                    status = a.getStatus() == com.smartroll.backend.entity.Attendance.AttendanceStatus.PRESENT ? "Present" : "Absent";
                                    break;
                                }
                            }
                        }
                    }

                    return new StudentPastLectureDto(
                            date,
                            subjectName,
                            subjectCode,
                            teacherName,
                            startTime,
                            endTime,
                            room,
                            status
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody StudentRegisterRequest request) {


        try {
            // Validate input
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(400).body("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(400).body("Password is required");
            }

            String trimmedEmail = request.getEmail().trim();

            // Check if user already has a password set
            Optional<User> existingUser = userService.getUserByEmail(trimmedEmail);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                // Check if password is already set (not null or empty)
                if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                    return ResponseEntity.status(400).body("This email is already registered. Please login instead.");
                }
                // Update password for existing user
                user.setPassword(request.getPassword());
                userService.saveUser(user);
                return ResponseEntity.ok("Password set successfully. You can now login.");
            } else {
                // Check if student exists with this email
                Optional<Student> existingStudent = studentService.getStudentByEmail(trimmedEmail);
                if (existingStudent.isPresent()) {
                    // Create a new user account for existing student
                    User newUser = new User();
                    newUser.setEmail(trimmedEmail);
                    newUser.setUsername(trimmedEmail);
                    newUser.setPassword(request.getPassword());
                    newUser.setName(existingStudent.get().getFirstName() + " " + existingStudent.get().getLastName());
                    newUser.setRole(User.Role.STUDENT);
                    newUser.setCreatedAt(java.time.LocalDateTime.now());
                    User savedUser = userService.saveUser(newUser);

                    // Update student with userId
                    Student student = existingStudent.get();
                    student.setUserId(savedUser.getUserId());
                    studentService.saveStudent(student);

                    return ResponseEntity.ok("Password set successfully. You can now login.");
                } else {
                    // Email doesn't exist in users or students
                    return ResponseEntity.status(404).body("Email not found. Please contact admin to create your account.");
                }
            }

        } catch (Exception e) {
            logger.error("Registration failed", e);
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
}
