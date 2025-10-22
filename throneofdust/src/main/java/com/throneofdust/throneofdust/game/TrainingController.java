package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.AuthFacade;
import com.throneofdust.throneofdust.domain.enums.CharacterClass;
import com.throneofdust.throneofdust.domain.enums.TraitType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

record RecruitRequest(CharacterClass characterClass, Set<TraitType> traits) {}

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    private final AuthFacade authFacade;
    private final TrainingService trainingService;

    public TrainingController(AuthFacade authFacade, TrainingService trainingService) {
        this.authFacade = authFacade;
        this.trainingService = trainingService;
    }

    @PostMapping("/recruit")
    public ResponseEntity<?> recruit(@RequestBody(required = false) RecruitRequest request) {
        var user = authFacade.currentUser();
        var result = trainingService.recruit(user, request != null ? request.characterClass() : null, request != null ? request.traits() : null);
        
        if (result instanceof RecruitmentResult.Success success) {
            return ResponseEntity.ok(success.character());
        } else if (result instanceof RecruitmentResult.InsufficientResources insufficient) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(insufficient.message()));
        } else if (result instanceof RecruitmentResult.RosterLimitReached limit) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(limit.message()));
        } else if (result instanceof RecruitmentResult.OnCooldown cooldown) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(cooldown.message()));
        }
        
        return ResponseEntity.internalServerError().body(ErrorResponse.of("An unexpected error occurred"));
    }
}


