package com.example.cosmeticsshop.domain.request;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Data
public class OrderDetailRequest {
    private Long id;
    private String bookName;
    private int quantity;
}
