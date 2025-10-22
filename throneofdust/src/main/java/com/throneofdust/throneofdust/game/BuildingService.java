package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.auth.UserRepository;
import com.throneofdust.throneofdust.domain.enums.BuildingType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final UserRepository userRepository;

    public BuildingService(BuildingRepository buildingRepository, UserRepository userRepository) {
        this.buildingRepository = buildingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CollectResult collect(UserAccount user, BuildingType type) {
        Building building = buildingRepository.findByUserAndType(user, type).orElseThrow();

        if (!producesResources(type)) {
            return new CollectResult(0, 0, 0, 0);
        }

        long seconds = Math.max(0, Duration.between(building.getLastCollectedAt(), Instant.now()).getSeconds());
        double hours = seconds / 3600.0;

        int producedWood = 0;
        int producedStone = 0;
        int producedScrap = 0;
        int producedGold = 0;
        
        if (type == BuildingType.LUMBER_MILL) {
            producedWood = (int) Math.floor(30.0 * building.getLevel() * hours);
        } else if (type == BuildingType.QUARRY) {
            producedStone = (int) Math.floor(25.0 * building.getLevel() * hours);
        } else if (type == BuildingType.MINE) {
            producedScrap = (int) Math.floor(20.0 * building.getLevel() * hours);
        } else if (type == BuildingType.TREASURY) {
            producedGold = (int) Math.floor(25.0 * building.getLevel() * hours); // Increased from 15.0 to 25.0 for better balance
        }

        int capacity = storageCapacity(user);

        int newWood = Math.min(capacity, user.getWood() + producedWood);
        int newStone = Math.min(capacity, user.getStone() + producedStone);
        int newScrap = Math.min(capacity, user.getScrap() + producedScrap);
        int newGold = user.getGold() + producedGold; // Gold has no storage limit

        int gainedWood = newWood - user.getWood();
        int gainedStone = newStone - user.getStone();
        int gainedScrap = newScrap - user.getScrap();
        int gainedGold = producedGold;

        user.setWood(newWood);
        user.setStone(newStone);
        user.setScrap(newScrap);
        user.setGold(newGold);
        building.setLastCollectedAt(Instant.now());
        buildingRepository.save(building);
        userRepository.save(user);

        return new CollectResult(gainedWood, gainedStone, gainedScrap, gainedGold);
    }

    private Building createDefaultBuilding(UserAccount user, BuildingType type) {
        Building building = new Building();
        building.setUser(user);
        building.setType(type);
        building.setLevel(0);
        building.setRecruitsCount(0);
        building.setLastCollectedAt(Instant.now());
        building.setLastActionAt(Instant.now());
        return buildingRepository.save(building);
    }

    @Transactional
    public BuildingUpgradeResult upgrade(UserAccount user, BuildingType type) {
        Building target = buildingRepository.findByUserAndType(user, type)
            .orElseGet(() -> createDefaultBuilding(user, type));
        Building townHall = buildingRepository.findByUserAndType(user, BuildingType.TOWN_HALL).orElseThrow();

        if (type != BuildingType.TOWN_HALL && target.getLevel() >= townHall.getLevel() + 1) {
            return new BuildingUpgradeResult.MaxLevelReached("Upgrade gated by Town Hall +1");
        }

        int nextLevel = target.getLevel() + 1;
        int woodCost = 40 * nextLevel;    // Reduced from 50 for better balance
        int stoneCost = 35 * nextLevel;   // Reduced from 40 for better balance
        int scrapCost = 15 * nextLevel;   // Reduced from 20 for better balance
        
        if (user.getWood() < woodCost || user.getStone() < stoneCost || user.getScrap() < scrapCost) {
            return new BuildingUpgradeResult.InsufficientResources("Not enough resources");
        }
        
        user.setWood(user.getWood() - woodCost);
        user.setStone(user.getStone() - stoneCost);
        user.setScrap(user.getScrap() - scrapCost);
        target.setLevel(target.getLevel() + 1);
        userRepository.save(user);
        buildingRepository.save(target);
        return new BuildingUpgradeResult.Success(target.getLevel(), user.getGold());
    }

    public int storageCapacity(UserAccount user) {
        Building storehouse = buildingRepository.findByUserAndType(user, BuildingType.STOREHOUSE).orElseThrow();
        return 1500 + storehouse.getLevel() * 750; // Updated to match frontend: base 1500 + 750 per level
    }

    private boolean producesResources(BuildingType type) {
        return type == BuildingType.LUMBER_MILL || type == BuildingType.QUARRY || type == BuildingType.MINE || type == BuildingType.TREASURY;
    }

    public record CollectResult(int wood, int stone, int scrap, int gold) {}

    @Transactional
    public CollectResult collectAll(com.throneofdust.throneofdust.auth.UserAccount user) {
        long seconds = Math.max(0, Duration.between(user.getLastCollectedAt(), Instant.now()).getSeconds());
        double hours = seconds / 3600.0;

        
        int lm = buildingRepository.findByUserAndType(user, BuildingType.LUMBER_MILL).orElseThrow().getLevel();
        int q = buildingRepository.findByUserAndType(user, BuildingType.QUARRY).orElseThrow().getLevel();
        int mine = buildingRepository.findByUserAndType(user, BuildingType.MINE).orElseThrow().getLevel();
        
        var treasuryOpt = buildingRepository.findByUserAndType(user, BuildingType.TREASURY);
        int treasury;
        if (treasuryOpt.isPresent()) {
            treasury = treasuryOpt.get().getLevel();
        } else {
            treasury = 0; // Default to level 0 if Treasury building doesn't exist
        }

        int producedWood = (int) Math.floor(30.0 * lm * hours);
        int producedStone = (int) Math.floor(25.0 * q * hours);
        int producedScrap = (int) Math.floor(20.0 * mine * hours);
        int producedGold = (int) Math.floor(25.0 * treasury * hours); // Increased from 15.0 to 25.0 for better balance

        int capacity = storageCapacity(user);

        int newWood = Math.min(capacity, user.getWood() + producedWood);
        int newStone = Math.min(capacity, user.getStone() + producedStone);
        int newScrap = Math.min(capacity, user.getScrap() + producedScrap);
        int newGold = user.getGold() + producedGold; // Gold has no storage limit

        int gainedWood = newWood - user.getWood();
        int gainedStone = newStone - user.getStone();
        int gainedScrap = newScrap - user.getScrap();
        int gainedGold = producedGold;

        user.setWood(newWood);
        user.setStone(newStone);
        user.setScrap(newScrap);
        user.setGold(newGold);
        user.setLastCollectedAt(Instant.now());
        userRepository.save(user);

        return new CollectResult(gainedWood, gainedStone, gainedScrap, gainedGold);
    }
}


