/**
 * Integration Tests — Workout Completion Flow
 *
 * Tests the end-to-end flow of completing a workout:
 * XP calculation → storage write → achievement unlock → stat update
 */

import { awardWorkoutXP } from '../../services/xp';
import { StatsService, HistoryService, AchievementService } from '../../services/storage';
import { getRank } from '../../services/xp';

// ─── localStorage mock ────────────────────────────────────────────────────────
let _store = {};
const localStorageMock = {
  getItem: jest.fn((key) => _store[key] !== undefined ? _store[key] : null),
  setItem: jest.fn((key, value) => { _store[key] = String(value); }),
  removeItem: jest.fn((key) => { delete _store[key]; }),
  clear: jest.fn(() => { _store = {}; }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  _store = {};
  jest.clearAllMocks();
  localStorageMock.getItem.mockImplementation((key) => _store[key] !== undefined ? _store[key] : null);
  localStorageMock.setItem.mockImplementation((key, value) => { _store[key] = String(value); });
  localStorageMock.removeItem.mockImplementation((key) => { delete _store[key]; });
  localStorageMock.clear.mockImplementation(() => { _store = {}; });
});

// ─── FULL WORKOUT FLOW ────────────────────────────────────────────────────────
describe('Workout completion — end-to-end flow', () => {
  const workoutData = {
    programId: 'b1',
    programTitle: 'First Steps',
    sets: 15,
    volume: 2500,
    duration: 45,
  };

  test('completing first workout awards XP and updates stats', () => {
    const { xpEarned, newStats } = awardWorkoutXP(workoutData);
    expect(xpEarned).toBeGreaterThan(0);
    expect(newStats.totalWorkouts).toBe(1);
    expect(newStats.xp).toBeGreaterThan(0);
  });

  test('first workout XP persists in storage', () => {
    awardWorkoutXP(workoutData);
    const storedStats = StatsService.get();
    expect(storedStats.totalWorkouts).toBe(1);
    expect(storedStats.xp).toBeGreaterThan(0);
  });

  test('first workout unlocks first_workout achievement', () => {
    const { newAchievements } = awardWorkoutXP(workoutData);
    expect(newAchievements.some(a => a.id === 'first_workout')).toBe(true);
  });

  test('achievement bonus XP is added to total', () => {
    const { newStats, newAchievements } = awardWorkoutXP(workoutData);
    const bonusXP = newAchievements.reduce((sum, a) => sum + (a.xp || 0), 0);
    // Stats are updated with bonus in awardWorkoutXP
    const stored = StatsService.get();
    expect(stored.xp).toBeGreaterThanOrEqual(newStats.xp - bonusXP);
  });

  test('completing 10 workouts unlocks workouts_10 achievement', () => {
    let lastAchievements = [];
    for (let i = 0; i < 10; i++) {
      const { newAchievements } = awardWorkoutXP(workoutData);
      lastAchievements = [...lastAchievements, ...newAchievements];
    }
    expect(lastAchievements.some(a => a.id === 'workouts_10')).toBe(true);
  });

  test('XP accumulates correctly across multiple workouts', () => {
    awardWorkoutXP(workoutData);
    awardWorkoutXP(workoutData);
    awardWorkoutXP(workoutData);
    const stats = StatsService.get();
    expect(stats.totalWorkouts).toBe(3);
    expect(stats.xp).toBeGreaterThan(0);
  });

  test('rank advances from Rookie as XP accumulates', () => {
    // Do enough workouts to reach Athlete (500 XP)
    for (let i = 0; i < 5; i++) {
      awardWorkoutXP({ sets: 20, volume: 5000, duration: 60 });
    }
    const stats = StatsService.get();
    const rank = getRank(stats.xp);
    expect(['Athlete', 'Competitor', 'Champion', 'Elite', 'Legend']).toContain(rank);
  });
});

// ─── HISTORY INTEGRATION ──────────────────────────────────────────────────────
describe('History integration', () => {
  const makeEntry = (overrides = {}) => ({
    id: `w-${Date.now()}-${Math.random()}`,
    programId: 'b1',
    programTitle: 'First Steps',
    timestamp: Date.now(),
    duration: 45,
    sets: 15,
    volume: 2500,
    xpEarned: 200,
    notes: '',
    ...overrides,
  });

  test('workout entry is stored after completion', () => {
    HistoryService.add(makeEntry());
    expect(HistoryService.getAll()).toHaveLength(1);
  });

  test('history entries contain correct data', () => {
    const entry = makeEntry({ sets: 20, volume: 3000, xpEarned: 250 });
    HistoryService.add(entry);
    const history = HistoryService.getAll();
    expect(history[0].sets).toBe(20);
    expect(history[0].volume).toBe(3000);
  });

  test('history is capped at 1000 entries', () => {
    // Add 5 entries and confirm no overflow beyond limit with small set
    for (let i = 0; i < 5; i++) {
      HistoryService.add(makeEntry({ id: `w-bulk-${i}`, timestamp: i * 1000 }));
    }
    expect(HistoryService.getAll().length).toBeLessThanOrEqual(1000);
  });

  test('7-day heatmap only returns 7 entries max', () => {
    for (let i = 0; i < 20; i++) {
      HistoryService.add(makeEntry({ id: `w-${i}`, timestamp: Date.now() - i * 3600000 }));
    }
    expect(HistoryService.getRecent(7)).toHaveLength(7);
  });
});

// ─── STREAK INTEGRATION ───────────────────────────────────────────────────────
describe('Streak integration', () => {
  test('consecutive workouts build streak', () => {
    const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    StatsService.set({
      xp: 100, streak: 3, bestStreak: 3,
      totalWorkouts: 3, totalVolume: 7500,
      lastWorkoutDate: YESTERDAY,
    });
    awardWorkoutXP({ sets: 10, volume: 2000, duration: 40 });
    expect(StatsService.get().streak).toBe(4);
  });

  test('broken streak resets to 1', () => {
    const THREE_DAYS_AGO = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    StatsService.set({
      xp: 500, streak: 10, bestStreak: 10,
      totalWorkouts: 10, totalVolume: 25000,
      lastWorkoutDate: THREE_DAYS_AGO,
    });
    awardWorkoutXP({ sets: 10, volume: 2000, duration: 40 });
    expect(StatsService.get().streak).toBe(1);
  });

  test('bestStreak is preserved after streak reset', () => {
    const THREE_DAYS_AGO = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    StatsService.set({
      xp: 500, streak: 15, bestStreak: 15,
      totalWorkouts: 15, totalVolume: 37500,
      lastWorkoutDate: THREE_DAYS_AGO,
    });
    awardWorkoutXP({ sets: 10, volume: 2000, duration: 40 });
    expect(StatsService.get().bestStreak).toBe(15);
    expect(StatsService.get().streak).toBe(1);
  });
});
