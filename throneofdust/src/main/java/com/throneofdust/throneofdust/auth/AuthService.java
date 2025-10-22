package com.throneofdust.throneofdust.auth;

import com.throneofdust.throneofdust.domain.enums.BuildingType;
import com.throneofdust.throneofdust.game.Building;
import com.throneofdust.throneofdust.game.BuildingRepository;
import com.throneofdust.throneofdust.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BuildingRepository buildingRepository;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtService jwtService, BuildingRepository buildingRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.buildingRepository = buildingRepository;
    }

    @Transactional
    public String register(String username, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }

        Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role r = new Role();
            r.setName("ROLE_USER");
            return roleRepository.save(r);
        });

        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.getRoles().add(userRole);
        user = userRepository.save(user);

        // Seed starting buildings at level 1
        for (BuildingType type : BuildingType.values()) {
            Building b = new Building();
            b.setUser(user);
            b.setType(type);
            b.setLevel(1);
            buildingRepository.save(b);
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_USER");
        return jwtService.generateToken(user.getUsername(), claims);
    }

    public String login(String username, String rawPassword) {
        UserAccount user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_USER");
        return jwtService.generateToken(user.getUsername(), claims);
    }
}


