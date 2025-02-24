package com.example.cosmeticsshop.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.request.AccountUpdateRequestDTO;
import com.example.cosmeticsshop.domain.request.ChangePasswordDTO;
import com.example.cosmeticsshop.domain.request.ReqLoginDTO;
import com.example.cosmeticsshop.domain.request.UserCreateRequestDTO;
import com.example.cosmeticsshop.domain.response.ResCreateUserDTO;
import com.example.cosmeticsshop.domain.response.ResLoginDTO;
import com.example.cosmeticsshop.service.UserService;
import com.example.cosmeticsshop.util.SecurityUtil;
import com.example.cosmeticsshop.util.annotation.ApiMessage;
import com.example.cosmeticsshop.util.error.IdInvalidException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${btljava.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder,
            SecurityUtil securityUtil, UserService userService, PasswordEncoder passwordEncoder) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody ReqLoginDTO loginDto) {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDto.getUsername(), loginDto.getPassword());

        // xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManagerBuilder.getObject()
                .authenticate(authenticationToken);

        // set thông tin người dùng đăng nhập vào context (có thể sử dụng sau này)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(loginDto.getUsername());
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAvatarUrl(),
                    currentUserDB.getRole().getId(),
                    currentUserDB.getRoyalty(),
                    currentUserDB.getTotalMoneySpent(),
                    currentUserDB.getTotalOrder(),
                    currentUserDB.getPhone());
            res.setUser(userLogin);
        }

        // create access token
        String access_token = this.securityUtil.createAccessToken(authentication.getName(), res.getUser());
        res.setAccessToken(access_token);

        // create refresh token
        String refresh_token = this.securityUtil.createRefreshToken(loginDto.getUsername(), res);

        // update user
        this.userService.updateUserToken(refresh_token, loginDto.getUsername());

        // set cookies
        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    @GetMapping("/auth/account")
    @ApiMessage("fetch account")
    public ResponseEntity<ResLoginDTO.UserGetAccount> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();
        ResLoginDTO.UserGetAccount userGetAccount = new ResLoginDTO.UserGetAccount();

        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());
            userLogin.setAvatar(currentUserDB.getAvatarUrl());
            userLogin.setRoyalty(currentUserDB.getRoyalty());
            userLogin.setTotalMoneySpent(currentUserDB.getTotalMoneySpent());
            userLogin.setTotalOrder(currentUserDB.getTotalOrder());
            userLogin.setRoleId(currentUserDB.getRole().getId());
            userLogin.setPhone(currentUserDB.getPhone());
            userGetAccount.setUser(userLogin);
        }

        return ResponseEntity.ok().body(userGetAccount);
    }

    @PutMapping("/auth/account")
    @ApiMessage("Update account")
    public ResponseEntity<ResLoginDTO.UserGetAccount> updateAccount(@Valid @RequestBody AccountUpdateRequestDTO user) {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
        if (currentUserDB != null) {
            currentUserDB.setName(user.getFullName());
            currentUserDB.setAddress(user.getAddress());
            currentUserDB.setAvatarUrl(user.getAvatar());
            currentUserDB.setBio(user.getBio());
            this.userService.handleUpdateUser(currentUserDB);
        }

        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();
        ResLoginDTO.UserGetAccount userGetAccount = new ResLoginDTO.UserGetAccount();

        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());
            userLogin.setRoleId(currentUserDB.getRole().getId());
            userGetAccount.setUser(userLogin);
        }

        return ResponseEntity.ok().body(userGetAccount);
    }

    @GetMapping("/auth/refresh")
    @ApiMessage("Get User by refresh token")
    public ResponseEntity<ResLoginDTO> getRefreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "abc") String refresh_token) throws IdInvalidException {
        if (refresh_token.equals("abc")) {
            throw new IdInvalidException("Bạn không có refresh token ở cookie");
        }
        // check valid
        Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refresh_token);
        String email = decodedToken.getSubject();

        // check user by token + email
        User currentUser = this.userService.getUserByRefreshTokenAndEmail(refresh_token, email);
        if (currentUser == null) {
            throw new IdInvalidException("Refresh Token không hợp lệ");
        }

        // issue new token/set refresh token as cookies
        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsernameOrEmail(email);
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAvatarUrl(),
                    currentUserDB.getRole().getId(),
                    currentUserDB.getRoyalty(),
                    currentUserDB.getTotalMoneySpent(),
                    currentUserDB.getTotalOrder(),
                    currentUserDB.getPhone());
            res.setUser(userLogin);
        }

        // create access token
        String access_token = this.securityUtil.createAccessToken(email, res.getUser());
        res.setAccessToken(access_token);

        // create refresh token
        String new_refresh_token = this.securityUtil.createRefreshToken(email, res);

        // update user
        this.userService.updateUserToken(new_refresh_token, email);

        // set cookies
        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", new_refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    @PostMapping("/auth/logout")
    @ApiMessage("Logout User")
    public ResponseEntity<Void> logout() throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";

        if (email.equals("")) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }

        // update refresh token = null
        this.userService.updateUserToken(null, email);

        // remove refresh token cookie
        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(null);

    }

    @PostMapping("/auth/register")
    @ApiMessage("Register a new user")
    public ResponseEntity<ResCreateUserDTO> register(@Valid @RequestBody UserCreateRequestDTO userCreateRequestDTO)
            throws IdInvalidException {
        boolean isEmailExist = this.userService.isEmailExist(userCreateRequestDTO.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + userCreateRequestDTO.getEmail() + "đã tồn tại, vui lòng sử dụng email khác.");
        }

        String hashPassword = this.passwordEncoder.encode(userCreateRequestDTO.getPassword());
        userCreateRequestDTO.setPassword(hashPassword);
        // convert to User
        User user = new User();
        user.setUsername(userCreateRequestDTO.getUsername());
        user.setEmail(userCreateRequestDTO.getEmail());
        user.setPasswordHash(userCreateRequestDTO.getPassword());
        user.setName(userCreateRequestDTO.getName());
        user.setAddress(userCreateRequestDTO.getAddress());
        user.setAvatarUrl(userCreateRequestDTO.getAvatar());
        user.setBio(userCreateRequestDTO.getBio());
        user.setAge(userCreateRequestDTO.getAge());
        UserCreateRequestDTO userCreateRequest = this.userService.convertToUserCreateRequestDTO(user);
        User ericUser = this.userService.handleCreateUser(userCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.convertToResCreateUserDTO(ericUser));
    }

    @PostMapping("/auth/change-password")
    @ApiMessage("Change password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO)
            throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUser = this.userService.handleGetUserByUsernameOrEmail(email);
        if (currentUser == null) {
            throw new IdInvalidException("User không tồn tại");
        }
        if (!this.passwordEncoder.matches(changePasswordDTO.getOldPassword(), currentUser.getPasswordHash())) {
            throw new IdInvalidException("Mật khẩu cũ không đúng");
        }
        String hashPassword = this.passwordEncoder.encode(changePasswordDTO.getNewPassword());
        currentUser.setPasswordHash(hashPassword);
        this.userService.handleUpdateUser(currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/forgot-password")
    @ApiMessage("Forgot password")
    public ResponseEntity<Void> forgotPassword() {
        return ResponseEntity.ok().body(null);
    }

}
