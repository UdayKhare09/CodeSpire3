package dev.uday.elrond.security.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@elrond.com}")
    private String fromEmail;

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Email Verification - Elrond");

        String verificationUrl = appUrl + "/api/v1/auth/verify-email?token=" + token;
        String text = "Welcome to Elrond!\n\n" +
                     "Please click the link below to verify your email address:\n" +
                     verificationUrl + "\n\n" +
                     "This link will expire in 24 hours.\n\n" +
                     "If you didn't create an account, please ignore this email.";

        message.setText(text);
        
        try {
            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}. Error: {}", to, e.getMessage());
            log.info("DEV MODE: Verification URL for {}: {}", to, verificationUrl);
        }
    }
}

