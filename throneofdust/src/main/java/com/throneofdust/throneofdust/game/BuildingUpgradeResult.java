package com.throneofdust.throneofdust.game;

public sealed interface BuildingUpgradeResult {
    record Success(int newLevel, int remainingGold) implements BuildingUpgradeResult {}
    record InsufficientResources(String message) implements BuildingUpgradeResult {}
    record MaxLevelReached(String message) implements BuildingUpgradeResult {}
}
