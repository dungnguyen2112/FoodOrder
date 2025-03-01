package com.example.foodorder.domain.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class ChangePasswordDTO {
    @NotBlank(message = "Old password is required")
    private String oldPassword;

    @NotBlank(message = "New password is required")
    private String newPassword;
}
