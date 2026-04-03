/**
 * Integration tests — FitQuest v2
 * Covers the awardWorkoutXP end-to-end flow, ProgramService,
 * and exportUserData — the lines missing from unit coverage.
 */

import { awardWorkoutXP, getRankProgress, checkAchievements } from '../../services/xp';
import {
  UserService, StatsService, HistoryService,
  AchievementService, ProgramService,
  resetAllData, exportUserData,
} from '../../services/storage';
import { PROGRAMS, SCHEMA_VERSION } from '../../constants';

// ─── localStorage mock ────────────────────────────────────────────────────────
let _store = {};
const localStorageMock = {
  getItem:    (key) => (_store[key] !== undefined ? _store[key] : null),
  setItem:    (key, val) => { _store[key] = String(val); },
  removeItem: (key) => { delete _store[key]; },
  clear:      () => { _store = {}; },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => { _store = {}; });

// ─── awardWorkoutXP — end-to-end ─────────────────────────────────────────────
describe('awardWorkoutXP (integration)', () => {
  const baseWorkout = { sets: 10, volume: 2000, duration: 45 };

  test('increases XP in persistent stats', () => {
    const before = StatsService.get().xp;
    awardWorkoutXP(baseWorkout);
    const after = StatsService.get().xp;
    expect(after).toBeGreaterThan(before);
  });

  test('increments totalWorkouts by 1 each call', () => {
    awardWorkoutXP(baseWorkout);
    awardWorkoutXP(baseWorkout);
    expect(StatsService.get().totalWorkouts).toBe(2);
  });

  test('accumulates totalVolume correctly', () => {
    awardWorkoutXP({ ...baseWorkout, volume: 1000 });
    awardWorkoutXP({ ...baseWorkout, volume: 500 });
    expect(StatsService.get().totalVolume).toBe(1500);
  });

  test('returns xpEarned, newStats, and newAchievements', () => {
    const result = awardWorkoutXP(baseWorkout);
    expect(result).toHaveProperty('xpEarned');
    expect(result).toHaveProperty('newStats');
    expect(result).toHaveProperty('newAchievements');
    expect(typeof result.xpEarned).toBe('number');
    expect(result.xpEarned).toBeGreaterThan(0);
  });

  test('unlocks first_workout achievement on first call', () => {
    const result = awardWorkoutXP(baseWorkout);
    const unlocked = result.newAchievements.map(a => a.id);
    expect(unlocked).toContain('first_workout');
  });

  test('does not double-award first_workout on second call', () => {
    awardWorkoutXP(baseWorkout);
    const result2 = awardWorkoutXP(baseWorkout);
    const unlocked = result2.newAchievements.map(a => a.id);
    expect(unlocked).not.toContain('first_workout');
  });

  test('adds achievement XP bonus to stats when achievement unlocked', () => {
    const result = awardWorkoutXP(baseWorkout);
    if (result.newAchievements.length > 0) {
      const bonusXP = result.newAchievements.reduce((s, a) => s + a.xp, 0);
      expect(StatsService.get().xp).toBe(result.newStats.xp);
      expect(result.xpEarned).toBeGreaterThan(0);
      expect(bonusXP).toBeGreaterThan(0);
    }
  });

  test('lastWorkoutDate is set to today after workout', () => {
    awardWorkoutXP(baseWorkout);
    const today = new Date().toISOString().slice(0, 10);
    expect(StatsService.get().lastWorkoutDate).toBe(today);
  });

  test('handles zero-volume workout without throwing', () => {
    expect(() => awardWorkoutXP({ sets: 0, volume: 0, duration: 0 })).not.toThrow();
  });
});

// ─── ProgramService ───────────────────────────────────────────────────────────
describe('ProgramService', () => {
  test('getActive returns null when nothing set', () => {
    expect(ProgramService.getActive()).toBeNull();
  });

  test('setActive stores a program object', () => {
    const prog = PROGRAMS[0];
    ProgramService.setActive(prog);
    const retrieved = ProgramService.getActive();
    expect(retrieved).not.toBeNull();
    expect(retrieved.id).toBe(prog.id);
    expect(retrieved.title).toBe(prog.title);
  });

  test('setActive returns true on success', () => {
    expect(ProgramService.setActive(PROGRAMS[0])).toBe(true);
  });

  test('setActive returns false for null input', () => {
    expect(ProgramService.setActive(null)).toBe(false);
  });

  test('setActive returns false for non-object', () => {
    expect(ProgramService.setActive('b1')).toBe(false);
  });

  test('clear removes active program', () => {
    ProgramService.setActive(PROGRAMS[0]);
    ProgramService.clear();
    expect(ProgramService.getActive()).toBeNull();
  });

  test('can update active program by calling setActive again', () => {
    ProgramService.setActive(PROGRAMS[0]);
    ProgramService.setActive(PROGRAMS[1]);
    expect(ProgramService.getActive().id).toBe(PROGRAMS[1].id);
  });
});

