package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.domain.enums.RaidMapTemplate;
import com.throneofdust.throneofdust.domain.enums.RaidStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "raids")
public class Raid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RaidMapTemplate map;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RaidStatus status = RaidStatus.SCHEDULED;

    @Column(nullable = false)
    private boolean allyMode = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "raid_members",
            joinColumns = @JoinColumn(name = "raid_id"),
            inverseJoinColumns = @JoinColumn(name = "character_id")
    )
    private Set<GameCharacter> members = new HashSet<>();

    @Column(nullable = false)
    private Instant startAt;

    @Column(nullable = false)
    private Instant endAt;

    // Resolution
    private Boolean success;
    private Integer lootGold;
    private Integer lootScrap;
    private Boolean betrayalOccurred;
    private Boolean extractionSuccess;
    private Integer casualties;

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

    public RaidMapTemplate getMap() { return map; }
    public void setMap(RaidMapTemplate map) { this.map = map; }

    public RaidStatus getStatus() {
        return status;
    }

    public void setStatus(RaidStatus status) {
        this.status = status;
    }

    public boolean isAllyMode() {
        return allyMode;
    }

    public void setAllyMode(boolean allyMode) {
        this.allyMode = allyMode;
    }

    public Set<GameCharacter> getMembers() {
        return members;
    }

    public void setMembers(Set<GameCharacter> members) {
        this.members = members;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public void setStartAt(Instant startAt) {
        this.startAt = startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public void setEndAt(Instant endAt) {
        this.endAt = endAt;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public Integer getLootGold() { return lootGold; }
    public void setLootGold(Integer lootGold) { this.lootGold = lootGold; }
    public Integer getLootScrap() { return lootScrap; }
    public void setLootScrap(Integer lootScrap) { this.lootScrap = lootScrap; }

    public Boolean getBetrayalOccurred() {
        return betrayalOccurred;
    }

    public void setBetrayalOccurred(Boolean betrayalOccurred) {
        this.betrayalOccurred = betrayalOccurred;
    }

    public Boolean getExtractionSuccess() {
        return extractionSuccess;
    }

    public void setExtractionSuccess(Boolean extractionSuccess) {
        this.extractionSuccess = extractionSuccess;
    }

    public Integer getCasualties() {
        return casualties;
    }

    public void setCasualties(Integer casualties) {
        this.casualties = casualties;
    }
}


