package com.example.foodorder.domain.response;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResUpdateUserDTO {
    private long id;
    private String name;
    private String address;
    private String phone;
    private int age;
    private Instant updatedAt;
}
