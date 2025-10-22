package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.domain.enums.CharacterClass;
import com.throneofdust.throneofdust.domain.enums.CharacterStatus;
import com.throneofdust.throneofdust.domain.enums.TraitType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "characters")
public class GameCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(nullable = false, length = 60)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CharacterClass characterClass;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CharacterStatus status = CharacterStatus.IDLE;

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private int xp = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "character_traits", joinColumns = @JoinColumn(name = "character_id"))
    @Column(name = "trait", length = 30)
    private Set<TraitType> traits = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CharacterClass getCharacterClass() {
        return characterClass;
    }

    public void setCharacterClass(CharacterClass characterClass) {
        this.characterClass = characterClass;
    }

    public CharacterStatus getStatus() {
        return status;
    }

    public void setStatus(CharacterStatus status) {
        this.status = status;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public Set<TraitType> getTraits() {
        return traits;
    }

    public void setTraits(Set<TraitType> traits) {
        this.traits = traits;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}


