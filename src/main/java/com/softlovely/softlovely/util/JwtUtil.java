package com.softlovely.softlovely.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:your_jwt_secret_key_change_this_in_production}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    public String generateToken(String userId, String email) {
        // Simple JWT generation without external library for now
        // In production, use proper JWT library
        long expirationTime = System.currentTimeMillis() + jwtExpirationMs;
        String payload = userId + "|" + email + "|" + expirationTime;
        return Base64.getEncoder().encodeToString(payload.getBytes());
    }

    public String getUserIdFromJwt(String token) {
        try {
            String payload = new String(Base64.getDecoder().decode(token));
            String[] parts = payload.split("\\|");
            return parts[0];
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateJwt(String token) {
        try {
            String payload = new String(Base64.getDecoder().decode(token));
            String[] parts = payload.split("\\|");
            if (parts.length != 3) return false;
            long expirationTime = Long.parseLong(parts[2]);
            return System.currentTimeMillis() < expirationTime;
        } catch (Exception e) {
            return false;
        }
    }
}

