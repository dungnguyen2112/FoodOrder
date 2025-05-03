package com.example.cosmeticsshop.service;

import java.io.UnsupportedEncodingException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.domain.History;
import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.OrderDetail;
import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.ResTable;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.dto.OrderDetailDTO;
import com.example.cosmeticsshop.dto.PlaceOrderRequest;
import com.example.cosmeticsshop.repository.HistoryRepository;
import com.example.cosmeticsshop.repository.OrderDetailRepository;
import com.example.cosmeticsshop.repository.OrderRepository;
import com.example.cosmeticsshop.repository.ProductRepository;
import com.example.cosmeticsshop.repository.ResTableRepository;
import com.example.cosmeticsshop.util.constant.OrderStatus;
import com.example.cosmeticsshop.util.constant.PaymentStatus;
import com.example.cosmeticsshop.util.constant.TableEnum;

@Service
public class PaymentOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private ResTableRepository resTableRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VNPayService vnPayService;

    /**
     * Handle order placement for both COD and VNPay payment methods
     */
    public Order handlePlaceOrder(User user, String receiverName, String receiverAddress,
            String receiverPhone, String paymentMethod, String orderId) {

        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setName(receiverName);
        order.setAddress(receiverAddress);
        order.setPhone(receiverPhone);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        order.setPaymentStatus(PaymentStatus.NOT_PAID);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentRef(orderId);

        // Handle table assignment
        ResTable defaultTable = resTableRepository.findByTableNumber("Ăn tại nhà");
        if (defaultTable == null) {
            defaultTable = new ResTable();
            defaultTable.setTableNumber("Ăn tại nhà");
            defaultTable.setStatus(TableEnum.AVAILABLE);
            defaultTable = resTableRepository.save(defaultTable);
        }
        order.setTable(defaultTable);

        // Save order to get ID
        return orderRepository.save(order);
    }

    /**
     * Process order details after initial order creation
     */
    public Order processOrderItems(Order order, List<OrderDetailDTO> items, double totalPrice) {
        // Create order details
        List<OrderDetail> orderDetails = items.stream().map(item -> {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            orderDetail.setName(product.getName());
            orderDetail.setProduct(product);
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setPrice(product.getPrice());
            return orderDetail;
        }).collect(Collectors.toList());

        // Save order details
        orderDetails = orderDetailRepository.saveAll(orderDetails);
        order.setOrderDetails(orderDetails);

        // Update total price
        order.setTotalPrice(totalPrice);

        // Create order history
        History history = new History();
        history.setUser(order.getUser());
        history.setAction("Đặt hàng");
        history.setTimestamp(LocalDateTime.now());
        history.setTotalPrice(totalPrice);
        history.setDetails("Đơn hàng #" + order.getId() + " đã được đặt với tổng tiền: " + totalPrice + " VND.");
        historyRepository.save(history);

        // Link history to order
        order.setHistory(history);

        // Save order with details and history
        return orderRepository.save(order);
    }

    /**
     * Send confirmation email for COD orders
     */
    public void sendOrderConfirmationEmail(User user, Order order) {
        try {
            List<Map<String, Object>> orderItemList = order.getOrderDetails().stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("name", item.getName());
                        map.put("quantity", item.getQuantity());
                        map.put("price", item.getPrice());
                        return map;
                    })
                    .collect(Collectors.toList());

            // Send email to customer
            emailService.sendEmailFromTemplateSync(
                    user.getEmail(),
                    "Xác nhận đơn hàng",
                    "confirm",
                    user.getUsername(),
                    orderItemList,
                    order.getTotalPrice() + "");

            // Send notification to admin
            emailService.sendEmailFromTemplateSync(
                    "nguyentridung20044@gmail.com",
                    "Có đơn hàng mới",
                    "neworder",
                    user.getUsername(),
                    orderItemList,
                    order.getTotalPrice() + "");
        } catch (Exception e) {
            // Log error but don't fail the order process
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }
}