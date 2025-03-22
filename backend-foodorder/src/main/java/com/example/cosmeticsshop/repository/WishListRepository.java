package com.example.cosmeticsshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.WishList;

public interface WishListRepository extends JpaRepository<WishList, Long>, JpaSpecificationExecutor<WishList> {
    WishList findByUserAndProductId(User user, Long productId);

    List<WishList> findByUser(User user);

    boolean existsByUserAndProduct(User user, Product product);

    void deleteByUserAndProduct(User user, Product product);
}
