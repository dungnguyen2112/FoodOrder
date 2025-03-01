package com.example.cosmeticsshop.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final MailSender mailSender;
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine templateEngine;

    public EmailService(MailSender mailSender,
            JavaMailSender javaMailSender,
            SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        this.mailSender.send(msg);
    }

    public void sendEmailSync(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        // Prepare message using a Spring helper
        MimeMessage mimeMessage = this.javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content, isHtml);
            this.javaMailSender.send(mimeMessage);
        } catch (MailException | MessagingException e) {
            System.out.println("ERROR SEND EMAIL: " + e);
        }
    }

    @Async
    public void sendResetPasswordEmail(String to, String name, String resetPasswordLink) {
        try {
            // Tạo nội dung email từ template Thymeleaf
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("resetPasswordLink", resetPasswordLink);
            String htmlContent = templateEngine.process("reset-password", context);

            // Tạo email
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Đặt lại mật khẩu");
            helper.setText(htmlContent, true); // Gửi HTML email

            // Gửi email
            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Gửi email thất bại!", e);
        }
    }

    @Async
    public void sendEmailFromTemplateSync(
            String to,
            String subject,
            String templateName,
            String username,
            List<Map<String, Object>> orderItems,
            String totalPrice) {

        Context context = new Context();
        context.setVariable("name", username);
        context.setVariable("orderItems", orderItems);
        context.setVariable("totalPrice", totalPrice);

        String content = templateEngine.process(templateName, context);
        this.sendEmailSync(to, subject, content, false, true);
    }

}
