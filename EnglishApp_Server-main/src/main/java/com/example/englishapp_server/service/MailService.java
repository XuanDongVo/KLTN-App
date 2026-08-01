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
            context.setVariable("expireMinutes", 10);

            String htmlContent = templateEngine.process("email/verify-account", context);

            sendHtmlMail(to, "EnglishApp - OTP Verification", htmlContent);

            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("CRITICAL: Could not send email to {}.", to, e);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendChallengeReportEmail(String to, String username, int currentXp, int targetXp, int targetDays, int completedUnits, int learnedDays) {
        try {
            org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
            context.setVariable("username", username);
            context.setVariable("currentXp", currentXp);
            context.setVariable("targetXp", targetXp);
            context.setVariable("targetDays", targetDays);
            context.setVariable("completedUnits", completedUnits);
            context.setVariable("learnedDays", learnedDays);
            context.setVariable("isSuccess", currentXp >= targetXp);

            String htmlContent = templateEngine.process("email/challenge-report", context);

            String subject = currentXp >= targetXp ? "EnglishApp - Chúc mừng bạn đã hoàn thành thử thách!" : "EnglishApp - Đừng nản chí, thử thách tiếp theo đang chờ bạn!";
            sendHtmlMail(to, subject, htmlContent);

            log.info("Challenge report email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("CRITICAL: Could not send challenge report email to {}.", to, e);
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
