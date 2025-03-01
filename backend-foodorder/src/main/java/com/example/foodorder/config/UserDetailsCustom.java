package com.example.foodorder.config;

import java.util.Collections;

import org.hibernate.internal.util.collections.ConcurrentReferenceHashMap.Option;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.example.foodorder.service.UserService;
import com.example.foodorder.util.SecurityUtil;

import java.util.Optional;

@Component("userDetailsService")
public class UserDetailsCustom implements UserDetailsService {

    private final UserService userService;
    private final SecurityUtil securityUtil;

    public UserDetailsCustom(UserService userService, SecurityUtil securityUtil) {
        this.userService = userService;
        this.securityUtil = securityUtil;
    }

    // get Current User
    public com.example.foodorder.domain.User getCurrentUser() {
        Optional<String> currentUser = securityUtil.getCurrentUserLogin();
        com.example.foodorder.domain.User user = userService.handleGetUserByUsernameOrEmail(currentUser.get());
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.example.foodorder.domain.User user = userService.handleGetUserByUsernameOrEmail(username);
        if (user == null) {
            throw new UsernameNotFoundException("Username/password không hợp lệ");
        }

        return new User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

    }

}
