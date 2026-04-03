import {
  getRank,
  getRankForXP,
  getRankProgress,
  calculateXP,
  updateStreak,
  checkAchievements,
} from '../../services/xp';
import { RANKS, XP_REWARDS } from '../../constants';

// Mock storage service so tests don't touch localStorage
jest.mock('../../services/storage', () => ({
  StatsService: {
    get: jest.fn(() => ({
      xp: 0, streak: 0, bestStreak: 0,
      totalWorkouts: 0, totalVolume: 0, lastWorkoutDate: null,
    })),
    set: jest.fn(),
    update: jest.fn(),
  },
  AchievementService: {
    getUnlocked: jest.fn(() => []),
    unlock: jest.fn(() => true),
    isUnlocked: jest.fn(() => false),
  },
}));

// ─── getRank ──────────────────────────────────────────────────────────────────
describe('getRank', () => {
  test('returns Rookie at 0 XP', () => {
    expect(getRank(0)).toBe('Rookie');
  });

  test('returns Rookie just below Athlete threshold', () => {
    expect(getRank(499)).toBe('Rookie');
  });

  test('returns Athlete at exactly 500 XP', () => {
    expect(getRank(500)).toBe('Athlete');
  });

  test('returns Competitor at 1500 XP', () => {
    expect(getRank(1500)).toBe('Competitor');
  });

  test('returns Champion at 4000 XP', () => {
    expect(getRank(4000)).toBe('Champion');
  });

  test('returns Elite at 10000 XP', () => {
    expect(getRank(10000)).toBe('Elite');
  });

  test('returns Legend at 25000 XP', () => {
    expect(getRank(25000)).toBe('Legend');
  });

  test('returns Legend for XP exceeding max threshold', () => {
    expect(getRank(999999)).toBe('Legend');
  });

  test('handles negative XP gracefully', () => {
    expect(getRank(-100)).toBe('Rookie');
  });

  test('rank boundaries are monotonically increasing', () => {
    const xpValues = [0, 500, 1500, 4000, 10000, 25000];
    const ranks = xpValues.map(getRank);
    expect(new Set(ranks).size).toBe(6);
  });

  test('all 6 rank names are reachable', () => {
    const expectedRanks = ['Rookie', 'Athlete', 'Competitor', 'Champion', 'Elite', 'Legend'];
    const reachedRanks = RANKS.map(r => getRank(r.minXP));
    expect(reachedRanks).toEqual(expectedRanks);
  });
});

// ─── getRankForXP ─────────────────────────────────────────────────────────────
describe('getRankForXP', () => {
  test('returns full rank object with color and emoji', () => {
    const rank = getRankForXP(0);
    expect(rank).toHaveProperty('name');
    expect(rank).toHaveProperty('color');
    expect(rank).toHaveProperty('emoji');
    expect(rank).toHaveProperty('minXP');
  });

  test('Rookie rank has minXP of 0', () => {
    expect(getRankForXP(0).minXP).toBe(0);
  });
});

