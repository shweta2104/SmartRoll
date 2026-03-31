package com.smartroll.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
            logger.info("✅ Email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("❌ Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email send failed", e);
        }
    }

    public void sendTeacherWelcomeEmail(String toEmail, String teacherName, String loginUrl) {
        String subject = "Welcome to SmartRoll - Teacher Account Activated!";
        String body = String.format("""
            Dear %s,

            Your SmartRoll teacher account has been successfully activated!

            Login Details:
            Email: %s
            Login URL: %s/teacher-login

            Use the email and password you set during registration to login.

            Best regards,
            SmartRoll Admin Team
            """, teacherName, toEmail, loginUrl);
        sendEmail(toEmail, subject, body);
    }

    public void sendPreRegistrationEmail(String toEmail, String teacherName, String registerUrl) {
        String subject = "SmartRoll Teacher Account Ready - Complete Registration";
        String body = String.format("""
            Dear %s,

            Your SmartRoll teacher account has been created by admin and is ready!

            Complete Registration:
            Registration URL: %s/teacher/register

            Click the link, set your password, and start using SmartRoll.

            Best regards,
            SmartRoll Admin Team
            """, teacherName, registerUrl);
        sendEmail(toEmail, subject, body);
    }
}
