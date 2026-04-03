import { RANKS, XP_REWARDS, ACHIEVEMENT_DEFS } from '../constants';
import { StatsService, AchievementService } from './storage';

/**
 * Get the rank object for a given XP total.
 * @param {number} xp
 * @returns {{ name: string, minXP: number, color: string, emoji: string }}
 */
export function getRankForXP(xp) {
  const validXP = Math.max(0, Math.floor(xp));
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (validXP >= r.minXP) rank = r;
    else break;
  }
  return rank;
}

/**
 * Get the rank name string for a given XP total.
 * @param {number} xp
 * @returns {string}
 */
export function getRank(xp) {
  return getRankForXP(xp).name;
}

/**
 * Calculate progress (0–1) toward next rank.
 * @param {number} xp
 * @returns {{ current: object, next: object|null, progress: number }}
 */
export function getRankProgress(xp) {
  const validXP = Math.max(0, xp);
  const currentIndex = RANKS.findIndex((r, i) => {
    const next = RANKS[i + 1];
    return !next || validXP < next.minXP;
  });
  const current = RANKS[currentIndex] ?? RANKS[RANKS.length - 1];
  const next = RANKS[currentIndex + 1] ?? null;

  if (!next) return { current, next: null, progress: 1 };

  const rangeXP = next.minXP - current.minXP;
  const earnedInRange = validXP - current.minXP;
  const progress = Math.min(1, Math.max(0, earnedInRange / rangeXP));

  return { current, next, progress };
}

/**
 * Calculate XP earned for a completed workout.
 * @param {{ sets: number, volume: number, duration: number, streak?: number }} params
 * @returns {number}
 */
export function calculateXP({ sets = 0, volume = 0, duration = 0, streak = 0 } = {}) {
  const base = XP_REWARDS.BASE_WORKOUT;
  const setBonus = Math.floor(sets) * XP_REWARDS.PER_SET;
  const volumeBonus = Math.floor(volume / 100) * XP_REWARDS.PER_100KG_VOLUME;

  const streakMultiplier = Math.min(
    XP_REWARDS.MAX_STREAK_MULTIPLIER,
    1 + (Math.floor(streak) * XP_REWARDS.STREAK_MULTIPLIER_PER_DAY)
  );

  const rawXP = (base + setBonus + volumeBonus) * streakMultiplier;
  return Math.round(rawXP);
}

/**
 * Update streak based on last workout date.
 * @param {{ streak: number, bestStreak: number, lastWorkoutDate: string|null }} stats
 * @returns {{ streak: number, bestStreak: number }}
 */
export function updateStreak({ streak, bestStreak, lastWorkoutDate }) {
  const today = new Date().toISOString().slice(0, 10);

  if (!lastWorkoutDate) {
    return { streak: 1, bestStreak: Math.max(1, bestStreak) };
  }

  const last = new Date(lastWorkoutDate);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day — streak unchanged
    return { streak, bestStreak };
  } else if (diffDays === 1) {
    // Consecutive day — increment streak
    const newStreak = streak + 1;
    return { streak: newStreak, bestStreak: Math.max(newStreak, bestStreak) };
  } else {
    // Streak broken
    return { streak: 1, bestStreak: Math.max(1, bestStreak) };
  }
}

/**
 * Check for newly unlocked achievements given updated stats.
 * Returns array of newly unlocked achievement objects.
 * @param {object} stats
 * @returns {Array}
 */
export function checkAchievements(stats) {
  const unlocked = AchievementService.getUnlocked();
  const newlyUnlocked = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (unlocked.includes(def.id)) continue;
    try {
      if (def.trigger(stats)) {
        AchievementService.unlock(def.id);
        newlyUnlocked.push(def);
      }
    } catch {
      // Trigger function failed — skip silently
    }
  }

  return newlyUnlocked;
}

/**
 * Award XP for completing a workout. Updates stats, streak, and checks achievements.
 * @param {{ sets: number, volume: number, duration: number }} workoutData
 * @returns {{ xpEarned: number, newStats: object, newAchievements: Array }}
 */
export function awardWorkoutXP(workoutData) {
  const currentStats = StatsService.get();

  // Update streak
  const { streak, bestStreak } = updateStreak({
    streak: currentStats.streak,
    bestStreak: currentStats.bestStreak,
    lastWorkoutDate: currentStats.lastWorkoutDate,
  });

  // Calculate XP
  const xpEarned = calculateXP({ ...workoutData, streak });

  // Build new stats
  const newStats = {
    xp: currentStats.xp + xpEarned,
    streak,
    bestStreak,
    totalWorkouts: currentStats.totalWorkouts + 1,
    totalVolume: currentStats.totalVolume + (workoutData.volume || 0),
    lastWorkoutDate: new Date().toISOString().slice(0, 10),
  };

  StatsService.set(newStats);

  // Check achievements with new stats
  const newAchievements = checkAchievements(newStats);

  // Add achievement XP bonus
  if (newAchievements.length > 0) {
    const bonusXP = newAchievements.reduce((sum, a) => sum + (a.xp || 0), 0);
    StatsService.update({ xp: newStats.xp + bonusXP });
    newStats.xp += bonusXP;
  }

  return { xpEarned, newStats, newAchievements };
}
