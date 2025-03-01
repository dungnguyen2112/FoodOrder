package com.example.foodorder.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.foodorder.domain.Role;
import com.example.foodorder.domain.User;
import com.example.foodorder.repository.RoleRepository;
import com.example.foodorder.repository.UserRepository;
import com.example.foodorder.util.constant.GenderEnum;

@Service
public class DatabaseInitializer implements CommandLineRunner {
        private final RoleRepository roleRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        public DatabaseInitializer(
                        RoleRepository roleRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
                this.roleRepository = roleRepository;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) throws Exception {
                System.out.println(">>> START INIT DATABASE");
                long countRoles = this.roleRepository.count();
                long countUsers = this.userRepository.count();

                if (countRoles == 0) {
                        // Tạo role SUPER_ADMIN với toàn bộ quyền
                        Role adminRole = new Role();
                        adminRole.setName("SUPER_ADMIN");
                        adminRole.setDescription("Admin có toàn quyền");
                        adminRole.setActive(true);
                        this.roleRepository.save(adminRole);

                        // Tạo role USER và gán quyền đã lọc
                        Role userRole = new Role();
                        userRole.setName("USER");
                        userRole.setDescription("Người dùng thông thường");
                        userRole.setActive(true);
                        this.roleRepository.save(userRole);
                }

                if (countUsers == 0) {
                        User adminUser = new User();
                        adminUser.setUsername("admin");
                        adminUser.setEmail("admin@gmail.com");
                        adminUser.setAddress("hn");
                        adminUser.setAge(25);
                        adminUser.setGender(GenderEnum.MALE);
                        adminUser.setName("I'm super admin");
                        adminUser.setPasswordHash(this.passwordEncoder.encode("123456"));

                        Role adminRole = this.roleRepository.findByName("SUPER_ADMIN");
                        if (adminRole != null) {
                                adminUser.setRole(adminRole);
                        }

                        this.userRepository.save(adminUser);
                }

                if (countRoles > 0 && countUsers > 0) {
                        System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
                } else
                        System.out.println(">>> END INIT DATABASE");
        }

}
