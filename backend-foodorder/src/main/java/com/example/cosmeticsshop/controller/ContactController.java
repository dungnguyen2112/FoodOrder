package com.example.cosmeticsshop.controller;

import com.example.cosmeticsshop.dto.ContactFormDTO;
import com.example.cosmeticsshop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final EmailService emailService;

    @Autowired
    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Xử lý submit form liên hệ và gửi email
     */
    @PostMapping("/submit")
    public ResponseEntity<String> submitContactForm(@Valid @RequestBody ContactFormDTO contactForm) {
        try {
            // Gửi email tới admin và email xác nhận cho người dùng
            emailService.sendContactFormEmail(contactForm);
            return ResponseEntity.ok("Tin nhắn đã được gửi thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể gửi tin nhắn: " + e.getMessage());
        }
    }
}