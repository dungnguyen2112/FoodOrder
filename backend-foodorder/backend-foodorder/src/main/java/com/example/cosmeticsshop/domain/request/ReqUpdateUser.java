package com.example.cosmeticsshop.domain.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class ReqUpdateUser {
    private Long id;
    private String name;
    private String phone;
    private String avatar;

    public ReqUpdateUser(Long id, String name, String phone, String avatar) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.avatar = avatar;
    }

}
