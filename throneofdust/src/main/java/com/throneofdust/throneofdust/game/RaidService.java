package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.auth.UserRepository;
import com.throneofdust.throneofdust.domain.enums.BuildingType;
import com.throneofdust.throneofdust.domain.enums.CharacterStatus;
import com.throneofdust.throneofdust.domain.enums.RaidMapTemplate;
import com.throneofdust.throneofdust.domain.enums.RaidStatus;
import com.throneofdust.throneofdust.domain.enums.TraitType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class RaidService {

    private final RaidRepository raidRepository;
    private final GameCharacterRepository characterRepository;
    private final TrainingService trainingService;
    private final BuildingRepository buildingRepository;
    private final UserRepository userRepository;
    private final Random random = new SecureRandom();

    public RaidService(RaidRepository raidRepository, GameCharacterRepository characterRepository, TrainingService trainingService, UserRepository userRepository, BuildingRepository buildingRepository) {
        this.raidRepository = raidRepository;
        this.characterRepository = characterRepository;
        this.trainingService = trainingService;
        this.userRepository = userRepository;
        this.buildingRepository = buildingRepository;
    }

    @Transactional
    public Raid startRaid(UserAccount user, RaidMapTemplate map, List<Long> memberIds, boolean allyMode) {
        if (user.getGold() < map.entryCostGold) {
            throw new IllegalStateException("Not enough gold. Need " + map.entryCostGold + " gold.");
        }

        int personalCap = trainingService.squadCap(user);
        int allowed = Math.min(personalCap, map.mapCap);
        if (memberIds.size() < 1 || memberIds.size() > allowed) {
            throw new IllegalArgumentException("Squad size must be 1.." + allowed);
        }

        List<GameCharacter> members = characterRepository.findAllById(memberIds);
        if (members.size() != memberIds.size()) {
            throw new IllegalArgumentException("Invalid member id");
        }
        for (GameCharacter c : members) {
            if (!c.getUser().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Character doesn't belong to you");
            }
            if (c.getStatus() != CharacterStatus.IDLE) {
                throw new IllegalStateException("Character not idle");
            }
        }

        Raid raid = new Raid();
        raid.setUser(user);
        raid.setMap(map);
        raid.setAllyMode(allyMode);
        raid.setStartAt(Instant.now());
        raid.setEndAt(Instant.now().plusSeconds(map.durationMinutes * 60L));
        raid.getMembers().addAll(members);
        raid.setStatus(RaidStatus.IN_PROGRESS);

        user.setGold(user.getGold() - map.entryCostGold);
        userRepository.save(user);
        for (GameCharacter c : members) {
            c.setStatus(CharacterStatus.ON_RAID);
        }
        characterRepository.saveAll(members);
        return raidRepository.save(raid);
    }

    @Transactional
    public Raid resolveRaid(UserAccount user, Long raidId) {
        Raid raid = raidRepository.findById(raidId).orElseThrow();
        if (!raid.getUser().getId().equals(user.getId())) throw new IllegalArgumentException("Not your raid");
        if (raid.getStatus() == RaidStatus.RESOLVED) return raid;
        if (raid.getEndAt().isAfter(Instant.now())) throw new IllegalStateException("Raid not finished yet");

        double avgLevel = raid.getMembers().stream().mapToInt(GameCharacter::getLevel).average().orElse(1.0);
        double raidFail = raid.getMap().baseRaidFail;
        if (raid.isAllyMode()) raidFail -= 0.15; // ally helps
        raidFail -= 0.005 * avgLevel; // 0.5% per average level
        double overallMinus = raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.CAUTIOUS)).count() * 0.05;
        double overallPlus = raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.RECKLESS)).count() * 0.05;
        raidFail = raidFail - overallMinus + overallPlus;
        raidFail -= raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.STEADY_HAND)).count() * 0.05;
        raidFail = clamp(raidFail, 0.05, 0.95);
        boolean success = !roll(raidFail);
        raid.setSuccess(success);

        int lootGold = 0;
        int lootScrap = 0;
        if (success) {
            lootGold = rng(raid.getMap().goldMin, raid.getMap().goldMax);
            lootScrap = rng(raid.getMap().scrapMin, raid.getMap().scrapMax);
            long looter = raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.LOOTER)).count();
            long cautious = raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.CAUTIOUS)).count();
            long reckless = raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.RECKLESS)).count();
            double multiplier = 1.0 + 0.15 * looter - 0.10 * cautious + 0.10 * reckless;
            lootGold = (int) Math.round(lootGold * multiplier);
            lootScrap = (int) Math.round(lootScrap * multiplier);
        }

        // Survival rolls
        double baseDeath = switch (raid.getMap().difficulty) {
            case EASY -> 0.05;
            case NORMAL -> 0.10;
            case HARD -> 0.20;
        };
        int deaths = 0;
        List<GameCharacter> members = new ArrayList<>(raid.getMembers());
        for (GameCharacter c : members) {
            double deathChance = clamp(baseDeath - 0.01 * c.getLevel(), 0.01, 0.30);
            boolean dies = roll(deathChance);
            if (dies) {
                c.setStatus(CharacterStatus.DEAD);
                deaths++;
            } else {
                c.setStatus(CharacterStatus.IDLE);
            }
        }
        characterRepository.saveAll(members);
        raid.setCasualties(deaths);

        // Own-squad betrayal (Untrustworthy survivors) BEFORE ally betrayal
        if (success) {
            List<GameCharacter> aliveAfter = members.stream().filter(c -> c.getStatus() == CharacterStatus.IDLE).collect(Collectors.toList());
            for (GameCharacter c : aliveAfter) {
                if (c.getTraits().contains(TraitType.UNTRUSTWORTHY) && roll(0.10)) {
                    lootGold = lootGold - (int) Math.floor(lootGold * 0.10);
                    lootScrap = lootScrap - (int) Math.floor(lootScrap * 0.10);
                    c.setStatus(CharacterStatus.DEAD); // desert/remove
                    characterRepository.save(c);
                    raid.setCasualties(raid.getCasualties() + 1);
                }
            }
        }

        // Ally betrayal (if Ally ON) AFTER own-squad betrayal
        boolean betrayal = false;
        if (raid.isAllyMode() && success) {
            int radarLevel = buildingRepository.findByUserAndType(user, BuildingType.RADAR).map(Building::getLevel).orElse(0);
            double betrayChance = clamp(0.20 - 0.02 * radarLevel, 0.02, 0.20);
            if (roll(betrayChance)) {
                betrayal = true;
                lootGold = (int) Math.round(lootGold * 0.6);
                lootScrap = (int) Math.round(lootScrap * 0.6);
                List<GameCharacter> alive = members.stream().filter(c -> c.getStatus() == CharacterStatus.IDLE).collect(Collectors.toList());
                if (!alive.isEmpty() && roll(0.5)) {
                    GameCharacter victim = alive.get(random.nextInt(alive.size()));
                    victim.setStatus(CharacterStatus.DEAD);
                    characterRepository.save(victim);
                    raid.setCasualties(raid.getCasualties() + 1);
                }
            } else {
                lootGold = (int) Math.round(lootGold * 1.05);
                lootScrap = (int) Math.round(lootScrap * 1.05);
            }
        }
        raid.setBetrayalOccurred(betrayal);

        // Extraction
        boolean extractionSuccess = success;
        if (success) {
            double extractFail = raid.getMap().baseExtractFail;
            extractFail -= 0.005 * avgLevel;
            extractFail -= raid.getMembers().stream().filter(c -> c.getTraits().contains(TraitType.SCOUTS_EYE)).count() * 0.05;
            extractFail = extractFail - overallMinus + overallPlus;
            extractFail = clamp(extractFail, 0.05, 0.95);
            boolean fail = roll(extractFail);
            if (fail) {
                boolean medicPresent = members.stream().filter(c -> c.getStatus() != CharacterStatus.DEAD).anyMatch(c -> c.getTraits().contains(TraitType.MEDIC));
                if (medicPresent) {
                    lootGold = (int) Math.round(lootGold * 0.5);
                    lootScrap = (int) Math.round(lootScrap * 0.5);
                } else {
                    lootGold = 0;
                    lootScrap = 0;
                    extractionSuccess = false;
                }
            }
        }
        raid.setExtractionSuccess(extractionSuccess);

        // XP awards
        for (GameCharacter c : members) {
            if (c.getStatus() != CharacterStatus.DEAD) {
                c.setXp(c.getXp() + (success ? 10 : 5));
                while (c.getXp() >= c.getLevel() * 50) {
                    c.setXp(c.getXp() - c.getLevel() * 50);
                    c.setLevel(c.getLevel() + 1);
                }
            }
        }
        characterRepository.saveAll(members);

        // Bank loot
        user.setGold(user.getGold() + Math.max(0, lootGold));
        user.setScrap(user.getScrap() + Math.max(0, lootScrap));
        userRepository.save(user);
        raid.setLootGold(lootGold);
        raid.setLootScrap(lootScrap);
        raid.setStatus(RaidStatus.RESOLVED);
        return raidRepository.save(raid);
    }

    public List<Raid> list(UserAccount user) {
        return raidRepository.findByUser(user);
    }

    private int rng(int min, int max) {
        return random.nextInt(max - min + 1) + min;
    }

    private boolean roll(double probability) {
        return random.nextDouble() < probability;
    }

    private static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }
}


