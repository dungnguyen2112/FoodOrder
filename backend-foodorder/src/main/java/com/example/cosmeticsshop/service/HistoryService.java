package com.example.cosmeticsshop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.relational.core.sql.In;
import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.domain.History;
import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.response.HistoryDTO;
import com.example.cosmeticsshop.domain.response.OrderDetailResponse;
import com.example.cosmeticsshop.domain.response.OrderResponse;
import com.example.cosmeticsshop.repository.HistoryRepository;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryService {

    @Autowired
    private HistoryRepository historyRepository;

    // Fetch all histories
    public List<HistoryDTO> getAllHistories() {
        List<History> histories = historyRepository.findAll();
        return histories.stream().map(history -> {
            HistoryDTO dto = new HistoryDTO();
            dto.setId(history.getId());
            dto.setAction(history.getAction());
            dto.setTimestamp(history.getTimestamp());
            dto.setDetails(history.getDetails());

            // Set the total price by calculating the sum of prices from associated orders
            dto.setTotalPrice(calculateTotalPrice(history.getOrders()));
            dto.setOrders(history.getOrders().stream().map(order -> {
                OrderResponse orderResponse = new OrderResponse(
                        order.getId(),
                        order.getName(),
                        order.getAddress(),
                        order.getPhone(),
                        order.getTotalPrice(),
                        order.getPaymentStatus(),
                        order.getStatus(),
                        order.getTable().getTableNumber(),
                        order.getCreatedAt().toString(), order.getUpdatedAt().toString(),
                        order.getOrderDetails().stream().map(orderDetail -> new OrderDetailResponse(
                                orderDetail.getProduct().getName(),
                                orderDetail.getProduct().getPrice(),
                                orderDetail.getQuantity())).collect(Collectors.toList()));
                return orderResponse;
            }).collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

    // Helper method to calculate total price from orders
    private double calculateTotalPrice(List<Order> orders) {
        return orders.stream().mapToDouble(Order::getTotalPrice).sum();
    }

    public List<HistoryDTO> getHistoryByUser(Long userId) {
        List<History> histories = historyRepository.findByUserId(userId);
        return histories.stream()
                .sorted((h1, h2) -> h2.getTimestamp().compareTo(h1.getTimestamp())) // Sort histories by timestamp in
                                                                                    // descending order
                .map(history -> {
                    HistoryDTO dto = new HistoryDTO();
                    dto.setId(history.getId());
                    dto.setAction(history.getAction());
                    dto.setTimestamp(history.getTimestamp());
                    dto.setDetails(history.getDetails());

                    // Set the total price by calculating the sum of prices from associated orders
                    dto.setTotalPrice(histories.stream().mapToDouble(History::getTotalPrice).sum());
                    List<Order> orders = history.getOrders();
                    if (orders == null || orders.isEmpty()) {
                        dto.setOrders(Collections.emptyList());
                    } else {
                        dto.setOrders(orders.stream()
                                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt())) // Sort by createdAt
                                                                                                    // in descending
                                                                                                    // order
                                .map(order -> new OrderResponse(
                                        order.getId(),
                                        order.getName(),
                                        order.getAddress(),
                                        order.getPhone(),
                                        order.getTotalPrice(),
                                        order.getPaymentStatus(),
                                        order.getStatus(),
                                        order.getTable().getTableNumber(),
                                        order.getCreatedAt().toString(), order.getUpdatedAt().toString(),
                                        order.getOrderDetails().stream().map(orderDetail -> new OrderDetailResponse(
                                                orderDetail.getProduct().getName(),
                                                orderDetail.getProduct().getPrice(),
                                                orderDetail.getQuantity())).collect(Collectors.toList())))
                                .collect(Collectors.toList()));
                    }

                    return dto;
                }).collect(Collectors.toList());
    }

    // Helper method to convert orders to OrderDTO
}
