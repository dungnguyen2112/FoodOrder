package com.example.cosmeticsshop.domain.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AccountUpdateRequestDTO {
    private String fullName;
    private String phone;
    private String address;
    private String avatar;
    private String bio;
}
