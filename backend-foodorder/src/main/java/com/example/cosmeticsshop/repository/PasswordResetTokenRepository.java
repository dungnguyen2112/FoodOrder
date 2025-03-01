package com.example.cosmeticsshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.cosmeticsshop.domain.PasswordResetToken;
import com.example.cosmeticsshop.domain.User;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUser(User user);
}
