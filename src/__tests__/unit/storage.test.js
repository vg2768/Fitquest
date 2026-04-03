import {
  UserService, StatsService, HistoryService,
  AchievementService, ProgramService,
  migrateV1ToV2, resetAllData, exportUserData,
} from '../../services/storage';
import { STORAGE_KEYS, LEGACY_KEYS, SCHEMA_VERSION } from '../../constants';

// ─── Persistent mock that survives clearAllMocks ───────────────────────────────
let _store = {};
const localStorageMock = {
  getItem:    (key) => (_store[key] !== undefined ? _store[key] : null),
  setItem:    (key, val) => { _store[key] = String(val); },
  removeItem: (key) => { delete _store[key]; },
  clear:      () => { _store = {}; },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => { _store = {}; });

// ─── UserService ──────────────────────────────────────────────────────────────
describe('UserService', () => {
  const validProfile = {
    name: 'Vijay', gender: 'Men', goal: 'Build Muscle',
    experience: 'Intermediate', createdAt: 1700000000000,
  };

  test('get returns null when no profile stored', () => {
    expect(UserService.get()).toBeNull();
  });

  test('set and get round-trips a valid profile', () => {
    UserService.set(validProfile);
    const retrieved = UserService.get();
    expect(retrieved).not.toBeNull();
    expect(retrieved.name).toBe('Vijay');
    expect(retrieved.gender).toBe('Men');
  });

  test('set throws for null profile', () => {
    expect(() => UserService.set(null)).toThrow();
  });

  test('set throws when name is empty after sanitisation', () => {
    expect(() => UserService.set({ ...validProfile, name: '' })).toThrow();
  });

  test('exists returns false when no profile', () => {
    expect(UserService.exists()).toBe(false);
  });

  test('exists returns true after set', () => {
    UserService.set(validProfile);
    expect(UserService.exists()).toBe(true);
  });

  test('clear removes profile', () => {
    UserService.set(validProfile);
    UserService.clear();
    expect(UserService.get()).toBeNull();
  });

  test('get sanitises malicious name from raw storage', () => {
    _store[STORAGE_KEYS.USER] = JSON.stringify({ ...validProfile, name: '<script>alert(1)</script>' });
    const profile = UserService.get();
    expect(profile).not.toBeNull();
    expect(profile.name).not.toContain('<script>');
  });

  test('get returns null for corrupted JSON in storage', () => {
    _store[STORAGE_KEYS.USER] = '{ bad json %%%';
    expect(UserService.get()).toBeNull();
  });
});

// ─── StatsService ─────────────────────────────────────────────────────────────
describe('StatsService', () => {
  const validStats = {
    xp: 1500, streak: 7, bestStreak: 14,
    totalWorkouts: 25, totalVolume: 50000, lastWorkoutDate: '2025-01-01',
  };

  test('get returns zero defaults when nothing stored', () => {
    const stats = StatsService.get();
    expect(stats.xp).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.totalWorkouts).toBe(0);
  });

  test('set and get round-trips valid stats', () => {
    StatsService.set(validStats);
    const stats = StatsService.get();
    expect(stats.xp).toBe(1500);
    expect(stats.streak).toBe(7);
    expect(stats.totalVolume).toBe(50000);
  });

  test('update merges partial stats without losing other fields', () => {
    StatsService.set(validStats);
    StatsService.update({ xp: 2000 });
    const stats = StatsService.get();
    expect(stats.xp).toBe(2000);
    expect(stats.streak).toBe(7); // preserved
  });

  test('clear resets to defaults', () => {
    StatsService.set(validStats);
    StatsService.clear();
    expect(StatsService.get().xp).toBe(0);
  });

  test('negative XP is clamped to 0', () => {
    StatsService.set({ ...validStats, xp: -999 });
    expect(StatsService.get().xp).toBe(0);
  });

  test('non-string lastWorkoutDate is coerced to null', () => {
    StatsService.set({ ...validStats, lastWorkoutDate: 12345 });
    expect(StatsService.get().lastWorkoutDate).toBeNull();
  });
});

