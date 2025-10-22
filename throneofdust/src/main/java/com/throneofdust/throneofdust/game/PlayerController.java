package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.AuthFacade;
import com.throneofdust.throneofdust.auth.UserAccount;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

record PlayerState(int wood, int stone, int scrap, int gold, List<Building> buildings, List<GameCharacter> characters) {}

@RestController
@RequestMapping("/api/player")
public class PlayerController {

    private final AuthFacade authFacade;
    private final BuildingRepository buildingRepository;
    private final GameCharacterRepository characterRepository;
    private final BuildingService buildingService;

    public PlayerController(AuthFacade authFacade, BuildingRepository buildingRepository, GameCharacterRepository characterRepository, BuildingService buildingService) {
        this.authFacade = authFacade;
        this.buildingRepository = buildingRepository;
        this.characterRepository = characterRepository;
        this.buildingService = buildingService;
    }

    @GetMapping("/state")
    public ResponseEntity<PlayerState> state() {
        UserAccount user = authFacade.currentUser();
        var buildings = buildingRepository.findByUser(user);
        var characters = characterRepository.findByUser(user);
        return ResponseEntity.ok(new PlayerState(user.getWood(), user.getStone(), user.getScrap(), user.getGold(), buildings, characters));
    }

    @PostMapping("/collect")
    public ResponseEntity<CollectResponse> collect() {
        var user = authFacade.currentUser();
        var res = buildingService.collectAll(user);
        return ResponseEntity.ok(new CollectResponse(res.wood(), res.stone(), res.scrap(), res.gold()));
    }
}


