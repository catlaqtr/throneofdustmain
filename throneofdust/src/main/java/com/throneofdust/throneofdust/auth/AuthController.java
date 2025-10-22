package com.throneofdust.throneofdust.auth;

import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record AuthRequest(@NotBlank String username, @NotBlank String password) {}
record AuthResponse(String token) {}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        String token = authService.register(request.username(), request.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        String token = authService.login(request.username(), request.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}