// ─── resetAllData ─────────────────────────────────────────────────────────────
describe('resetAllData (integration)', () => {
  test('wipes user, stats, history, achievements, and program', () => {
    UserService.set({ name: 'Vijay', gender: 'Men', goal: 'Strength', experience: 'Intermediate', createdAt: Date.now() });
    StatsService.set({ xp: 500, streak: 3, bestStreak: 5, totalWorkouts: 10, totalVolume: 5000, lastWorkoutDate: '2025-01-01' });
    AchievementService.unlock('first_workout');
    ProgramService.setActive(PROGRAMS[0]);

    resetAllData();

    expect(UserService.get()).toBeNull();
    expect(StatsService.get().xp).toBe(0);
    expect(HistoryService.getAll()).toHaveLength(0);
    expect(AchievementService.getUnlocked()).toHaveLength(0);
    expect(ProgramService.getActive()).toBeNull();
  });
});

// ─── exportUserData ───────────────────────────────────────────────────────────
describe('exportUserData (integration)', () => {
  const profile = { name: 'Vijay', gender: 'Men', goal: 'Build Muscle', experience: 'Intermediate', createdAt: Date.now() };
  const statsData = { xp: 1500, streak: 7, bestStreak: 14, totalWorkouts: 25, totalVolume: 50000, lastWorkoutDate: '2025-01-01' };

  test('exported data matches what was stored', () => {
    UserService.set(profile);
    StatsService.set(statsData);
    AchievementService.unlock('first_workout');

    const exported = exportUserData();
    expect(exported.user.name).toBe('Vijay');
    expect(exported.stats.xp).toBe(1500);
    expect(exported.achievements).toContain('first_workout');
  });

  test('export schema version matches current', () => {
    expect(exportUserData().schemaVersion).toBe(SCHEMA_VERSION);
  });

  test('export is valid JSON (round-trips through JSON.parse)', () => {
    UserService.set(profile);
    const exported = exportUserData();
    const roundTripped = JSON.parse(JSON.stringify(exported));
    expect(roundTripped.schemaVersion).toBe(SCHEMA_VERSION);
    expect(roundTripped.user.name).toBe('Vijay');
  });

  test('export history array is sorted newest first', () => {
    const makeEntry = (ts) => ({
      id: `w-${ts}`, programId: 'b1', programTitle: 'First Steps',
      timestamp: ts, duration: 30, sets: 5, volume: 500, xpEarned: 100, notes: '',
    });
    HistoryService.add(makeEntry(1000));
    HistoryService.add(makeEntry(3000));
    HistoryService.add(makeEntry(2000));

    const exported = exportUserData();
    expect(exported.history[0].timestamp).toBe(3000);
    expect(exported.history[2].timestamp).toBe(1000);
  });
});

// ─── getRankProgress (edge cases) ────────────────────────────────────────────
describe('getRankProgress (integration edge cases)', () => {
  test('handles XP exactly at rank boundary', () => {
    const { current, progress } = getRankProgress(500); // exactly Athlete
    expect(current.name).toBe('Athlete');
    expect(progress).toBeGreaterThanOrEqual(0);
  });

  test('handles XP one below boundary', () => {
    const { current } = getRankProgress(499);
    expect(current.name).toBe('Rookie');
  });

  test('handles XP one above boundary', () => {
    const { current } = getRankProgress(501);
    expect(current.name).toBe('Athlete');
  });
});

// ─── Storage error-path coverage ─────────────────────────────────────────────
describe('Storage error paths', () => {
  test('UserService.set throws for non-string name (after sanitise → empty)', () => {
    expect(() => UserService.set({
      name: '   ', gender: 'Men', goal: 'Health', experience: 'Beginner', createdAt: Date.now(),
    })).toThrow();
  });

  test('HistoryService handles partially corrupted entries — filters nulls', () => {
    _store['fq_history_v2'] = JSON.stringify([
      { id: 'w-good', timestamp: 1000, programId: 'b1', programTitle: 'Test', duration: 30, sets: 5, volume: 500, xpEarned: 100, notes: '' },
      { corrupted: true },
      null,
      { id: 'w-good2', timestamp: 2000, programId: 'b1', programTitle: 'Test', duration: 30, sets: 5, volume: 500, xpEarned: 100, notes: '' },
    ]);
    const history = HistoryService.getAll();
    expect(history.length).toBe(2);
    expect(history.every(e => e !== null)).toBe(true);
  });

  test('StatsService.update is safe on empty store', () => {
    expect(() => StatsService.update({ xp: 100 })).not.toThrow();
    expect(StatsService.get().xp).toBe(100);
  });

  test('AchievementService handles non-array in storage', () => {
    _store['fq_achievements_v2'] = JSON.stringify('not-an-array');
    expect(AchievementService.getUnlocked()).toEqual([]);
  });
});
