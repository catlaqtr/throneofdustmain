package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.AuthFacade;
import com.throneofdust.throneofdust.domain.enums.RaidMapTemplate;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

record StartRaidRequest(@NotNull RaidMapTemplate map, @NotEmpty List<Long> memberIds, boolean allyMode) {}

@RestController
@RequestMapping("/api/raids")
public class RaidController {

    private final AuthFacade authFacade;
    private final RaidService raidService;

    public RaidController(AuthFacade authFacade, RaidService raidService) {
        this.authFacade = authFacade;
        this.raidService = raidService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> start(@RequestBody StartRaidRequest req) {
        try {
            var user = authFacade.currentUser();
            var raid = raidService.startRaid(user, req.map(), req.memberIds(), req.allyMode());
            return ResponseEntity.ok(raid);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Raid> resolve(@PathVariable Long id) {
        var user = authFacade.currentUser();
        var raid = raidService.resolveRaid(user, id);
        return ResponseEntity.ok(raid);
    }

    @GetMapping
    public ResponseEntity<List<Raid>> list() {
        var user = authFacade.currentUser();
        return ResponseEntity.ok(raidService.list(user));
    }
}


