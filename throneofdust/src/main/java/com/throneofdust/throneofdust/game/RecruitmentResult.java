package com.throneofdust.throneofdust.game;

public sealed interface RecruitmentResult {
    record Success(GameCharacter character) implements RecruitmentResult {}
    record InsufficientResources(String message) implements RecruitmentResult {}
    record RosterLimitReached(String message) implements RecruitmentResult {}
    record OnCooldown(String message, long remainingSeconds) implements RecruitmentResult {}
}
