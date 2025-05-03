package com.example.cosmeticsshop.controller;

import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;
import java.util.Optional;
import java.util.List;
import java.util.Collections;
import java.util.Enumeration;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import org.springframework.http.HttpStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.dto.PlaceOrderRequest;
import com.example.cosmeticsshop.service.OrderService;
import com.example.cosmeticsshop.service.PaymentOrderService;
import com.example.cosmeticsshop.service.ProductService;
import com.example.cosmeticsshop.service.VNPayService;
import com.example.cosmeticsshop.util.constant.PaymentStatus;
import com.example.cosmeticsshop.security.CurrentUser;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private PaymentOrderService paymentOrderService;

    @GetMapping("/vnpay/create-payment")
    public ResponseEntity<Object> createPayment(
            @RequestParam double amount,
            @RequestParam String orderId,
            HttpServletRequest httpRequest) throws UnsupportedEncodingException {

        try {
            // Log thông tin đầu vào chi tiết
            System.out.println("--------- VNPAY PAYMENT REQUEST ---------");
            System.out.println("Amount: " + amount);
            System.out.println("OrderID: " + orderId);

            // Kiểm tra giá trị hợp lệ
            if (amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be greater than 0"));
            }

            if (orderId == null || orderId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OrderID is required"));
            }

            // Get the IP address of the client
            String ipAddr = vnPayService.getIpAddress(httpRequest);
            System.out.println("Client IP: " + ipAddr);

            // Generate VNPay URL
            String paymentUrl = vnPayService.generateVNPayURL(
                    amount,
                    orderId,
                    ipAddr);

            // Trả về URL trong một đối tượng JSON để đảm bảo nhất quán
            return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
        } catch (Exception e) {
            // Log lỗi
            System.err.println("Error generating VNPay URL: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vnpay/thanks")
    public RedirectView vnpayReturn(HttpServletRequest request) {
        try {
            // Validate signature
            Map<String, String> vnpParams = new HashMap<>();
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames.hasMoreElements()) {
                String paramName = paramNames.nextElement();
                if (paramName.startsWith("vnp_")) {
                    String paramValue = request.getParameter(paramName);
                    if (paramValue != null && paramValue.length() > 0) {
                        vnpParams.put(paramName, paramValue);
                    }
                }
            }
            // Extract secure hash
            String receivedHash = vnpParams.remove("vnp_SecureHash");
            vnpParams.remove("vnp_SecureHashType");
            // Build hash data string
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String fieldName = fieldNames.get(i);
                String fieldValue = vnpParams.get(fieldName);
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (i < fieldNames.size() - 1) {
                    hashData.append('&');
                }
            }
            // Calculate signature
            String calculatedHash = vnPayService.hmacSHA512(vnPayService.getSecretKey(), hashData.toString());
            if (!calculatedHash.equalsIgnoreCase(receivedHash)) {
                // Invalid signature
                return new RedirectView("http://localhost:3000/payment-failed?error=Invalid%20signature");
            }

            // Continue processing if signature valid
            String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
            String orderId = request.getParameter("vnp_TxnRef");
            String vnp_TransactionStatus = request.getParameter("vnp_TransactionStatus");
            String vnp_Amount = request.getParameter("vnp_Amount");
            String vnp_TransactionNo = request.getParameter("vnp_TransactionNo");
            String vnp_BankCode = request.getParameter("vnp_BankCode");
            String vnp_CardType = request.getParameter("vnp_CardType");
            String vnp_PayDate = request.getParameter("vnp_PayDate");
            String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");

            // Log payment return details
            System.out.println("========== VNPay Return ==========");
            System.out.println("Response Code: " + vnp_ResponseCode);
            System.out.println("Transaction Status: " + vnp_TransactionStatus);
            System.out.println("Order ID: " + orderId);
            System.out.println("Amount: " + vnp_Amount);
            System.out.println("Transaction No: " + vnp_TransactionNo);
            System.out.println("Bank Code: " + vnp_BankCode);
            System.out.println("Card Type: " + vnp_CardType);
            System.out.println("Pay Date: " + vnp_PayDate);
            System.out.println("Order Info: " + vnp_OrderInfo);
            System.out.println(
                    "Secure Hash: " + (receivedHash != null ? receivedHash.substring(0, 10) + "..." : "null"));
            System.out.println("===================================");

            // Frontend URL for redirection
            String frontendBaseUrl = "http://localhost:3000";
            String callbackUrl = frontendBaseUrl + "/payment/callback";

            // Find and update order if needed
            if (orderId != null && !orderId.isEmpty() && "00".equals(vnp_ResponseCode)) {
                try {
                    Order order = orderService.findByPaymentRef(orderId);
                    if (order != null && order.getPaymentStatus() != PaymentStatus.PAID) {
                        // Update order payment status
                        order = orderService.updatePaymentStatus(order.getId(), PaymentStatus.PAID);

                        // Send confirmation email
                        try {
                            paymentOrderService.sendOrderConfirmationEmail(order.getUser(), order);
                            System.out.println("Confirmation email sent for order: " + orderId);
                        } catch (Exception e) {
                            System.err.println("Failed to send confirmation email: " + e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error updating order status: " + e.getMessage());
                }
            }

            // Construct the redirect URL with all parameters
            StringBuilder redirectUrl = new StringBuilder(callbackUrl);
            redirectUrl.append("?vnp_ResponseCode=").append(vnp_ResponseCode != null ? vnp_ResponseCode : "");
            redirectUrl.append("&vnp_TxnRef=").append(orderId != null ? orderId : "");

            if (vnp_TransactionStatus != null) {
                redirectUrl.append("&vnp_TransactionStatus=").append(vnp_TransactionStatus);
            }

            if (vnp_Amount != null) {
                redirectUrl.append("&vnp_Amount=").append(vnp_Amount);
            }

            if (vnp_TransactionNo != null) {
                redirectUrl.append("&vnp_TransactionNo=").append(vnp_TransactionNo);
            }

            if (vnp_BankCode != null) {
                redirectUrl.append("&vnp_BankCode=").append(vnp_BankCode);
            }

            System.out.println("Redirecting to frontend: " + redirectUrl.toString());
            return new RedirectView(redirectUrl.toString());

        } catch (Exception e) {
            System.err.println("Error processing VNPay return: " + e.getMessage());
            e.printStackTrace();
            return new RedirectView("http://localhost:3000/payment-failed?error=" + e.getMessage());
        }
    }

    @PostMapping("/place-order")
    public ResponseEntity<Object> handlePlaceOrder(
            @RequestBody PlaceOrderRequest orderRequest,
            @CurrentUser User currentUser,
            HttpServletRequest request) throws UnsupportedEncodingException {

        try {
            // Validate request
            if (orderRequest.getReceiverName() == null || orderRequest.getReceiverName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Receiver name is required"));
            }

            if (orderRequest.getOrderItems() == null || orderRequest.getOrderItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Order must contain at least one item"));
            }

            // Default payment method to COD if not specified
            if (orderRequest.getPaymentMethod() == null || orderRequest.getPaymentMethod().trim().isEmpty()) {
                orderRequest.setPaymentMethod("COD");
            }

            // Generate unique order ID
            final String uuid = UUID.randomUUID().toString().replace("-", "");
            System.out.println("Generate order ID: " + uuid);

            // Create initial order
            Order order = paymentOrderService.handlePlaceOrder(
                    currentUser,
                    orderRequest.getReceiverName(),
                    orderRequest.getReceiverAddress(),
                    orderRequest.getReceiverPhone(),
                    orderRequest.getPaymentMethod(),
                    uuid);

            // Process order items
            order = paymentOrderService.processOrderItems(
                    order,
                    orderRequest.getOrderItems(),
                    orderRequest.getTotalPrice());

            // If payment method is COD, send confirmation email
            if ("COD".equals(orderRequest.getPaymentMethod())) {
                paymentOrderService.sendOrderConfirmationEmail(currentUser, order);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Order placed successfully",
                        "orderId", uuid,
                        "redirectUrl", "/thanks"));
            } else if ("VNPAY".equals(orderRequest.getPaymentMethod())) {
                // For VNPay, generate payment URL
                String ip = vnPayService.getIpAddress(request);

                // Log the request before generating URL
                System.out.println("======== VNPay Payment Request ========");
                System.out.println("Order ID: " + uuid);
                System.out.println("Customer: " + currentUser.getName());
                System.out.println("Total price: " + orderRequest.getTotalPrice());
                System.out.println("Client IP: " + ip);

                // Note: Sandbox testing always uses a fixed amount (10,000 VND)
                String vnpUrl = vnPayService.generateVNPayURL(
                        orderRequest.getTotalPrice(), // VNPayService sẽ tự động chuyển đổi thành 10,000 VND cho sandbox
                        uuid,
                        ip);

                // Lưu URL thanh toán vào order để tham chiếu sau này
                order.setPaymentUrl(vnpUrl);
                orderService.saveOrder(order);

                System.out.println("Generated payment URL: " + vnpUrl);
                System.out.println("=======================================");

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Redirecting to payment gateway",
                        "orderId", uuid,
                        "paymentUrl", vnpUrl));
            } else {
                // Unsupported payment method
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Unsupported payment method: " + orderRequest.getPaymentMethod()));
            }
        } catch (Exception e) {
            System.err.println("Error in order processing: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error processing order: " + e.getMessage()));
        }
    }

    @GetMapping("/verify-payment")
    public ResponseEntity<Object> verifyPayment(@RequestParam String paymentRef) {
        try {
            // Find order by payment reference
            Order order = orderService.findByPaymentRef(paymentRef);

            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Order not found with the given payment reference"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orderStatus", order.getStatus().toString(),
                    "paymentStatus", order.getPaymentStatus().toString(),
                    "orderId", order.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error verifying payment: " + e.getMessage()));
        }
    }

    @GetMapping("/thanks")
    public ResponseEntity<Object> thankYouPage(
            @RequestParam(required = false) String paymentRef,
            @CurrentUser User currentUser) {
        try {
            // If payment reference is provided, verify the payment
            if (paymentRef != null && !paymentRef.isEmpty()) {
                Order order = orderService.findByPaymentRef(paymentRef);

                if (order != null) {
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Thank you for your order!",
                            "orderDetails", orderService.convertToOrderResponse(order)));
                }
            }

            // If no payment reference or order not found, just return a generic thank you
            // message
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Thank you for your order!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error retrieving order details: " + e.getMessage()));
        }
    }

    @GetMapping("/payment-failed")
    public ResponseEntity<Object> paymentFailed(
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String code) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("status", "PAYMENT_FAILED");

        // Add error details if available
        if (error != null && !error.isEmpty()) {
            response.put("errorMessage", error);
        }

        if (code != null && !code.isEmpty()) {
            response.put("errorCode", code);

            // Provide more descriptive error for common VNPay error codes
            String errorDescription = getVNPayErrorDescription(code);
            if (errorDescription != null) {
                response.put("errorDescription", errorDescription);
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-callback")
    public ResponseEntity<Object> verifyCallback(
            @RequestParam(value = "vnp_ResponseCode", required = false) String responseCode,
            @RequestParam(value = "vnp_TxnRef", required = false) String txnRef,
            @RequestParam(value = "vnp_Amount", required = false) String amount,
            @RequestParam(value = "vnp_TransactionNo", required = false) String transactionNo,
            @RequestParam(value = "code", required = false) String errorCode) {

        System.out.println("========== VNPay Callback ==========");
        System.out.println("Response Code: " + responseCode);
        System.out.println("Transaction Ref: " + txnRef);
        System.out.println("Amount: " + amount);
        System.out.println("Transaction No: " + transactionNo);
        System.out.println("Error Code: " + errorCode);

        // Nếu tham số được chuyển từ error page, sử dụng errorCode
        if (responseCode == null && errorCode != null) {
            responseCode = errorCode;
        }

        try {
            if (responseCode == null || txnRef == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Thiếu tham số cần thiết"));
            }

            // Tìm đơn hàng
            Order order = null;

            // Tìm theo payment reference
            order = orderService.findByPaymentRef(txnRef);

            // Nếu không tìm thấy, thử tìm theo ID
            if (order == null) {
                try {
                    long orderId = Long.parseLong(txnRef);
                    Optional<Order> optOrder = orderService.fetchOrderById(orderId);
                    if (optOrder.isPresent()) {
                        order = optOrder.get();
                    }
                } catch (NumberFormatException e) {
                    // Bỏ qua lỗi chuyển đổi
                }
            }

            if (order == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Không tìm thấy đơn hàng với mã thanh toán: " + txnRef));
            }

            // Xử lý theo mã phản hồi
            if ("00".equals(responseCode)) {
                // Kiểm tra trạng thái hiện tại trước khi cập nhật
                if (order.getPaymentStatus() != PaymentStatus.PAID) {
                    order = orderService.updatePaymentStatus(order.getId(), PaymentStatus.PAID);

                    // Gửi email thông báo thanh toán thành công
                    // try {
                    // paymentOrderService.sendOrderConfirmationEmail(order.getUser(), order);
                    // } catch (Exception e) {
                    // System.err.println("Không thể gửi email xác nhận: " + e.getMessage());
                    // }
                }

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Thanh toán thành công",
                        "orderId", order.getId(),
                        "orderStatus", order.getStatus().toString(),
                        "paymentStatus", order.getPaymentStatus().toString()));
            } else {
                // Cập nhật trạng thái thanh toán thất bại
                order = orderService.updatePaymentStatus(order.getId(), PaymentStatus.FAILED);

                // Mô tả lỗi
                String errorDescription = getVNPayErrorDescription(responseCode);
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Thanh toán thất bại: " + errorDescription,
                        "errorCode", responseCode,
                        "orderId", order.getId(),
                        "orderStatus", order.getStatus().toString(),
                        "paymentStatus", order.getPaymentStatus().toString()));
            }
        } catch (Exception e) {
            System.err.println("Lỗi xử lý callback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Lỗi xử lý callback: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-callback")
    public ResponseEntity<Object> verifyCallbackPost(
            @RequestBody Map<String, String> requestBody) {
        // Chuyển đổi tham số từ POST request
        String responseCode = requestBody.get("vnp_ResponseCode");
        String txnRef = requestBody.get("vnp_TxnRef");
        String amount = requestBody.get("vnp_Amount");
        String transactionNo = requestBody.get("vnp_TransactionNo");
        String errorCode = requestBody.get("code");

        // Dùng lại endpoint GET
        return verifyCallback(responseCode, txnRef, amount, transactionNo, errorCode);
    }

    /**
     * Get descriptive error message for VNPay error codes
     */
    private String getVNPayErrorDescription(String errorCode) {
        Map<String, String> errorDescriptions = new HashMap<>();
        errorDescriptions.put("01", "Giao dịch đã tồn tại");
        errorDescriptions.put("02", "Merchant không hợp lệ");
        errorDescriptions.put("03", "Dữ liệu gửi sang không đúng định dạng");
        errorDescriptions.put("04", "Khởi tạo GD không thành công do Website đang bị tạm khóa");
        errorDescriptions.put("08", "Hệ thống đang bảo trì");
        errorDescriptions.put("13",
                "Giao dịch không thành công do quý khách nhập sai mật khẩu thanh toán quá số lần quy định");
        errorDescriptions.put("24", "Giao dịch bị hủy");
        errorDescriptions.put("75", "Ngân hàng thanh toán đang bảo trì");
        errorDescriptions.put("76", "Ngân hàng thanh toán không hỗ trợ phương thức thanh toán này");
        errorDescriptions.put("99",
                "Có lỗi xảy ra trong quá trình xử lý. Có thể do thời gian giao dịch, thông tin merchant, hoặc thông tin kết nối không chính xác");

        String description = errorDescriptions.get(errorCode);
        if (description == null) {
            description = "Lỗi không xác định (mã lỗi: " + errorCode + ")";
        }
        return description;
    }

    /**
     * Trang trung gian để redirect đến VNPay
     * Đôi khi VNPay cần được mở trong trang riêng biệt
     */
    @GetMapping("/vnpay-redirect")
    public ResponseEntity<Object> vnpayRedirect(@RequestParam String orderId) {
        try {
            Order order = orderService.findByPaymentRef(orderId);
            if (order == null) {
                try {
                    Long id = Long.parseLong(orderId);
                    Optional<Order> orderOpt = orderService.fetchOrderById(id);
                    if (orderOpt.isPresent()) {
                        order = orderOpt.get();
                    }
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }

            if (order != null && order.getPaymentUrl() != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "paymentUrl", order.getPaymentUrl()));
            }

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy thông tin thanh toán cho đơn hàng: " + orderId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping("/vnpay-direct")
    public RedirectView vnpayDirect(@RequestParam String orderId, HttpServletRequest request) {
        try {
            System.out.println("VNPay Direct Redirect Request - OrderID: " + orderId);

            Order order = orderService.findByPaymentRef(orderId);
            if (order == null) {
                try {
                    Long id = Long.parseLong(orderId);
                    Optional<Order> orderOpt = orderService.fetchOrderById(id);
                    if (orderOpt.isPresent()) {
                        order = orderOpt.get();
                    }
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }

            if (order != null) {
                // Tạo URL thanh toán mới thay vì sử dụng URL đã lưu
                String ip = vnPayService.getIpAddress(request);
                String vnpUrl = vnPayService.generateVNPayURL(10000, orderId, ip);
                System.out.println("Direct VNPay URL: " + vnpUrl);

                // Lưu URL mới vào đơn hàng
                order.setPaymentUrl(vnpUrl);
                orderService.saveOrder(order);

                return new RedirectView(vnpUrl);
            }

            // Fallback to frontend if order not found
            return new RedirectView("http://localhost:3000/payment-failed?error=Order not found");
        } catch (Exception e) {
            System.err.println("Error in direct VNPay redirect: " + e.getMessage());
            e.printStackTrace();
            return new RedirectView("http://localhost:3000/payment-failed?error=" + e.getMessage());
        }
    }

    /**
     * Direct VNPay payment endpoint that immediately redirects to VNPay
     */
    @GetMapping("/vnpay/pay-direct")
    public RedirectView payDirect(
            @RequestParam String orderId,
            HttpServletRequest request) {

        try {
            System.out.println("Direct VNPay payment request for order: " + orderId);

            // Find the order
            Order order = orderService.findByPaymentRef(orderId);
            if (order == null) {
                try {
                    Long id = Long.parseLong(orderId);
                    Optional<Order> orderOpt = orderService.fetchOrderById(id);
                    if (orderOpt.isPresent()) {
                        order = orderOpt.get();
                    }
                } catch (NumberFormatException e) {
                    // Ignore conversion errors
                }
            }

            if (order == null) {
                System.err.println("Order not found for ID: " + orderId);
                return new RedirectView("http://localhost:3000/payment-failed?error=Order%20not%20found");
            }

            // Process IP address
            String ipAddr = vnPayService.getIpAddress(request);
            System.out.println("Client IP for direct payment: " + ipAddr);

            // Generate VNPay URL - using fixed amount for sandbox testing
            String paymentUrl = vnPayService.generateVNPayURL(10000, orderId, ipAddr);

            // Save the payment URL in the order for reference
            order.setPaymentUrl(paymentUrl);
            orderService.saveOrder(order);

            System.out.println("Redirecting to VNPay: " + paymentUrl);
            return new RedirectView(paymentUrl);

        } catch (Exception e) {
            System.err.println("Error in direct VNPay payment: " + e.getMessage());
            e.printStackTrace();
            return new RedirectView("http://localhost:3000/payment-failed?error=" + e.getMessage());
        }
    }

    /**
     * IPN (Instant Payment Notification) endpoint for VNPay server-to-server
     * callback
     */
    @PostMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIPN(HttpServletRequest request) {
        try {
            // Collect all vnp_ parameters
            Map<String, String> vnp_Params = new HashMap<>();
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames.hasMoreElements()) {
                String paramName = paramNames.nextElement();
                String paramValue = request.getParameter(paramName);
                if (paramValue != null && paramValue.length() > 0 && paramName.startsWith("vnp_")) {
                    vnp_Params.put(paramName, paramValue);
                }
            }

            // Remove hash fields for validation
            String vnp_SecureHash = vnp_Params.remove("vnp_SecureHash");
            vnp_Params.remove("vnp_SecureHashType");

            // Build hash data string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String fieldName = fieldNames.get(i);
                String fieldValue = vnp_Params.get(fieldName);
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (i < fieldNames.size() - 1) {
                    hashData.append('&');
                }
            }

            // Validate secure hash
            String calculatedHash = vnPayService.hmacSHA512(vnPayService.getSecretKey(), hashData.toString());
            if (!calculatedHash.equals(vnp_SecureHash)) {
                // Invalid signature
                return ResponseEntity.badRequest().body("97");
            }

            // Signature valid, process transaction
            String responseCode = vnp_Params.get("vnp_ResponseCode");
            String txnRef = vnp_Params.get("vnp_TxnRef");
            if ("00".equals(responseCode) && txnRef != null) {
                // Update order status to PAID if not already
                Order order = orderService.findByPaymentRef(txnRef);
                if (order != null && order.getPaymentStatus() != PaymentStatus.PAID) {
                    orderService.updatePaymentStatus(order.getId(), PaymentStatus.PAID);
                }
                // Return success to VNPay
                return ResponseEntity.ok("00");
            } else {
                // Payment failed
                if (txnRef != null) {
                    Order order = orderService.findByPaymentRef(txnRef);
                    if (order != null) {
                        orderService.updatePaymentStatus(order.getId(), PaymentStatus.FAILED);
                    }
                }
                return ResponseEntity.ok("00");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("99");
        }
    }
}