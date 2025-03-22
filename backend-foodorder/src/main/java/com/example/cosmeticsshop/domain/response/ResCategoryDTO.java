package com.example.cosmeticsshop.domain.response;

import java.util.List;

import com.example.cosmeticsshop.domain.Product;

import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String image;
}
