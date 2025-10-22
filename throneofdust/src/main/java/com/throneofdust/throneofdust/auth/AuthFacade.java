package com.throneofdust.throneofdust.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthFacade {

    private final UserRepository userRepository;

    public AuthFacade(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No authenticated user");
        }
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }
}


