package com.example.cosmeticsshop.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.WishList;
import com.example.cosmeticsshop.repository.ProductRepository;
import com.example.cosmeticsshop.repository.UserRepository;
import com.example.cosmeticsshop.repository.WishListRepository;

import jakarta.transaction.Transactional;

@Service
public class WishListService {

        @Autowired
        private WishListRepository WishListRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ProductRepository productRepository;

        // Lấy danh sách product user đã WishList
        public List<Product> getWishList(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return WishListRepository.findByUser(user)
                                .stream()
                                .map(WishList::getProduct)
                                .collect(Collectors.toList());
        }

        // Thêm sản phẩm vào WishList
        public void addToWishList(Long userId, Long productId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                if (WishListRepository.existsByUserAndProduct(user, product)) {
                        throw new RuntimeException("Product already in WishList");
                }

                WishList WishList = new WishList(user, product);
                WishListRepository.save(WishList);
        }

        // Xóa sản phẩm khỏi WishList
        @Transactional
        public void removeFromWishList(Long userId, Long productId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                WishListRepository.deleteByUserAndProduct(user, product);
        }

        public List<Long> getWishListIds(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return WishListRepository.findByUser(user)
                                .stream()
                                .map(WishList::getProduct)
                                .map(Product::getId)
                                .collect(Collectors.toList());
        }
}
