package com.example.cosmeticsshop.domain.request;

import org.springframework.web.multipart.MultipartFile;

import com.example.cosmeticsshop.domain.Role;
import com.example.cosmeticsshop.util.validator.StrongPassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequestDTO {

    @NotBlank(message = "Username is required")
    private String username;

    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @StrongPassword
    private String password;

    private String phone;

    private String avatar;

    private String address;

    private int age;

    private String bio;

    private Role role;

}
