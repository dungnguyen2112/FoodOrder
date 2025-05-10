package com.example.cosmeticsshop.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String text;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column
    private Integer rating;

    @Column
    private String email;

    // Đánh giá được hiển thị công khai hay không
    @Column
    private boolean published = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}