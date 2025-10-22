package com.throneofdust.throneofdust.domain.enums;

public enum RaidMapTemplate {
    ABANDONED_OUTPOST(
            MapDifficulty.EASY, 5, 10,
            0.15, 0.15,
            12, 20,    // Increased from 8-14 to 12-20 for better balance
            3, 8,      // Increased from 2-5 to 3-8 for better balance
            2
    ),
    RUINED_FORT(
            MapDifficulty.NORMAL, 15, 25,
            0.35, 0.25,
            30, 50,    // Increased from 20-35 to 30-50 for better balance
            10, 18,    // Increased from 6-12 to 10-18 for better balance
            3
    ),
    DEEP_WARRENS(
            MapDifficulty.HARD, 45, 60,
            0.55, 0.35,
            80, 140,   // Increased from 60-110 to 80-140 for better balance
            25, 40,    // Increased from 18-30 to 25-40 for better balance
            4
    );

    public final MapDifficulty difficulty;
    public final int durationMinutes;
    public final int entryCostGold;
    public final double baseRaidFail;
    public final double baseExtractFail;
    public final int goldMin;
    public final int goldMax;
    public final int scrapMin;
    public final int scrapMax;
    public final int mapCap;

    RaidMapTemplate(MapDifficulty difficulty, int durationMinutes, int entryCostGold, double baseRaidFail, double baseExtractFail,
                    int goldMin, int goldMax, int scrapMin, int scrapMax, int mapCap) {
        this.difficulty = difficulty;
        this.durationMinutes = durationMinutes;
        this.entryCostGold = entryCostGold;
        this.baseRaidFail = baseRaidFail;
        this.baseExtractFail = baseExtractFail;
        this.goldMin = goldMin;
        this.goldMax = goldMax;
        this.scrapMin = scrapMin;
        this.scrapMax = scrapMax;
        this.mapCap = mapCap;
    }
}


