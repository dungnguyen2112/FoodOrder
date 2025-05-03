package com.example.cosmeticsshop.domain.request;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import java.util.List;

@Data
public class OrderRequest {
    private String name;
    private String address;
    private String phone;
    private double totalPrice;
    private String tableNumber;
    private List<OrderDetailRequest> detail;
    private String paymentMethod;
}
