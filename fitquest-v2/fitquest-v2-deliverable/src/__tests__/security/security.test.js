/**
 * Security Test Suite — FitQuest v2
 * Tests XSS prevention, input injection, data integrity, and schema enforcement.
 */

import {
  sanitiseString,
  sanitiseName,
  sanitiseNumber,
  sanitiseEnum,
  sanitiseUserProfile,
  sanitiseStats,
  sanitiseWorkoutEntry,
} from '../../utils/sanitise';
import { UserService, HistoryService } from '../../services/storage';

// ─── localStorage mock (persistent within test, reset between tests) ──────────
let _secStore = {};
const localStorageMock = {
  getItem:    (key) => _secStore[key] !== undefined ? _secStore[key] : null,
  setItem:    (key, val) => { _secStore[key] = String(val); },
  removeItem: (key) => { delete _secStore[key]; },
  clear:      () => { _secStore = {}; },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => { _secStore = {}; });

// ─── XSS ATTACK VECTORS ───────────────────────────────────────────────────────
describe('XSS Prevention', () => {
  const XSS_VECTORS = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    '<a href="javascript:void(0)" onclick="evil()">click</a>',
    '"><script>alert(document.cookie)</script>',
    "'; DROP TABLE users; --",
    '<SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>',
    '<scRipt>alert(1)</scRipt>',
    '<<SCRIPT>alert("XSS");//<</SCRIPT>',
    'onmouseover=alert(1)',
    'onerror=alert(1)',
    '<body onload=alert(1)>',
    '\u003cscript\u003ealert(1)\u003c/script\u003e',
  ];

  XSS_VECTORS.forEach((vector) => {
    test(`blocks XSS vector: ${vector.slice(0, 40)}`, () => {
      const result = sanitiseString(vector);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script');
      expect(result.toLowerCase()).not.toContain('javascript:');
      expect(result.toLowerCase()).not.toMatch(/on\w+\s*=/);
    });
  });

  test('strips XSS from name — leaves only safe name characters', () => {
    const maliciousName = '<script>alert(document.cookie)</script>';
    const sanitised = sanitiseName(maliciousName);
    // Angle brackets and tag syntax stripped
    expect(sanitised).not.toContain('<');
    expect(sanitised).not.toContain('>');
    // Parentheses (function call syntax) stripped
    expect(sanitised).not.toContain('(');
    expect(sanitised).not.toContain(')');
    // The result is only letters, spaces, hyphens, apostrophes, dots
    expect(sanitised).toMatch(/^[a-zA-Z\s'\-\.]*$/);
  });

  test('sanitiseUserProfile strips XSS from name field', () => {
    const profile = sanitiseUserProfile({
      name: '<script>evil()</script>',
      gender: 'Men', goal: 'Strength', experience: 'Beginner', createdAt: Date.now(),
    });
    expect(profile).not.toBeNull();
    expect(profile.name).not.toContain('<');
    expect(profile.name).not.toContain('script');
  });

  test('strips XSS from notes in workout entry', () => {
    const makeEntry = (notes) => ({
      id: 'w-sec-1', programId: 'b1', programTitle: 'Test',
      timestamp: Date.now(), duration: 30, sets: 5, volume: 500, xpEarned: 100, notes,
    });
    XSS_VECTORS.forEach((vector) => {
      const result = sanitiseWorkoutEntry(makeEntry(vector));
      if (result) {
        expect(result.notes).not.toContain('<script');
        expect(result.notes.toLowerCase()).not.toContain('javascript:');
      }
    });
  });
});

// ─── INJECTION PREVENTION ────────────────────────────────────────────────────
describe('Injection Prevention', () => {
  test('handles SQL injection attempts as plain text', () => {
    const sqlAttempts = [
      "'; DROP TABLE users; --",
      "1 OR '1'='1",
      "UNION SELECT * FROM passwords",
    ];
    sqlAttempts.forEach((attempt) => {
      expect(() => sanitiseString(attempt)).not.toThrow();
      expect(typeof sanitiseString(attempt)).toBe('string');
    });
  });

  test('handles JSON injection in string fields', () => {
    const result = sanitiseString('{"admin":true,"role":"superuser"}');
    expect(typeof result).toBe('string');
  });

  test('prototype pollution attempt does not pollute Object prototype', () => {
    const profile = sanitiseUserProfile({
      name: 'Vijay', gender: 'Men', goal: 'Strength',
      experience: 'Intermediate', createdAt: Date.now(),
      '__proto__': { isAdmin: true },
      'constructor': { prototype: { isAdmin: true } },
    });
    expect(profile).not.toBeNull();
    expect(({}).isAdmin).toBeUndefined();
  });
});

// ─── INPUT BOUNDARY ENFORCEMENT ───────────────────────────────────────────────
describe('Input Boundary Enforcement', () => {
  test('truncates oversized string — DoS protection', () => {
    const huge = 'A'.repeat(100_000);
    expect(sanitiseString(huge, 200).length).toBeLessThanOrEqual(200);
  });

  test('handles null bytes without crashing', () => {
    expect(() => sanitiseString('hello\x00world')).not.toThrow();
  });

  test('handles unicode control characters', () => {
    const unicode = '\u202Ealert(1)\u202C';
    expect(() => sanitiseString(unicode)).not.toThrow();
    expect(sanitiseString(unicode).length).toBeLessThanOrEqual(200);
  });

  test('sanitiseNumber rejects Infinity — clamps to max', () => {
    expect(sanitiseNumber(Infinity, 0, 1000)).toBe(1000);
  });

  test('sanitiseNumber rejects -Infinity — clamps to min', () => {
    expect(sanitiseNumber(-Infinity, 0, 1000)).toBe(0);
  });

  test('sanitiseNumber rejects NaN — returns 0', () => {
    expect(sanitiseNumber(NaN, 0, 1000)).toBe(0);
  });

  test('sanitiseEnum rejects undefined', () => {
    expect(sanitiseEnum(undefined, ['A', 'B', 'C'], 'A')).toBe('A');
  });

  test('sanitiseEnum rejects object injection', () => {
    expect(sanitiseEnum({ toString: () => 'A' }, ['A', 'B'], 'B')).toBe('B');
  });
});

// ─── DATA INTEGRITY ───────────────────────────────────────────────────────────
describe('Data Integrity', () => {
  test('corrupted localStorage JSON does not crash app', () => {
    _secStore['fq_user_v2'] = '{ corrupted json %%%';
    expect(() => UserService.get()).not.toThrow();
    expect(UserService.get()).toBeNull();
  });

  test('non-array history in storage returns empty array', () => {
    _secStore['fq_history_v2'] = JSON.stringify({ notAnArray: true });
    expect(() => HistoryService.getAll()).not.toThrow();
    expect(HistoryService.getAll()).toEqual([]);
  });

  test('malformed stats return safe defaults', () => {
    const malformed = sanitiseStats({ xp: 'hacked', streak: [], bestStreak: {} });
    expect(malformed.xp).toBe(0);
    expect(malformed.streak).toBe(0);
  });

  test('workout entry without id is rejected', () => {
    expect(sanitiseWorkoutEntry({ timestamp: Date.now(), sets: 5 })).toBeNull();
  });

  test('workout entry with non-numeric timestamp is rejected', () => {
    expect(sanitiseWorkoutEntry({ id: 'test', timestamp: 'not-a-number' })).toBeNull();
  });

  test('XP is capped at 10M upper bound', () => {
    const stats = sanitiseStats({ xp: 999_999_999_999 });
    expect(stats.xp).toBeLessThanOrEqual(10_000_000);
  });
});

// ─── SCHEMA VALIDATION ────────────────────────────────────────────────────────
describe('Schema Validation', () => {
  test('profile with all required fields passes validation', () => {
    const profile = sanitiseUserProfile({
      name: 'Vijay', gender: 'Men', goal: 'Build Muscle',
      experience: 'Intermediate', createdAt: Date.now(),
    });
    expect(profile).not.toBeNull();
  });

  test('profile with missing name sanitises to empty string', () => {
    const profile = sanitiseUserProfile({
      gender: 'Men', goal: 'Health', experience: 'Beginner', createdAt: Date.now(),
    });
    expect(profile.name).toBe('');
  });

  test('stats schema clamps all negative values to 0', () => {
    const stats = sanitiseStats({
      xp: -100, streak: -5, bestStreak: -1,
      totalWorkouts: -99, totalVolume: -10000, lastWorkoutDate: null,
    });
    expect(stats.xp).toBeGreaterThanOrEqual(0);
    expect(stats.streak).toBeGreaterThanOrEqual(0);
    expect(stats.totalWorkouts).toBeGreaterThanOrEqual(0);
    expect(stats.totalVolume).toBeGreaterThanOrEqual(0);
  });

  test('workout entry clamps negative volume to 0', () => {
    const result = sanitiseWorkoutEntry({
      id: 'w-1', timestamp: Date.now(),
      volume: -9999, sets: 5, duration: 30, xpEarned: 100,
    });
    expect(result?.volume).toBeGreaterThanOrEqual(0);
  });

  test('invalid gender is coerced to All', () => {
    const profile = sanitiseUserProfile({
      name: 'Test', gender: 'Attack Helicopter',
      goal: 'Health', experience: 'Beginner', createdAt: Date.now(),
    });
    expect(profile.gender).toBe('All');
  });
});
