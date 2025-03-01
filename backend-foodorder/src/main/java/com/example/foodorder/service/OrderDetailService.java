package com.example.foodorder.service;

import org.springframework.stereotype.Service;

import com.example.foodorder.domain.OrderDetail;
import com.example.foodorder.repository.OrderDetailRepository;

@Service
public class OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;

    public OrderDetailService(OrderDetailRepository orderDetailRepository) {
        this.orderDetailRepository = orderDetailRepository;
    }

    // Save order detail
    public void saveOrderDetail(OrderDetail orderDetail) {
        this.orderDetailRepository.save(orderDetail);
    }

}
