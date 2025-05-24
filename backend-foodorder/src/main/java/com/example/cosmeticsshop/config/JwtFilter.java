package com.example.cosmeticsshop.config;

import com.example.cosmeticsshop.util.SecurityUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final SecurityUtil securityUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Request Method: {}", request.getMethod());
        log.info("Authorization header: {}", authHeader);

        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        log.info("Extracted token: {}", token != null ? "present" : "null");

        if (token != null && securityUtil.isTokenValid(token)) {
            log.info("Token is valid, getting authentication");
            Authentication authentication = securityUtil.getAuthentication(token);
            if (authentication != null && authentication.isAuthenticated()) {
                log.info("Setting authentication for user: {}", authentication.getPrincipal());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Authentication set successfully");
            } else {
                log.error("Failed to get authentication from token or authentication is not valid");
            }
        } else {
            log.warn("Token is invalid or not present");
        }

        filterChain.doFilter(request, response);
    }

}