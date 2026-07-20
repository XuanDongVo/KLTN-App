package com.example.englishapp_server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MailService {
    private final org.springframework.mail.javamail.JavaMailSender mailSender;
    private final org.thymeleaf.TemplateEngine templateEngine;

    @org.springframework.beans.factory.annotation.Value("${app.mail.from-address}")
    private String fromAddress;

    @org.springframework.beans.factory.annotation.Value("${app.mail.from-name}")
    private String fromName;

    @org.springframework.scheduling.annotation.Async
    public void sendOtpEmail(String to, String otp) {
        try {
            org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
            context.setVariable("email", to);
            context.setVariable("otp", otp);
            context.setVariable("expireTime", 5);

            String htmlContent = templateEngine.process("email/otp-verification", context);

            sendHtmlMail(to, "EnglishApp - OTP Verification", htmlContent);

            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("CRITICAL: Could not send email to {}. Error: {}", to, e.getMessage());
        }
    }


    private void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromAddress, fromName);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
