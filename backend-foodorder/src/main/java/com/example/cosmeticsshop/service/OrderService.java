package com.example.cosmeticsshop.service;

import com.example.cosmeticsshop.domain.History;
import com.example.cosmeticsshop.domain.Notification;
import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.OrderDetail;
import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.ResTable;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.request.OrderRequest;
import com.example.cosmeticsshop.domain.response.OrderDetailResponse;
import com.example.cosmeticsshop.domain.response.OrderResponse;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;
import com.example.cosmeticsshop.repository.HistoryRepository;
import com.example.cosmeticsshop.repository.OrderDetailRepository;
import com.example.cosmeticsshop.repository.OrderRepository;
import com.example.cosmeticsshop.repository.ProductRepository;
import com.example.cosmeticsshop.repository.ResTableRepository;
import com.example.cosmeticsshop.repository.UserRepository;
import com.example.cosmeticsshop.util.SecurityUtil;
import com.example.cosmeticsshop.util.constant.OrderStatus;
import com.example.cosmeticsshop.util.constant.PaymentStatus;
import com.example.cosmeticsshop.util.constant.RoyaltyEnum;
import com.example.cosmeticsshop.util.constant.TableEnum;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;

import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final HistoryService historyService;
    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final OrderDetailService orderDetailService;
    private final ResTableRepository resTableRepository;
    private final ResTableService tableService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository, OrderDetailRepository orderDetailRepository,
            HistoryService historyService, HistoryRepository historyRepository, UserRepository userRepository,
            ProductRepository productRepository, UserService userService, OrderDetailService orderDetailService,
            ResTableRepository resTableRepository, ResTableService tableService, EmailService emailService,
            NotificationService notificationService) {
        this.tableService = tableService;
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.historyService = historyService;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.userService = userService;
        this.orderDetailService = orderDetailService;
        this.resTableRepository = resTableRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    public ResultPaginationDTO fetchAllOrder(Specification<Order> spec, Pageable pageable) {
        Page<Order> pageOrder = this.orderRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageOrder.getTotalPages());
        mt.setTotal(pageOrder.getTotalElements());

        rs.setMeta(mt);
        // Remove sensitive data
        List<Order> listOrder = pageOrder.getContent()
                .stream()
                .map(order -> {
                    Order o = new Order();
                    o.setId(order.getId());
                    o.setTable(order.getTable());
                    o.setStatus(order.getStatus());
                    o.setAddress(order.getAddress());
                    o.setPhone(order.getPhone());
                    o.setName(order.getName());
                    o.setPaymentStatus(order.getPaymentStatus());
                    o.setOrderDetails(order.getOrderDetails());
                    o.setUser(order.getUser());
                    o.setCreatedAt(order.getCreatedAt());
                    o.setUpdatedAt(order.getUpdatedAt());
                    o.setTotalPrice(order.getTotalPrice());
                    return o;
                })
                .collect(Collectors.toList());
        List<OrderResponse> orderResponses = listOrder.stream()
                .map(order -> {
                    List<OrderDetailResponse> orderDetailResponses = order.getOrderDetails().stream()
                            .map(orderDetail -> {
                                OrderDetailResponse orderDetailResponse = new OrderDetailResponse();
                                orderDetailResponse.setProductName(orderDetail.getProduct().getName());
                                orderDetailResponse.setPrice(orderDetail.getPrice());
                                orderDetailResponse.setQuantity(orderDetail.getQuantity());
                                return orderDetailResponse;
                            })
                            .collect(Collectors.toList());
                    return new OrderResponse(order.getId(), order.getName(),
                            order.getAddress(), order.getPhone(), order.getTotalPrice(), order.getPaymentStatus(),
                            order.getStatus(),
                            order.getTable().getTableNumber(),
                            order.getCreatedAt().toString(), order.getUpdatedAt().toString(),
                            orderDetailResponses);
                })
                .collect(Collectors.toList());
        rs.setResult(orderResponses);
        return rs;
    }

    public Optional<Order> fetchOrderById(long id) {
        return this.orderRepository.findById(id);
    }

    public void deleteOrderById(long id) {
        Optional<Order> orderOptional = this.fetchOrderById(id);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            List<OrderDetail> orderDetails = order.getOrderDetails();
            for (OrderDetail orderDetail : orderDetails) {
                this.orderDetailRepository.deleteById(orderDetail.getId());
            }
        }
        this.orderRepository.deleteById(id);
    }

    // ✅ Hủy đơn -> Ghi lịch sử
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // 🔥 Ghi lịch sử: "Khách hàng hủy đơn"
        // historyService.createHistory(userId, "Đã hủy đơn hàng ID: " + orderId);
    }

    // ✅ Admin cập nhật trạng thái đơn hàng -> Ghi lịch sử
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Trạng thái đơn hàng không được để trống!");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        User user = order.getUser();
        if (status == OrderStatus.COMPLETED) {
            List<OrderDetail> orderDetails = order.getOrderDetails();
            for (OrderDetail orderDetail : orderDetails) {
                Product product = orderDetail.getProduct();
                product.setQuantity(product.getQuantity() - orderDetail.getQuantity());
                product.setSold(product.getSold() + orderDetail.getQuantity());
                productRepository.save(product);
            }
        }
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public List<Order> fetchOrderByUser(User user) {
        return this.orderRepository.findByUser(user);
    }

    /**
     * 📌 Xuất hóa đơn PDF
     */
    public ByteArrayResource generateBillPdf(Long orderId) throws IOException {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isEmpty())
            return null;

        Order order = optionalOrder.get();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Tiêu đề hóa đơn
        document.add(new Paragraph("HÓA ĐƠN THANH TOÁN")
                .setTextAlignment(TextAlignment.CENTER)
                .setBold()
                .setFontSize(18));

        // Thông tin khách hàng & đơn hàng
        document.add(new Paragraph("Mã Đơn Hàng: " + orderId));
        document.add(new Paragraph("Khách Hàng: " + order.getUser().getName()));
        document.add(new Paragraph("Ngày Đặt: " + order.getOrderTime()));
        document.add(new Paragraph("\n"));

        // Tạo bảng danh sách sản phẩm
        Table table = new Table(3);
        table.addCell("Tên Sản Phẩm");
        table.addCell("Số Lượng");
        table.addCell("Giá");

        for (OrderDetail item : order.getOrderDetails()) {
            table.addCell(item.getProduct().getName());
            table.addCell(String.valueOf(item.getQuantity()));
            table.addCell(item.getPrice() + " VND");
        }
        document.add(table);

        // Tổng tiền
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Tổng tiền: " + order.getTotalAmount() + " VND").setBold());

        document.close();
        return new ByteArrayResource(out.toByteArray());
    }

    // ✅ Khách hàng đặt đơn -> Ghi lịch sử
    public Order createOrder(Order request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING); // Đơn mới
        order.setOrderTime(LocalDateTime.now());
        orderRepository.save(order);

        // 🔥 Ghi lịch sử: "Khách hàng đã đặt đơn hàng"
        // historyService.createHistory(userId, "Đã đặt đơn hàng ID: " + order.getId());

        return order;
    }

    public OrderResponse placeOrder1(OrderRequest orderRequest) throws MessagingException {
        // Lấy email người dùng hiện tại
        String email = SecurityUtil.getCurrentUserLogin().orElse("");

        // Lấy thông tin User từ email
        User user = this.userService.handleGetUserByUsernameOrEmail(email);
        ResTable table = this.resTableRepository.findByTableNumber(orderRequest.getTableNumber());
        // Tạo đơn hàng mới
        Order order = new Order();
        order.setUser(user);
        order.setName(user.getName());
        order.setAddress(orderRequest.getAddress());
        order.setPhone(orderRequest.getPhone());
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setTable(table);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        order.setPaymentStatus(PaymentStatus.NOT_PAID);

        // Set payment method
        if (orderRequest.getPaymentMethod() != null) {
            order.setPaymentMethod(orderRequest.getPaymentMethod());

            // Generate a payment reference for VNPay
            if ("VNPAY".equals(orderRequest.getPaymentMethod())) {
                String paymentRef = "VNP" + System.currentTimeMillis();
                order.setPaymentRef(paymentRef);
            }
        } else {
            order.setPaymentMethod("COD"); // Default to COD
        }

        if (!orderRequest.getTableNumber().equals("Ăn tại nhà")) {
            table.setStatus(TableEnum.BUSY);
            resTableRepository.save(table);
        }

        // Lưu Order lần đầu để có ID
        Order order1 = orderRepository.save(order);

        // Tạo danh sách OrderDetail
        List<OrderDetail> orderDetails = orderRequest.getDetail().stream().map(detail -> {
            Product product = productRepository.findById(detail.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order1);
            orderDetail.setName(product.getName());
            orderDetail.setProduct(product);
            orderDetail.setQuantity(detail.getQuantity());
            orderDetail.setPrice(product.getPrice());
            return orderDetail;
        }).collect(Collectors.toList());

        // Lưu OrderDetails vào DB
        orderDetails = orderDetailRepository.saveAll(orderDetails);
        order.setOrderDetails(orderDetails);

        // Cập nhật tổng tiền trước khi lưu lại Order
        order.setTotalPrice(orderRequest.getTotalPrice());
        orderRepository.save(order); // Lưu lại để cập nhật totalPrice và OrderDetails

        // if(orderRequest.getTotalPrice() >) {
        // order.setStatus(OrderStatus.COMPLETED);
        // orderRepository.save(order);
        // }
        // Chuyển đổi OrderDetail thành Response
        List<OrderDetailResponse> orderDetailResponse = orderDetails.stream()
                .map(this::convertOrderDetailToResponse)
                .collect(Collectors.toList());

        // Ghi vào lịch sử
        History history = new History();
        history.setUser(user);
        history.setAction("Đặt hàng");
        history.setTimestamp(LocalDateTime.now());
        history.setTotalPrice(order.getTotalPrice());
        history.setDetails(
                "Đơn hàng #" + order.getId() + " đã được đặt với tổng tiền: " + order.getTotalPrice() + " VND.");
        historyRepository.save(history); // Lưu trước để có ID

        // Thiết lập quan hệ Order -> History
        order.setHistory(history);
        orderRepository.save(order); // Cập nhật lại Order với History

        // ✅ Gửi email xác nhận đơn hàng - chỉ gửi cho COD
        if ("COD".equals(order.getPaymentMethod())) {
            List<Map<String, Object>> orderItemList = orderDetails.stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("name", item.getName());
                        map.put("quantity", item.getQuantity());
                        map.put("price", item.getPrice());
                        return map;
                    })
                    .collect(Collectors.toList());
            Map<String, Object> emailModel = new HashMap<>();
            emailModel.put("name", user.getName()); // Đổi "customerName" thành "name"
            emailModel.put("orderItems", orderItemList);
            emailModel.put("totalPrice", order.getTotalPrice());

            emailService.sendEmailFromTemplateSync(user.getEmail(), "Xác nhận đơn hàng", "confirm", user.getUsername(),
                    orderItemList, order.getTotalPrice() + "");

            emailService.sendEmailFromTemplateSync("nguyentridung20044@gmail.com", "Có đơn hàng mới", "neworder",
                    user.getUsername(),
                    orderItemList, order.getTotalPrice() + "");
        }

        // Trả về OrderResponse
        return new OrderResponse(order.getId(), order.getName(),
                order.getAddress(), order.getPhone(), order.getTotalPrice(), order.getPaymentStatus(),
                order.getStatus(),
                order.getTable().getTableNumber(),
                order.getCreatedAt().toString(), order.getUpdatedAt().toString(),
                orderDetailResponse);
    }

    public OrderDetailResponse convertOrderDetailToResponse(OrderDetail orderDetail) {
        Product product = this.productRepository.findById(orderDetail.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        OrderDetailResponse orderDetailResponse = new OrderDetailResponse();
        orderDetailResponse.setProductName(product.getName());
        orderDetailResponse.setPrice(orderDetail.getPrice());
        orderDetailResponse.setQuantity(orderDetail.getQuantity());
        return orderDetailResponse;
    }

    public Long getTotalOrders() {
        return this.orderRepository.count();
    }

    public OrderResponse convertToOrderResponse(Order updatedOrder) {
        List<OrderDetailResponse> orderDetailResponses = updatedOrder.getOrderDetails().stream()
                .map(orderDetail -> {
                    OrderDetailResponse orderDetailResponse = new OrderDetailResponse();
                    orderDetailResponse.setProductName(orderDetail.getProduct().getName());
                    orderDetailResponse.setPrice(orderDetail.getPrice());
                    orderDetailResponse.setQuantity(orderDetail.getQuantity());
                    return orderDetailResponse;
                })
                .collect(Collectors.toList());
        return new OrderResponse(updatedOrder.getId(), updatedOrder.getName(),
                updatedOrder.getAddress(), updatedOrder.getPhone(), updatedOrder.getTotalPrice(),
                updatedOrder.getPaymentStatus(),
                updatedOrder.getStatus(),
                updatedOrder.getTable().getTableNumber(),
                updatedOrder.getCreatedAt().toString(), updatedOrder.getUpdatedAt().toString(),
                orderDetailResponses);
    }

    public Order updatePaymentStatus(long id, PaymentStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Trạng thái thanh toán không được để trống!");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        User user = order.getUser();
        if (status == PaymentStatus.PAID) {
            this.tableService.updateTable(order.getTable().getId(), TableEnum.AVAILABLE);
            // if (user.getRoyalty() == null) {
            // user.setRoyalty(RoyaltyEnum.BRONZE);
            // }s
            user.setTotalMoneySpent(user.getTotalMoneySpent() + order.getTotalPrice());
            user.setTotalOrder(user.getTotalOrder() + 1);
            if (user.getTotalMoneySpent() >= 5000000) {
                user.setRoyalty(RoyaltyEnum.GOLD);
            } else if (user.getTotalMoneySpent() >= 1000000) {
                user.setRoyalty(RoyaltyEnum.SILVER);
            } else {
                user.setRoyalty(RoyaltyEnum.BRONZE);
            }
            user.setAddress(user.getAddress());
            user.setName(user.getName());
            user.setPhone(user.getPhone());
            userRepository.save(user);

            // Nếu thanh toán VNPay thành công, gửi email xác nhận
            if ("VNPAY".equals(order.getPaymentMethod())) {
                List<Map<String, Object>> orderItemList = order.getOrderDetails().stream()
                        .map(item -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("name", item.getName());
                            map.put("quantity", item.getQuantity());
                            map.put("price", item.getPrice());
                            return map;
                        })
                        .collect(Collectors.toList());

                try {
                    emailService.sendEmailFromTemplateSync(user.getEmail(), "Xác nhận thanh toán VNPay thành công",
                            "confirm", user.getUsername(),
                            orderItemList, order.getTotalPrice() + "");

                    emailService.sendEmailFromTemplateSync("nguyentridung20044@gmail.com",
                            "Có đơn hàng mới đã thanh toán VNPay", "neworder",
                            user.getUsername(),
                            orderItemList, order.getTotalPrice() + "");
                } catch (Exception e) {
                    // Log lỗi nhưng không ảnh hưởng đến quá trình cập nhật trạng thái
                    System.err.println("Lỗi gửi email: " + e.getMessage());
                }
            }
        }
        order.setPaymentStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Find an order by its payment reference
     * 
     * @param paymentRef the payment reference to search for
     * @return the order or null if not found
     */
    public Order findByPaymentRef(String paymentRef) {
        if (paymentRef == null || paymentRef.isEmpty()) {
            return null;
        }
        return orderRepository.findByPaymentRef(paymentRef);
    }

    /**
     * Save an order to the database
     * 
     * @param order the order to save
     * @return the saved order
     */
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

}
