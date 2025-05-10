package com.example.cosmeticsshop.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.response.ResProductDTO;
import com.example.cosmeticsshop.domain.response.ResWithListDTO;
import com.example.cosmeticsshop.service.UserService;
import com.example.cosmeticsshop.service.WishListService;
import com.example.cosmeticsshop.util.SecurityUtil;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishListController {

        @Autowired
        private WishListService WishListService;

        @Autowired
        private UserService userService;

        // Lấy danh sách WishList của user
        @GetMapping
        public ResponseEntity<ResWithListDTO> getWishList() {
                String email = SecurityUtil.getCurrentUserLogin().isPresent()
                                ? SecurityUtil.getCurrentUserLogin().get()
                                : "";

                User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
                Long userId = currentUserDB.getId();
                List<Product> WishList = WishListService.getWishList(userId);
                List<Long> WishListIds = WishListService.getWishListIds(userId);
                return ResponseEntity.ok(new ResWithListDTO(WishListIds));
        }

        @GetMapping("/products")
        public ResponseEntity<ResWithListDTO> getWishListProducts() {
                String email = SecurityUtil.getCurrentUserLogin().isPresent()
                                ? SecurityUtil.getCurrentUserLogin().get()
                                : "";

                User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
                Long userId = currentUserDB.getId();
                List<ResProductDTO> WishList = WishListService.getWishList(userId).stream()
                                .map(product -> new ResProductDTO(product.getId(), product.getName(),
                                                product.getPrice(),
                                                product.getImage(), product.getDetailDesc(), product.getShortDesc(),
                                                product.getQuantity(), product.getSold(), product.getFactory(),
                                                product.getTarget(),
                                                product.getCategoryName(),
                                                product.getCreatedAt(), product.getUpdatedAt(), new ArrayList<>()))
                                .toList();
                return ResponseEntity.ok(new ResWithListDTO(WishList));
        }

        // Thêm sản phẩm vào WishList
        @PostMapping("/add")
        public ResponseEntity<?> addToWishList(@RequestParam Long productId) {
                String email = SecurityUtil.getCurrentUserLogin().isPresent()
                                ? SecurityUtil.getCurrentUserLogin().get()
                                : "";

                User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
                Long userId = currentUserDB.getId();
                WishListService.addToWishList(userId, productId);
                return ResponseEntity.ok("Added to WishList");
        }

        // Xóa sản phẩm khỏi WishList
        @DeleteMapping("/remove")
        public ResponseEntity<?> removeFromWishList(@RequestParam Long productId) {
                String email = SecurityUtil.getCurrentUserLogin().isPresent()
                                ? SecurityUtil.getCurrentUserLogin().get()
                                : "";

                User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
                Long userId = currentUserDB.getId();
                WishListService.removeFromWishList(userId, productId);
                return ResponseEntity.ok("Removed from WishList");
        }
}