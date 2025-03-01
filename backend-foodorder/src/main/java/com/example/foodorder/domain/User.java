package com.example.foodorder.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.example.foodorder.util.SecurityUtil;
import com.example.foodorder.util.constant.GenderEnum;
import com.example.foodorder.util.constant.RoyaltyEnum;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Setter
@Getter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "email không được để trống")
    @Column(unique = true, nullable = false)
    private String email;
    @Column(columnDefinition = "MEDIUMTEXT")
    private String refreshToken;

    @NotBlank(message = "password không được để trống")
    @Column(nullable = false)
    private String passwordHash;

    private String phone;
    private String name;
    private String address;
    private String avatarUrl;
    private String bio;
    private String createdBy;
    private String updatedBy;

    private double totalMoneySpent;
    private int totalOrder;

    @Enumerated(EnumType.ORDINAL)
    private RoyaltyEnum royalty;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<History> histories = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private int age;

    @Enumerated(EnumType.STRING)
    private GenderEnum gender;
    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        this.updatedAt = Instant.now();
    }

    // Getters and Setters
}
