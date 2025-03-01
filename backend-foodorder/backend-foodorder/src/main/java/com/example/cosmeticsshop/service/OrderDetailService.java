package com.example.cosmeticsshop.service;

import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.domain.OrderDetail;
import com.example.cosmeticsshop.repository.OrderDetailRepository;

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
