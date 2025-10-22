package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.domain.enums.CharacterStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameCharacterRepository extends JpaRepository<GameCharacter, Long> {
    List<GameCharacter> findByUser(UserAccount user);
    List<GameCharacter> findByUserAndStatus(UserAccount user, CharacterStatus status);
}


