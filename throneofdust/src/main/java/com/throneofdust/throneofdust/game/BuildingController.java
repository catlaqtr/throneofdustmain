package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.AuthFacade;
import com.throneofdust.throneofdust.domain.enums.BuildingType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record UpgradeResponse(int newLevel, int goldRemaining) {}

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final AuthFacade authFacade;
    private final BuildingService buildingService;

    public BuildingController(AuthFacade authFacade, BuildingService buildingService) {
        this.authFacade = authFacade;
        this.buildingService = buildingService;
    }

    @PostMapping("/{type}/collect")
    public ResponseEntity<CollectResponse> collect(@PathVariable("type") BuildingType type) {
        var user = authFacade.currentUser();
        var res = buildingService.collectAll(user);
        return ResponseEntity.ok(new CollectResponse(res.wood(), res.stone(), res.scrap(), res.gold()));
    }

    @PostMapping("/{type}/upgrade")
    public ResponseEntity<?> upgrade(@PathVariable("type") BuildingType type) {
        var user = authFacade.currentUser();
        var result = buildingService.upgrade(user, type);
        
        if (result instanceof BuildingUpgradeResult.Success success) {
            return ResponseEntity.ok(new UpgradeResponse(success.newLevel(), success.remainingGold()));
        } else if (result instanceof BuildingUpgradeResult.InsufficientResources insufficient) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(insufficient.message()));
        } else if (result instanceof BuildingUpgradeResult.MaxLevelReached maxLevel) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(maxLevel.message()));
        }
        
        return ResponseEntity.internalServerError().body(ErrorResponse.of("An unexpected error occurred"));
    }
}


