package com.throneofdust.throneofdust.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Simple resource wallet on the user for MVP
    // Starting resources: enough for 1 upgrade (50w+40s+20sc) + 1 recruit (20g+5sc)
    @Column(nullable = false)
    private int wood = 60; // 50 for upgrade + 10 extra

    @Column(nullable = false)
    private int stone = 50; // 40 for upgrade + 10 extra

    @Column(nullable = false)
    private int scrap = 30; // 20 for upgrade + 5 for recruit + 5 extra

    @Column(nullable = false)
    private int gold = 30; // 20 for recruit + 10 extra

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Global production collection timestamp per spec
    @Column(nullable = false)
    private Instant lastCollectedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public int getWood() {
        return wood;
    }

    public void setWood(int wood) {
        this.wood = wood;
    }

    public int getStone() {
        return stone;
    }

    public void setStone(int stone) {
        this.stone = stone;
    }

    public int getScrap() {
        return scrap;
    }

    public void setScrap(int scrap) {
        this.scrap = scrap;
    }

    public int getGold() {
        return gold;
    }

    public void setGold(int gold) {
        this.gold = gold;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastCollectedAt() {
        return lastCollectedAt;
    }

    public void setLastCollectedAt(Instant lastCollectedAt) {
        this.lastCollectedAt = lastCollectedAt;
    }
}


