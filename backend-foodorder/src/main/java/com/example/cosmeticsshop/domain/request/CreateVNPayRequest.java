package com.example.cosmeticsshop.domain.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVNPayRequest {
    private double amount;
    private String orderId;
}