// ─── getRankProgress ──────────────────────────────────────────────────────────
describe('getRankProgress', () => {
  test('progress is between 0 and 1', () => {
    const { progress } = getRankProgress(250);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  test('progress is 0.5 at midpoint between Rookie and Athlete', () => {
    const { progress } = getRankProgress(250);
    expect(progress).toBeCloseTo(0.5, 1);
  });

  test('returns next rank for non-max rank', () => {
    const { next } = getRankProgress(0);
    expect(next).not.toBeNull();
    expect(next.name).toBe('Athlete');
  });

  test('returns null next for Legend rank', () => {
    const { next, progress } = getRankProgress(100000);
    expect(next).toBeNull();
    expect(progress).toBe(1);
  });

  test('handles negative XP', () => {
    const { progress } = getRankProgress(-500);
    expect(progress).toBeGreaterThanOrEqual(0);
  });
});

// ─── calculateXP ──────────────────────────────────────────────────────────────
describe('calculateXP', () => {
  test('returns at least base XP for any completed workout', () => {
    const xp = calculateXP({ sets: 0, volume: 0, duration: 0 });
    expect(xp).toBeGreaterThanOrEqual(XP_REWARDS.BASE_WORKOUT);
  });

  test('awards more XP for more sets', () => {
    const low = calculateXP({ sets: 3, volume: 0, duration: 0 });
    const high = calculateXP({ sets: 15, volume: 0, duration: 0 });
    expect(high).toBeGreaterThan(low);
  });

  test('awards more XP for higher volume', () => {
    const low = calculateXP({ sets: 0, volume: 500, duration: 0 });
    const high = calculateXP({ sets: 0, volume: 5000, duration: 0 });
    expect(high).toBeGreaterThan(low);
  });

  test('streak multiplier increases XP', () => {
    const base = calculateXP({ sets: 10, volume: 2000, duration: 45, streak: 0 });
    const streak7 = calculateXP({ sets: 10, volume: 2000, duration: 45, streak: 7 });
    expect(streak7).toBeGreaterThan(base);
  });

  test('streak multiplier is capped at MAX_STREAK_MULTIPLIER', () => {
    const hugeStreak = calculateXP({ sets: 10, volume: 2000, streak: 99999 });
    const maxStreak = calculateXP({ sets: 10, volume: 2000, streak: Math.ceil((XP_REWARDS.MAX_STREAK_MULTIPLIER - 1) / XP_REWARDS.STREAK_MULTIPLIER_PER_DAY) });
    expect(hugeStreak).toBe(maxStreak);
  });

  test('returns integer XP (no decimals)', () => {
    const xp = calculateXP({ sets: 7, volume: 1337, duration: 47, streak: 3 });
    expect(xp).toBe(Math.round(xp));
  });

  test('handles missing params with defaults', () => {
    expect(() => calculateXP()).not.toThrow();
    expect(calculateXP()).toBeGreaterThanOrEqual(XP_REWARDS.BASE_WORKOUT);
  });

  test('handles zero-value params', () => {
    const xp = calculateXP({ sets: 0, volume: 0, duration: 0, streak: 0 });
    expect(xp).toBe(XP_REWARDS.BASE_WORKOUT);
  });
});

// ─── updateStreak ─────────────────────────────────────────────────────────────
describe('updateStreak', () => {
  const TODAY = new Date().toISOString().slice(0, 10);
  const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const TWO_DAYS_AGO = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);

  test('starts streak at 1 if no previous workout', () => {
    const result = updateStreak({ streak: 0, bestStreak: 0, lastWorkoutDate: null });
    expect(result.streak).toBe(1);
  });

  test('increments streak for consecutive day', () => {
    const result = updateStreak({ streak: 5, bestStreak: 5, lastWorkoutDate: YESTERDAY });
    expect(result.streak).toBe(6);
  });

  test('resets streak to 1 if gap > 1 day', () => {
    const result = updateStreak({ streak: 10, bestStreak: 10, lastWorkoutDate: TWO_DAYS_AGO });
    expect(result.streak).toBe(1);
  });

  test('preserves bestStreak when streak resets', () => {
    const result = updateStreak({ streak: 10, bestStreak: 10, lastWorkoutDate: TWO_DAYS_AGO });
    expect(result.bestStreak).toBe(10);
  });

  test('updates bestStreak when new streak exceeds it', () => {
    const result = updateStreak({ streak: 14, bestStreak: 10, lastWorkoutDate: YESTERDAY });
    expect(result.bestStreak).toBe(15);
  });

  test('does not double-increment streak on same day', () => {
    const result = updateStreak({ streak: 5, bestStreak: 5, lastWorkoutDate: TODAY });
    expect(result.streak).toBe(5);
  });
});

// ─── checkAchievements ────────────────────────────────────────────────────────
describe('checkAchievements', () => {
  const { AchievementService } = require('../../services/storage');

  beforeEach(() => {
    AchievementService.getUnlocked.mockReturnValue([]);
  });

  test('unlocks first_workout achievement at 1 total workout', () => {
    const newOnes = checkAchievements({ totalWorkouts: 1, streak: 0, totalVolume: 0, xp: 0 });
    expect(newOnes.some(a => a.id === 'first_workout')).toBe(true);
  });

  test('does not re-unlock already unlocked achievement', () => {
    AchievementService.getUnlocked.mockReturnValue(['first_workout']);
    const newOnes = checkAchievements({ totalWorkouts: 1, streak: 0, totalVolume: 0, xp: 0 });
    expect(newOnes.some(a => a.id === 'first_workout')).toBe(false);
  });

  test('unlocks streak_7 at 7-day streak', () => {
    const newOnes = checkAchievements({ totalWorkouts: 7, streak: 7, totalVolume: 0, xp: 0 });
    expect(newOnes.some(a => a.id === 'streak_7')).toBe(true);
  });

  test('does not unlock streak_7 at streak < 7', () => {
    const newOnes = checkAchievements({ totalWorkouts: 5, streak: 5, totalVolume: 0, xp: 0 });
    expect(newOnes.some(a => a.id === 'streak_7')).toBe(false);
  });

  test('can unlock multiple achievements in one call', () => {
    const newOnes = checkAchievements({ totalWorkouts: 10, streak: 7, totalVolume: 0, xp: 0 });
    expect(newOnes.length).toBeGreaterThanOrEqual(2);
  });

  test('returns empty array when no achievements triggered', () => {
    const newOnes = checkAchievements({ totalWorkouts: 0, streak: 0, totalVolume: 0, xp: 0 });
    expect(newOnes).toHaveLength(0);
  });
});
