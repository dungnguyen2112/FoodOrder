package com.example.cosmeticsshop.controller;

import java.io.File;
import java.util.List;
import java.util.Optional;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.RequestToViewNameTranslator;

import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.request.OrderRequest;
import com.example.cosmeticsshop.domain.request.ReqLoginDTO;
import com.example.cosmeticsshop.domain.request.ReqProductDTO;
import com.example.cosmeticsshop.domain.response.HistoryDTO;
import com.example.cosmeticsshop.domain.response.OrderResponse;
import com.example.cosmeticsshop.domain.response.ResProductDTO;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;
import com.example.cosmeticsshop.service.FileService;
import com.example.cosmeticsshop.service.HistoryService;
import com.example.cosmeticsshop.service.OrderService;
import com.example.cosmeticsshop.service.ProductService;
import com.example.cosmeticsshop.service.UserService;
import com.example.cosmeticsshop.util.SecurityUtil;
import com.example.cosmeticsshop.util.annotation.ApiMessage;
import com.example.cosmeticsshop.util.constant.OrderStatus;
import com.example.cosmeticsshop.util.constant.PaymentStatus;
import com.example.cosmeticsshop.util.error.IdInvalidException;
import com.turkraft.springfilter.boot.Filter;

import io.swagger.v3.oas.models.responses.ApiResponse;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class ProductController {

    private final ProductService productService;
    private final FileService fileService;
    private final OrderService orderService;
    private final UserService userService;
    private final HistoryService historyService;

    public ProductController(ProductService productService, FileService fileService, OrderService orderService,
            UserService userService, HistoryService historyService) {
        this.productService = productService;
        this.fileService = fileService;
        this.orderService = orderService;
        this.userService = userService;
        this.historyService = historyService;
    }

    @PostMapping("/products")
    @ApiMessage("Create a new product")
    public ResponseEntity<ResProductDTO> createNewProduct(@Valid @RequestBody ReqProductDTO postManProduct)
            throws IdInvalidException {
        boolean isProductExist = this.productService.isProductExist(postManProduct.getName());
        if (isProductExist) {
            throw new IdInvalidException(
                    "Product " + postManProduct.getName() + "đã tồn tại, vui lòng sử dụng tên khác.");
        }

        ResProductDTO ericProduct = this.productService.handleCreateProduct(postManProduct);
        return ResponseEntity.status(HttpStatus.CREATED).body(ericProduct);
    }

    @GetMapping("/history/user")
    public ResponseEntity<List<HistoryDTO>> getHistoryByUser() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUser = this.userService.handleGetUserByUsernameOrEmail(email);
        List<HistoryDTO> historyDTOs = historyService.getHistoryByUser(currentUser.getId());
        return ResponseEntity.ok(historyDTOs);
    }

    @PostMapping("/ordproducts")
    @ApiMessage("Create a new order")
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody OrderRequest orderRequest) throws MessagingException {
        OrderResponse orderResponse = this.orderService.placeOrder1(orderRequest);
        return ResponseEntity.ok(orderResponse);
    }

    @PutMapping("/orders/{id}")
    @ApiMessage("Update a order")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable("id") long id, @RequestBody OrderStatus status) {
        try {
            Order updatedOrder = this.orderService.updateOrderStatus(id, status);
            OrderResponse orderResponse = this.orderService.convertToOrderResponse(updatedOrder);
            return ResponseEntity.ok(orderResponse);
        } catch (IllegalArgumentException e) {
            // Handle invalid status gracefully
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/orders/pay/{id}")
    @ApiMessage("Update a order")
    public ResponseEntity<OrderResponse> updatePayOrder(@PathVariable("id") long id,
            @RequestBody PaymentStatus status) {
        try {
            Order updatedOrder = this.orderService.updatePaymentStatus(id, status);
            OrderResponse orderResponse = this.orderService.convertToOrderResponse(updatedOrder);
            return ResponseEntity.ok(orderResponse);
        } catch (IllegalArgumentException e) {
            // Handle invalid status gracefully
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/orders/{id}")
    @ApiMessage("Delete a order")
    public ResponseEntity<Void> deleteOrder(@PathVariable("id") long id) {
        this.orderService.deleteOrderById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/products/{id}")
    @ApiMessage("Update a product")
    public ResponseEntity<ResProductDTO> updateProduct(@PathVariable("id") long id,
            @Valid @RequestBody ReqProductDTO postManProduct) throws IdInvalidException {
        Product currentProduct = this.productService.fetchProductById1(id);
        if (currentProduct == null) {
            throw new IdInvalidException(
                    "Product " + id + " không tồn tại.");
        }
        ResProductDTO ericProduct = this.productService.handleUpdateProduct(id, postManProduct);
        return ResponseEntity.ok(ericProduct);
    }

    @DeleteMapping("/products/{id}")
    @ApiMessage("Delete a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") long id)
            throws IdInvalidException {
        Product currentProduct = this.productService.fetchProductById1(id);
        if (currentProduct == null) {
            throw new IdInvalidException(
                    "Product " + id + " không tồn tại.");
        }
        this.productService.handleDeleteProduct(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/products/{id}")
    @ApiMessage("Get a product")
    public ResponseEntity<ResProductDTO> getProduct(@PathVariable("id") long id)
            throws IdInvalidException {
        ResProductDTO currentProduct = this.productService.fetchProductById(id);
        if (currentProduct == null) {
            throw new IdInvalidException(
                    "Product " + id + " không tồn tại.");
        }
        return ResponseEntity.ok(currentProduct);
    }

    @GetMapping("/products")
    @ApiMessage("Get all products")
    public ResponseEntity<ResultPaginationDTO> getAllProducts(@Filter Specification<Product> spec,
            @ParameterObject Pageable pageable) {

        ResultPaginationDTO result = this.productService.fetchAllProduct(spec, pageable);
        return ResponseEntity.ok(result);

    }

    @GetMapping("/products/category/{id}")
    @ApiMessage("Get all products of a category")
    public ResponseEntity<ResultPaginationDTO> getProductsByCategoryId(@PathVariable Long id,
            @ParameterObject Pageable pageable) {
        ResultPaginationDTO result = this.productService.fetchAllProductByCategoryId(id, pageable);
        return ResponseEntity.ok(result);
    }

}
