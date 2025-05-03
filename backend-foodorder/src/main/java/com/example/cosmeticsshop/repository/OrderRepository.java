package com.example.cosmeticsshop.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByUser(User user);

    Order findByPaymentRef(String paymentRef);
}