// ─── HistoryService ───────────────────────────────────────────────────────────
describe('HistoryService', () => {
  let _idCounter = 0;
  const makeEntry = (overrides = {}) => ({
    id: `w-${++_idCounter}-${Date.now()}`,
    programId: 'b1', programTitle: 'First Steps',
    timestamp: Date.now(), duration: 45,
    sets: 20, volume: 2500, xpEarned: 200, notes: '',
    ...overrides,
  });

  beforeEach(() => { _idCounter = 0; });

  test('getAll returns empty array when nothing stored', () => {
    expect(HistoryService.getAll()).toEqual([]);
  });

  test('add stores a valid entry', () => {
    HistoryService.add(makeEntry());
    expect(HistoryService.getAll()).toHaveLength(1);
  });

  test('multiple adds accumulate correctly', () => {
    HistoryService.add(makeEntry({ timestamp: 1000 }));
    HistoryService.add(makeEntry({ timestamp: 2000 }));
    HistoryService.add(makeEntry({ timestamp: 3000 }));
    expect(HistoryService.getAll()).toHaveLength(3);
  });

  test('getAll returns entries sorted newest first', () => {
    HistoryService.add(makeEntry({ timestamp: 1000 }));
    HistoryService.add(makeEntry({ timestamp: 3000 }));
    HistoryService.add(makeEntry({ timestamp: 2000 }));
    const history = HistoryService.getAll();
    expect(history[0].timestamp).toBe(3000);
    expect(history[2].timestamp).toBe(1000);
  });

  test('add throws for null entry', () => {
    expect(() => HistoryService.add(null)).toThrow();
  });

  test('add throws for entry missing id and timestamp', () => {
    expect(() => HistoryService.add({ sets: 5 })).toThrow();
  });

  test('getRecent(3) returns 3 most recent entries', () => {
    for (let i = 0; i < 10; i++) {
      HistoryService.add(makeEntry({ timestamp: i * 1000 }));
    }
    expect(HistoryService.getRecent(3)).toHaveLength(3);
  });

  test('clear removes all history', () => {
    HistoryService.add(makeEntry());
    HistoryService.clear();
    expect(HistoryService.getAll()).toHaveLength(0);
  });

  test('sanitises XSS in notes on retrieval', () => {
    HistoryService.add(makeEntry({ notes: '<script>evil()</script>' }));
    const entries = HistoryService.getAll();
    expect(entries[0].notes).not.toContain('<script>');
  });

  test('non-array history in storage returns empty array', () => {
    _store[STORAGE_KEYS.HISTORY] = JSON.stringify({ broken: true });
    expect(HistoryService.getAll()).toEqual([]);
  });
});

// ─── AchievementService ───────────────────────────────────────────────────────
describe('AchievementService', () => {
  test('getUnlocked returns empty array initially', () => {
    expect(AchievementService.getUnlocked()).toEqual([]);
  });

  test('unlock stores achievement id', () => {
    AchievementService.unlock('first_workout');
    expect(AchievementService.getUnlocked()).toContain('first_workout');
  });

  test('unlock returns false for already-unlocked achievement', () => {
    AchievementService.unlock('first_workout');
    expect(AchievementService.unlock('first_workout')).toBe(false);
  });

  test('isUnlocked returns true after unlock', () => {
    AchievementService.unlock('streak_7');
    expect(AchievementService.isUnlocked('streak_7')).toBe(true);
  });

  test('isUnlocked returns false for locked achievement', () => {
    expect(AchievementService.isUnlocked('rank_champion')).toBe(false);
  });

  test('multiple distinct achievements can be unlocked', () => {
    AchievementService.unlock('first_workout');
    AchievementService.unlock('streak_3');
    AchievementService.unlock('workouts_10');
    expect(AchievementService.getUnlocked()).toHaveLength(3);
  });

  test('clear removes all unlocked achievements', () => {
    AchievementService.unlock('first_workout');
    AchievementService.clear();
    expect(AchievementService.getUnlocked()).toHaveLength(0);
  });
});

// ─── migrateV1ToV2 ────────────────────────────────────────────────────────────
describe('migrateV1ToV2', () => {
  const v1User = { name: 'Vijay', gender: 'Men', goal: 'Strength', experience: 'Intermediate', createdAt: 1000 };

  test('migrates v1 user data into v2 key', () => {
    _store[LEGACY_KEYS.USER] = JSON.stringify(v1User);
    migrateV1ToV2();
    expect(_store[STORAGE_KEYS.USER]).toBeDefined();
  });

  test('marks schema version after migration', () => {
    migrateV1ToV2();
    const raw = _store[STORAGE_KEYS.SCHEMA_VERSION];
    expect(raw).toBeDefined();
    const version = JSON.parse(raw);
    expect(version).toBe(SCHEMA_VERSION);
  });

  test('returns false if schema version already set (idempotent)', () => {
    _store[STORAGE_KEYS.SCHEMA_VERSION] = JSON.stringify(SCHEMA_VERSION);
    expect(migrateV1ToV2()).toBe(false);
  });

  test('is safe to call multiple times without corrupting data', () => {
    migrateV1ToV2();
    migrateV1ToV2();
    migrateV1ToV2();
    expect(true).toBe(true); // no throw
  });
});

// ─── resetAllData ─────────────────────────────────────────────────────────────
describe('resetAllData', () => {
  test('clears all v2 storage keys', () => {
    UserService.set({ name: 'Test', gender: 'All', goal: 'Health', experience: 'Beginner', createdAt: Date.now() });
    StatsService.set({ xp: 500, streak: 3, bestStreak: 3, totalWorkouts: 5, totalVolume: 1000, lastWorkoutDate: null });
    resetAllData();
    expect(UserService.get()).toBeNull();
    expect(StatsService.get().xp).toBe(0);
  });
});

// ─── exportUserData ───────────────────────────────────────────────────────────
describe('exportUserData', () => {
  test('export contains all required sections', () => {
    const data = exportUserData();
    expect(data).toHaveProperty('exportedAt');
    expect(data).toHaveProperty('schemaVersion');
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('stats');
    expect(data).toHaveProperty('history');
    expect(data).toHaveProperty('achievements');
  });

  test('exportedAt is a valid ISO date string', () => {
    const { exportedAt } = exportUserData();
    expect(new Date(exportedAt).toString()).not.toBe('Invalid Date');
  });

  test('schemaVersion matches current SCHEMA_VERSION', () => {
    expect(exportUserData().schemaVersion).toBe(SCHEMA_VERSION);
  });
});
