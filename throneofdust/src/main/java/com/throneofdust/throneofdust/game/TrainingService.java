package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.domain.enums.BuildingType;
import com.throneofdust.throneofdust.domain.enums.CharacterClass;
import com.throneofdust.throneofdust.domain.enums.CharacterStatus;
import com.throneofdust.throneofdust.domain.enums.TraitType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Random;

@Service
public class TrainingService {

    private final BuildingRepository buildingRepository;
    private final GameCharacterRepository characterRepository;
    private final Random random = new SecureRandom();

    public TrainingService(BuildingRepository buildingRepository, GameCharacterRepository characterRepository) {
        this.buildingRepository = buildingRepository;
        this.characterRepository = characterRepository;
    }

    @Transactional
    public RecruitmentResult recruit(UserAccount user, CharacterClass desiredClass, java.util.Set<com.throneofdust.throneofdust.domain.enums.TraitType> desiredTraits) {
        Building yard = buildingRepository.findByUserAndType(user, BuildingType.TRAINING_YARD).orElseThrow();
        Instant now = Instant.now();
        int cooldownSeconds = 600; // 10 minutes
        if (yard.getLastActionAt() != null) {
            long since = Duration.between(yard.getLastActionAt(), now).getSeconds();
            if (since < cooldownSeconds) {
                long remaining = cooldownSeconds - since;
                return new RecruitmentResult.OnCooldown("Recruitment on cooldown. Wait " + remaining + " seconds.", remaining);
            }
        }

        // Roster limit: 6 + TrainingYardLevel
        int limit = 6 + yard.getLevel();
        int current = characterRepository.findByUser(user).size();
        if (current >= limit) {
            return new RecruitmentResult.RosterLimitReached("Roster limit reached (" + limit + " characters).");
        }

        // Cost: 20g + 5 scrap + 5g * recruitsSoFar (reduced scaling for better balance)
        int goldCost = 20 + 5 * yard.getRecruitsCount(); // Reduced from 10 to 5 for better balance
        int scrapCost = 5;
        if (user.getGold() < goldCost || user.getScrap() < scrapCost) {
            return new RecruitmentResult.InsufficientResources("Not enough resources.");
        }
        
        user.setGold(user.getGold() - goldCost);
        user.setScrap(user.getScrap() - scrapCost);

        GameCharacter c = new GameCharacter();
        c.setUser(user);
        c.setName(generateName());
        c.setCharacterClass(desiredClass != null ? desiredClass : randomClass());
        c.setStatus(CharacterStatus.IDLE);
        // trait slots at level 1 = 1
        java.util.Set<com.throneofdust.throneofdust.domain.enums.TraitType> toAssign = new java.util.HashSet<>();
        if (desiredTraits != null && !desiredTraits.isEmpty()) {
            toAssign.addAll(desiredTraits.stream().limit(1).toList());
        } else {
            toAssign.addAll(randomTraits());
        }
        c.getTraits().addAll(toAssign);
        c = characterRepository.save(c);

        yard.setLastActionAt(now);
        yard.setRecruitsCount(yard.getRecruitsCount() + 1);
        buildingRepository.save(yard);
        return new RecruitmentResult.Success(c);
    }

    public int squadCap(UserAccount user) {
        int level = buildingRepository.findByUserAndType(user, BuildingType.TRAINING_YARD).orElseThrow().getLevel();
        return Math.min(4, level);
    }

    private CharacterClass randomClass() {
        CharacterClass[] values = CharacterClass.values();
        return values[random.nextInt(values.length)];
    }

    private java.util.Set<TraitType> randomTraits() {
        TraitType[] values = TraitType.values();
        return java.util.Set.of(values[random.nextInt(values.length)]);
    }

    private String generateName() {
        String[] first = {"Ryn", "Kael", "Mira", "Thorne", "Eira", "Dax"};
        String[] last = {"Ash", "Grim", "Vale", "Stone", "Shade", "Hale"};
        return first[random.nextInt(first.length)] + " " + last[random.nextInt(last.length)];
    }
}


