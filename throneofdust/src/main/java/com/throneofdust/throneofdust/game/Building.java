package com.throneofdust.throneofdust.game;

import com.throneofdust.throneofdust.auth.UserAccount;
import com.throneofdust.throneofdust.domain.enums.BuildingType;
import jakarta.persistence.Column;
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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "buildings",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_building_type", columnNames = {"user_id", "type"}))
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BuildingType type;

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private Instant lastCollectedAt = Instant.now();

    // Used for Training Yard recruit cooldowns and other building-specific timers
    private Instant lastActionAt;

    // Recruits counter to increase recruit cost over time (Training Yard only)
    @Column(nullable = false)
    private int recruitsCount = 0;

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

    public BuildingType getType() {
        return type;
    }

    public void setType(BuildingType type) {
        this.type = type;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public Instant getLastCollectedAt() {
        return lastCollectedAt;
    }

    public void setLastCollectedAt(Instant lastCollectedAt) {
        this.lastCollectedAt = lastCollectedAt;
    }

    public Instant getLastActionAt() {
        return lastActionAt;
    }

    public void setLastActionAt(Instant lastActionAt) {
        this.lastActionAt = lastActionAt;
    }

    public int getRecruitsCount() {
        return recruitsCount;
    }

    public void setRecruitsCount(int recruitsCount) {
        this.recruitsCount = recruitsCount;
    }
}


