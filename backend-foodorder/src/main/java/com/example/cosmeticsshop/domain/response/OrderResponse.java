package com.example.cosmeticsshop.domain.response;

import java.util.List;

import com.example.cosmeticsshop.domain.OrderDetail;
import com.example.cosmeticsshop.util.constant.OrderStatus;
import com.example.cosmeticsshop.util.constant.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderResponse {
    private Long orderId;
    private String name;
    private String address;
    private String phone;
    private double totalPrice;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String tableNumber;
    private String createdAt;
    private String updatedAt;
    private List<OrderDetailResponse> orderDetails;

    public OrderResponse(Long orderId, String name, String address, String phone, double totalPrice,
            PaymentStatus paymentStatus, OrderStatus status,
            String tableNumber,
            String createdAt, String updatedAt,
            List<OrderDetailResponse> orderDetails) {
        this.orderId = orderId;
        this.totalPrice = totalPrice;
        this.status = status;
        this.orderDetails = orderDetails;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.tableNumber = tableNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.paymentStatus = paymentStatus;
    }

    // Getters and Setters
}
