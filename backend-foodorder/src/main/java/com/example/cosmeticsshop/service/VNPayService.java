package com.example.cosmeticsshop.service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class VNPayService {

    @Value("${hoidanit.vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${hoidanit.vnpay.hash-secret}")
    private String secretKey;

    @Value("${hoidanit.vnpay.vnp-return-url}")
    private String vnp_ReturnUrl;

    @Value("${hoidanit.vnpay.vnp-url}")
    private String vnp_PayUrl;

    // Hằng số để sandbox test
    private static final String TEST_BANK_CODE = "NCB";
    private static final double MAX_TEST_AMOUNT = 10000000;

    public String generateVNPayURL(double amountDouble, String paymentRef, String ip, String bankCode)
            throws UnsupportedEncodingException {

        System.out.println("========== VNPay Debug Info ==========");
        System.out.println("Original Amount: " + amountDouble);
        System.out.println("Order Ref: " + paymentRef);
        System.out.println("Client IP: " + ip);

        // In sandbox, cap amount to MAX_TEST_AMOUNT (10,000 VND) but do not override
        // smaller amounts
        if (amountDouble > MAX_TEST_AMOUNT) {
            amountDouble = MAX_TEST_AMOUNT;
            System.out.println("Amount reduced to max sandbox test amount: " + MAX_TEST_AMOUNT);
        } else {
            System.out.println("Using actual amount for sandbox: " + amountDouble);
        }

        // Validate input data
        if (paymentRef == null || paymentRef.trim().isEmpty()) {
            throw new IllegalArgumentException("Payment reference cannot be empty");
        }

        if (ip == null || ip.trim().isEmpty()) {
            ip = "127.0.0.1";
        }

        // Basic parameters
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";

        // Convert currency (VND) - integer amount in cents
        long amount = Math.round(amountDouble * 100);

        // Process transaction reference - ensure no special characters
        String vnp_TxnRef = paymentRef.replaceAll("[^a-zA-Z0-9]", "");
        if (vnp_TxnRef.length() > 100) {
            vnp_TxnRef = vnp_TxnRef.substring(0, 100);
        }

        // Process IP address
        String vnp_IpAddr = ip;
        if (vnp_IpAddr.equals("0:0:0:0:0:0:0:1") ||
                vnp_IpAddr.equals("::1") ||
                vnp_IpAddr.equals("localhost")) {
            vnp_IpAddr = "127.0.0.1";
        }

        // Initialize parameters map
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        // In sandbox, use QR payment by default or provided bankCode
        // String codeToUse = (bankCode != null && !bankCode.trim().isEmpty()) ?
        // bankCode : "VNPAYQR";
        // vnp_Params.put("vnp_BankCode", codeToUse);

        // Order information
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        // Time handling - use proper GMT+7 timezone
        TimeZone gmt7 = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        Calendar cld = Calendar.getInstance(gmt7);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(gmt7);
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        System.out.println("Create Date: " + cld.getTime() + " -> " + vnp_CreateDate);

        // Expiration time (2 hours ahead)
        cld.add(Calendar.HOUR_OF_DAY, 2);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        System.out.println("Expire Date: " + vnp_ExpireDate);

        // Create hash string
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                // Build hash data
                hashData.append(fieldName).append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        // Create HMAC SHA512 signature
        String vnp_SecureHash = hmacSHA512(secretKey, hashData.toString());
        String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_PayUrl + "?" + queryUrl;

        System.out.println("Hash Data: " + hashData.toString());
        System.out.println("Secure Hash: " + vnp_SecureHash);
        System.out.println("VNPay URL generated: " + paymentUrl);
        System.out.println("====================================");

        return paymentUrl;
    }

    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }

            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }

            return sb.toString();
        } catch (Exception ex) {
            System.err.println("Lỗi tạo HMAC: " + ex.getMessage());
            ex.printStackTrace();
            return "";
        }
    }

    public String getIpAddress(HttpServletRequest request) {
        String ipAddress;

        // Check for X-Forwarded-For header first (for clients behind proxy/load
        // balancer)
        ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }

        // Handle multiple IPs in X-Forwarded-For (take the first one)
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        // Handle IPv6 localhost
        if (ipAddress != null &&
                (ipAddress.equals("0:0:0:0:0:0:0:1") || ipAddress.equals("::1") || ipAddress.equals("localhost"))) {
            ipAddress = "127.0.0.1";
        }

        System.out.println("Client IP determined as: " + ipAddress);
        return ipAddress;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String generateVNPayURL(double amountDouble, String paymentRef, String ip)
            throws UnsupportedEncodingException {
        return generateVNPayURL(amountDouble, paymentRef, ip, null);
    }
}
