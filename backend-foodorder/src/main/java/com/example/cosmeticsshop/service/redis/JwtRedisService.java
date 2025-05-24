package com.example.cosmeticsshop.service.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.Security;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.util.SecurityUtil;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtRedisService {

    private final RedisTemplate<String, String> redisTemplate;

    private final SecurityUtil securityUtils;

    private final String REFRESH_TOKEN_ID_NAME = "refresh_token_id";

    public boolean isRefreshTokenValid(String username, String token) {
        String tokenId = securityUtils.getTokenId(token);
        try {
            String curTokenId = (String) redisTemplate.opsForHash().get(username, REFRESH_TOKEN_ID_NAME);
            return tokenId.equals(curTokenId);
        } catch (Exception e) {
            log.info("Redis isn't working");
            return false;
        }
    }

    public void setNewRefreshToken(String username, String token) {
        String tokenId = securityUtils.getTokenId(token);
        if (tokenId == null) {
            return;
        }
        // set new tokenId to redis
        try {
            redisTemplate.opsForHash().put(username, REFRESH_TOKEN_ID_NAME, tokenId);
        } catch (Exception e) {
            log.info("Redis isn't working");
        }
    }

    public void deleteRefreshToken(String username) {
        try {
            redisTemplate.opsForHash().delete(username, REFRESH_TOKEN_ID_NAME);
        } catch (Exception e) {
            log.info("Redis isn't working");
        }
    }

}
