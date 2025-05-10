package com.example.cosmeticsshop.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.domain.History;
import com.example.cosmeticsshop.domain.PasswordResetToken;
import com.example.cosmeticsshop.domain.Role;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.request.ReqUpdateUser;
import com.example.cosmeticsshop.domain.request.UserCreateRequestDTO;
import com.example.cosmeticsshop.domain.response.ResCreateUserDTO;
import com.example.cosmeticsshop.domain.response.ResUpdateUserDTO;
import com.example.cosmeticsshop.domain.response.ResUserDTO;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;

import com.example.cosmeticsshop.repository.PasswordResetTokenRepository;
import com.example.cosmeticsshop.repository.RoleRepository;
import com.example.cosmeticsshop.repository.UserRepository;
import com.example.cosmeticsshop.repository.WishListRepository;
import com.example.cosmeticsshop.util.constant.RoyaltyEnum;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final WishListRepository wishListRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleService roleService,
            RoleRepository roleRepository,
            PasswordResetTokenRepository tokenRepository,
            WishListRepository wishListRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.roleRepository = roleRepository;
        this.tokenRepository = tokenRepository;
        this.wishListRepository = wishListRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User handleCreateUser(UserCreateRequestDTO user) {
        // check role
        Role userRole = this.roleRepository.findByName("USER");
        if (userRole != null && user.getRole() == null) {
            user.setRole(userRole); // Gán Role mặc định cho User nếu chưa có role
        }
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setName(user.getName());
        newUser.setPasswordHash(user.getPassword());
        newUser.setAddress(user.getAddress());
        newUser.setPhone(user.getPhone());
        newUser.setRole(user.getRole());
        newUser.setAge(user.getAge());
        newUser.setAvatarUrl(user.getAvatar());
        newUser.setBio(user.getBio());
        newUser.setUsername(user.getUsername());
        return this.userRepository.save(newUser);
    }

    public UserCreateRequestDTO convertToUserCreateRequestDTO(User user) {
        UserCreateRequestDTO res = new UserCreateRequestDTO();
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setPassword(user.getPasswordHash());
        res.setAddress(user.getAddress());
        res.setPhone(user.getPhone());
        res.setRole(user.getRole());
        res.setAge(user.getAge());
        res.setAvatar(user.getAvatarUrl());
        res.setBio(user.getBio());
        res.setUsername(user.getUsername());
        return res;
    }

    @Transactional
    public void handleDeleteUser(long id) {
        User user = this.fetchUserById(id);
        if (user != null) {
            // 1. Delete password reset tokens associated with the user
            Optional<PasswordResetToken> tokenOpt = this.tokenRepository.findByUser(user);
            if (tokenOpt.isPresent()) {
                this.tokenRepository.delete(tokenOpt.get());
            }

            // 3. Delete user's wishlist items
            this.wishListRepository.deleteAllByUser(user);

            // 4. Handle histories and related orders
            if (user.getHistories() != null && !user.getHistories().isEmpty()) {
                for (History history : user.getHistories()) {
                    // Clear orders related to the history
                    if (history.getOrders() != null) {
                        history.getOrders().clear();
                    }
                }
                // First detach histories from user to avoid cascading issues
                user.setHistories(new ArrayList<>());
                this.userRepository.save(user);
            }

            // 5. Finally delete the user
            this.userRepository.deleteById(id);

            log.info("User with ID {} has been deleted along with related records", id);
        }
    }

    public User fetchUserById(long id) {
        Optional<User> userOptional = this.userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }

    public ResultPaginationDTO fetchAllUser(Specification<User> spec, Pageable pageable) {
        Page<User> pageUser = this.userRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResUserDTO> listUser = pageUser.getContent()
                .stream().map(item -> this.convertToResUserDTO(item))
                .collect(Collectors.toList());

        rs.setResult(listUser);

        return rs;
    }

    public User handleUpdateUser(User reqUser) {
        User currentUser = this.fetchUserById(reqUser.getId());
        if (currentUser != null) {
            currentUser.setAddress(reqUser.getAddress());
            currentUser.setName(reqUser.getName());
            currentUser.setPhone(reqUser.getPhone());
            // update
            currentUser = this.userRepository.save(currentUser);
        }
        if (reqUser.getRole() != null) {
            Role r = this.roleService.fetchById(reqUser.getRole().getId());
            currentUser.setRole(r != null ? r : null);
        }
        return currentUser;
    }

    public User handleGetUserByUsernameOrEmail(String username) {
        User user = this.userRepository.findByEmail(username);
        if (user == null) {
            user = this.userRepository.findByUsername(username);
        }
        return user;
    }

    @Transactional
    public void savePasswordResetToken(User user, String token) {
        // Kiểm tra xem user đã có token trước đó chưa
        Optional<PasswordResetToken> existingToken = tokenRepository.findByUser(user);
        if (existingToken.isPresent()) {
            // Cập nhật token và thời gian hết hạn mới
            PasswordResetToken resetToken = existingToken.get();
            resetToken.setToken(token);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
            tokenRepository.save(resetToken);
        } else {
            // Tạo token mới
            PasswordResetToken newToken = new PasswordResetToken();
            newToken.setUser(user);
            newToken.setToken(token);
            newToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
            tokenRepository.save(newToken);
        }
    }

    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }

    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO res = new ResCreateUserDTO();

        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setCreatedAt(user.getCreatedAt());
        res.setAddress(user.getAddress());
        return res;
    }

    public ResUpdateUserDTO convertToResUpdateUserDTO(User user) {
        ResUpdateUserDTO res = new ResUpdateUserDTO();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setAddress(user.getAddress());
        return res;
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO res = new ResUserDTO();
        ResUserDTO.RoleDTO roleUser = new ResUserDTO.RoleDTO();

        if (user.getRole() != null) {
            roleUser.setId(user.getRole().getId());
            roleUser.setRoleName(user.getRole().getName());
            res.setRole(roleUser);
        }
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setPhone(user.getPhone());
        res.setAvatarUrl(user.getAvatarUrl());
        res.setBio(user.getBio());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setCreatedAt(user.getCreatedAt());
        res.setAddress(user.getAddress());
        res.setRoyalty(user.getRoyalty());
        res.setTotalMoneySpent(user.getTotalMoneySpent());
        res.setTotalOrder(user.getTotalOrder());
        return res;
    }

    public void updateUserToken(String token, String email) {
        User currentUser = this.userRepository.findByEmail(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userRepository.findByRefreshTokenAndEmail(token, email);
    }

    public User fetchUserByEmail(String email) {
        return this.userRepository.findByEmail(email);
    }

    public User handleUpdateAccount(ReqUpdateUser user, User newUser) {
        if (newUser != null) {
            newUser.setName(user.getName());
            newUser.setPhone(user.getPhone());
            newUser.setAvatarUrl(user.getAvatar());
            return this.userRepository.save(newUser);
        }
        return null;
    }

    // Cập nhật phương thức updateUserPin để mã hóa PIN
    public User updateUserPin(String pin, Long userId) {
        User existingUser = this.userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // Only users with role_id 1 can have PINs
        if (existingUser.getRole() != null && existingUser.getRole().getId() == 1) {
            // Mã hóa PIN trước khi lưu vào database
            String hashedPin = this.passwordEncoder.encode(pin);
            existingUser.setPin(hashedPin);
            return this.userRepository.save(existingUser);
        } else {
            throw new RuntimeException("Chỉ tài khoản admin (role_id = 1) mới cần PIN");
        }
    }

    /**
     * Kiểm tra PIN có khớp với PIN đã lưu trong database không
     * Hỗ trợ cả PIN đã mã hóa và chưa mã hóa (trong giai đoạn chuyển tiếp)
     */
    public boolean verifyPin(String rawPin, String storedPin) {
        if (rawPin == null || storedPin == null) {
            return false;
        }

        // Trường hợp 1: PIN đã được mã hóa - sử dụng matcher của Spring Security
        if (this.passwordEncoder.matches(rawPin, storedPin)) {
            return true;
        }

        // Trường hợp 2: PIN chưa được mã hóa - so sánh trực tiếp (hỗ trợ cho dữ liệu
        // cũ)
        if (rawPin.equals(storedPin)) {
            return true;
        }

        return false;
    }

    // Create a user from a User entity (for Google login)
    public User createUser(User user) {
        // Set default role if not set
        if (user.getRole() == null) {
            Role defaultRole = roleRepository.findById(2L).orElse(null); // Assuming 2 is the default user role
            user.setRole(defaultRole);
        }

        // Set default royalty if not set
        if (user.getRoyalty() == null) {
            user.setRoyalty(RoyaltyEnum.BRONZE);
        }

        return userRepository.save(user);
    }

    /**
     * Tìm tất cả người dùng có vai trò admin (role_id = 1)
     * 
     * @return Danh sách các admin users
     */
    public List<User> findAllAdminUsers() {
        return userRepository.findByRoleId(1L);
    }

}
