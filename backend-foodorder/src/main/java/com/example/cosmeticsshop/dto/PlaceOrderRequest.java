package com.example.cosmeticsshop.dto;

import java.util.List;

public class PlaceOrderRequest {
    private String receiverName;
    private String receiverAddress;
    private String receiverPhone;
    private String paymentMethod;
    private double totalPrice;
    private List<OrderDetailDTO> orderItems;

    // Getters and setters
    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverAddress() {
        return receiverAddress;
    }

    public void setReceiverAddress(String receiverAddress) {
        this.receiverAddress = receiverAddress;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<OrderDetailDTO> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderDetailDTO> orderItems) {
        this.orderItems = orderItems;
    }
}