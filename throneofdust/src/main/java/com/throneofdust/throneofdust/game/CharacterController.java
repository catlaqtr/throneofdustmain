package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.AuthFacade;
import com.throneofdust.throneofdust.domain.enums.TraitType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record AddTraitRequest(TraitType trait) {}

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final AuthFacade authFacade;
    private final CharacterService characterService;

    public CharacterController(AuthFacade authFacade, CharacterService characterService) {
        this.authFacade = authFacade;
        this.characterService = characterService;
    }

    @PostMapping("/{id}/traits")
    public ResponseEntity<GameCharacter> addTrait(@PathVariable Long id, @RequestBody AddTraitRequest request) {
        var user = authFacade.currentUser();
        var updated = characterService.addTrait(user, id, request.trait());
        return ResponseEntity.ok(updated);
    }
}


