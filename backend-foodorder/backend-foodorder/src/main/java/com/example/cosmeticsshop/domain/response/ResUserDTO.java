package com.example.cosmeticsshop.domain.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

import com.example.cosmeticsshop.util.constant.RoyaltyEnum;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResUserDTO {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String address;
    private String phone;
    private String avatarUrl;
    private String bio;
    private Instant createdAt;
    private Instant updatedAt;
    private RoleDTO role;
    private RoyaltyEnum royalty;
    private double totalMoneySpent;
    private int totalOrder;

    public ResUserDTO(Long id, String username, String email, String name, String address, String phone,
            String avatarFileName,
            String bio, Instant createdAt, Instant updatedAt, RoleDTO role, String baseURI, RoyaltyEnum royalty,
            double totalMoneySpent, int totalOrder) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.avatarUrl = baseURI + "/avatars/" + avatarFileName;
        this.bio = bio;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.role = role;
        this.royalty = royalty;
        this.totalMoneySpent = totalMoneySpent;
        this.totalOrder = totalOrder;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoleDTO {
        private Long id;
        private String roleName;
    }
}
