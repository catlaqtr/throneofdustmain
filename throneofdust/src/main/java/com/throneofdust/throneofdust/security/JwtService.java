package com.throneofdust.throneofdust.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration-ms}") long expirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(toBase64(secret)));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username, Map<String, Object> claims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return getAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        try {
            String username = extractUsername(token);
            boolean isValid = username.equals(expectedUsername) && !isExpired(token);
            if (!isValid) {
            }
            return isValid;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isExpired(String token) {
        return getAllClaims(token).getExpiration().before(new Date());
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private static String toBase64(String secret) {
        // Ensure the secret is treated as base64; if it's not already, encode bytes to base64
        try {
            Decoders.BASE64.decode(secret);
            return secret; // already base64
        } catch (IllegalArgumentException ex) {
            return java.util.Base64.getEncoder().encodeToString(secret.getBytes());
        }
    }
}


