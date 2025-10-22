package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.domain.enums.CharacterStatus;
import com.throneofdust.throneofdust.domain.enums.TraitType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CharacterService {

    private final GameCharacterRepository characterRepository;

    public CharacterService(GameCharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    public int allowedTraitSlots(GameCharacter character) {
        int slots = 1;
        if (character.getLevel() >= 5) slots += 1;
        if (character.getLevel() >= 10) slots += 1;
        return slots;
    }

    @Transactional
    public GameCharacter addTrait(UserAccount user, Long characterId, TraitType trait) {
        GameCharacter c = characterRepository.findById(characterId).orElseThrow();
        if (!c.getUser().getId().equals(user.getId())) throw new IllegalArgumentException("Not your character");
        if (c.getStatus() != CharacterStatus.IDLE) throw new IllegalStateException("Character must be idle");
        if (c.getTraits().contains(trait)) throw new IllegalStateException("Trait already assigned");
        int slots = allowedTraitSlots(c);
        if (c.getTraits().size() >= slots) throw new IllegalStateException("No free trait slots");
        c.getTraits().add(trait);
        return characterRepository.save(c);
    }
}


