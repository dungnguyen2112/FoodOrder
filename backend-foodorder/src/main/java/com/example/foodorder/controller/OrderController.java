package com.example.foodorder.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.foodorder.domain.Order;
import com.example.foodorder.domain.User;
import com.example.foodorder.domain.request.OrderDetailRequest;
import com.example.foodorder.domain.request.OrderRequest;
import com.example.foodorder.domain.request.ReqLoginDTO;
import com.example.foodorder.domain.request.ReqProductDTO;
import com.example.foodorder.domain.response.OrderResponse;
import com.example.foodorder.domain.response.ResProductDTO;
import com.example.foodorder.domain.response.ResultPaginationDTO;
import com.example.foodorder.service.OrderService;
import com.example.foodorder.service.ProductService;
import com.example.foodorder.util.annotation.ApiMessage;
import com.example.foodorder.util.constant.OrderStatus;
import com.example.foodorder.util.error.IdInvalidException;
import com.itextpdf.io.exceptions.IOException;
import com.turkraft.springfilter.boot.Filter;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.models.responses.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class OrderController {

    private final OrderService orderService;
    private final ProductService productService;

    public OrderController(OrderService orderService, ProductService productService) {
        this.orderService = orderService;
        this.productService = productService;
    }

    // @PutMapping("/orders/{id}")
    // @ApiMessage("Update a order")
    // public ResponseEntity<Order> updateOrder(@PathVariable("id") long id,
    // @RequestBody OrderStatus status) {
    // Order ericOrder = this.orderService.updateOrderStatus(id, status);
    // return ResponseEntity.ok(ericOrder);
    // }

    @GetMapping("/orders")
    @ApiMessage("Get all orders")
    public ResponseEntity<ResultPaginationDTO> getAllOrders(@Filter Specification<Order> spec,
            @ParameterObject Pageable pageable) {
        ResultPaginationDTO rs = this.orderService.fetchAllOrder(spec, pageable);
        return ResponseEntity.ok(rs);
    }

    @GetMapping("/orders/{id}")
    @ApiMessage("Get a order")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable("id") long id) {
        OrderResponse order = this.orderService.convertToOrderResponse(this.orderService.fetchOrderById(id).get());
        return ResponseEntity.ok(order);
    }

    // @DeleteMapping("/orders/{id}")
    // @ApiMessage("Delete a order")
    // public ResponseEntity<Void> deleteOrder(@PathVariable("id") long id) {
    // this.orderService.deleteOrderById(id);
    // return ResponseEntity.noContent().build();
    // }

    @GetMapping("/{orderId}/export-bill")
    public ResponseEntity<Resource> exportBill(@PathVariable Long orderId) throws IOException, java.io.IOException {
        ByteArrayResource resource = orderService.generateBillPdf(orderId);
        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Bill_" + orderId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

}
