import {
  sanitiseString,
  sanitiseName,
  sanitiseNumber,
  sanitiseReps,
  sanitiseWeight,
  sanitiseNotes,
  sanitiseEnum,
  sanitiseUserProfile,
  sanitiseStats,
  sanitiseWorkoutEntry,
} from '../../utils/sanitise';
import { LIMITS } from '../../constants';

// ─── sanitiseString ───────────────────────────────────────────────────────────
describe('sanitiseString', () => {
  test('returns empty string for null input', () => {
    expect(sanitiseString(null)).toBe('');
  });

  test('returns empty string for undefined input', () => {
    expect(sanitiseString(undefined)).toBe('');
  });

  test('returns empty string for number input', () => {
    expect(sanitiseString(42)).toBe('');
  });

  test('returns empty string for object input', () => {
    expect(sanitiseString({})).toBe('');
  });

  test('trims leading and trailing whitespace', () => {
    expect(sanitiseString('  hello  ')).toBe('hello');
  });

  test('strips XSS script tags', () => {
    const result = sanitiseString('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  test('strips angle brackets', () => {
    const result = sanitiseString('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  test('strips javascript: protocol', () => {
    const result = sanitiseString('javascript:alert(1)');
    expect(result.toLowerCase()).not.toContain('javascript:');
  });

  test('strips inline event handlers', () => {
    const result = sanitiseString('text onclick=alert(1) more');
    expect(result.toLowerCase()).not.toMatch(/on\w+\s*=/);
  });

  test('enforces maxLen parameter', () => {
    const long = 'a'.repeat(500);
    expect(sanitiseString(long, 100).length).toBe(100);
  });

  test('passes safe text through unchanged', () => {
    expect(sanitiseString('Hello World')).toBe('Hello World');
  });

  test('handles empty string', () => {
    expect(sanitiseString('')).toBe('');
  });

  test('uses default max length of 200', () => {
    const long = 'x'.repeat(300);
    expect(sanitiseString(long).length).toBe(200);
  });
});

// ─── sanitiseName ─────────────────────────────────────────────────────────────
describe('sanitiseName', () => {
  test('allows letters, spaces, hyphens, apostrophes', () => {
    expect(sanitiseName("O'Brien")).toBe("O'Brien");
    expect(sanitiseName('Mary-Jane')).toBe('Mary-Jane');
    expect(sanitiseName('Jean Paul')).toBe('Jean Paul');
  });

  test('strips numbers from name', () => {
    expect(sanitiseName('User123')).toBe('User');
  });

  test('strips special characters', () => {
    const result = sanitiseName('Name<script>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('script');
  });

  test('enforces NAME_MAX limit', () => {
    const long = 'A'.repeat(100);
    expect(sanitiseName(long).length).toBeLessThanOrEqual(LIMITS.NAME_MAX);
  });

  test('returns empty string for empty input', () => {
    expect(sanitiseName('')).toBe('');
  });

  test('returns empty string for non-string', () => {
    expect(sanitiseName(null)).toBe('');
  });
});

// ─── sanitiseNumber ───────────────────────────────────────────────────────────
describe('sanitiseNumber', () => {
  test('returns number for valid input', () => {
    expect(sanitiseNumber('42', 0, 100)).toBe(42);
  });

  test('clamps to min', () => {
    expect(sanitiseNumber(-50, 0, 100)).toBe(0);
  });

  test('clamps to max', () => {
    expect(sanitiseNumber(9999, 0, 100)).toBe(100);
  });

  test('returns 0 for NaN input', () => {
    expect(sanitiseNumber('abc', 0, 100)).toBe(0);
  });

  test('returns 0 for null', () => {
    expect(sanitiseNumber(null, 0, 100)).toBe(0);
  });

  test('handles float input', () => {
    expect(sanitiseNumber('72.5', 0, 1000)).toBeCloseTo(72.5);
  });
});

// ─── sanitiseReps ─────────────────────────────────────────────────────────────
describe('sanitiseReps', () => {
  test('returns integer for valid input', () => {
    expect(sanitiseReps('10')).toBe(10);
  });

  test('floors float input', () => {
    expect(sanitiseReps('10.9')).toBe(10);
  });

  test('clamps to 0 minimum', () => {
    expect(sanitiseReps(-5)).toBe(0);
  });

  test(`clamps to REPS_MAX (${LIMITS.REPS_MAX})`, () => {
    expect(sanitiseReps(9999)).toBe(LIMITS.REPS_MAX);
  });

  test('returns 0 for non-numeric', () => {
    expect(sanitiseReps('many')).toBe(0);
  });
});

// ─── sanitiseWeight ───────────────────────────────────────────────────────────
describe('sanitiseWeight', () => {
  test('returns float for valid weight', () => {
    expect(sanitiseWeight('102.5')).toBeCloseTo(102.5);
  });

  test('clamps to 0 minimum', () => {
    expect(sanitiseWeight(-10)).toBe(0);
  });

  test(`clamps to WEIGHT_MAX (${LIMITS.WEIGHT_MAX})`, () => {
    expect(sanitiseWeight(9999)).toBe(LIMITS.WEIGHT_MAX);
  });
});

// ─── sanitiseEnum ─────────────────────────────────────────────────────────────
describe('sanitiseEnum', () => {
  const allowed = ['Men', 'Women', 'All'];

  test('returns value if in allowed set', () => {
    expect(sanitiseEnum('Women', allowed)).toBe('Women');
  });

  test('returns fallback for disallowed value', () => {
    expect(sanitiseEnum('Robot', allowed, 'All')).toBe('All');
  });

  test('returns first allowed as default fallback', () => {
    expect(sanitiseEnum('Invalid', allowed)).toBe('Men');
  });

  test('returns fallback for null', () => {
    expect(sanitiseEnum(null, allowed, 'All')).toBe('All');
  });

  test('is case-sensitive', () => {
    expect(sanitiseEnum('men', allowed, 'All')).toBe('All');
  });
});

// ─── sanitiseUserProfile ──────────────────────────────────────────────────────
describe('sanitiseUserProfile', () => {
  const validProfile = {
    name: 'Vijay',
    gender: 'Men',
    goal: 'Build Muscle',
    experience: 'Intermediate',
    createdAt: 1700000000000,
  };

  test('returns sanitised object for valid input', () => {
    const result = sanitiseUserProfile(validProfile);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Vijay');
  });

  test('returns null for null input', () => {
    expect(sanitiseUserProfile(null)).toBeNull();
  });

  test('returns null for non-object', () => {
    expect(sanitiseUserProfile('string')).toBeNull();
  });

  test('sanitises XSS in name field', () => {
    const result = sanitiseUserProfile({ ...validProfile, name: '<script>alert(1)</script>' });
    expect(result).not.toBeNull();
    expect(result.name).not.toContain('<');
  });

  test('falls back to All for invalid gender', () => {
    const result = sanitiseUserProfile({ ...validProfile, gender: 'Attack helicopter' });
    expect(result.gender).toBe('All');
  });

  test('sets createdAt to now if missing', () => {
    const before = Date.now();
    const result = sanitiseUserProfile({ ...validProfile, createdAt: undefined });
    const after = Date.now();
    expect(result.createdAt).toBeGreaterThanOrEqual(before);
    expect(result.createdAt).toBeLessThanOrEqual(after);
  });
});

// ─── sanitiseStats ────────────────────────────────────────────────────────────
describe('sanitiseStats', () => {
  const validStats = {
    xp: 1500, streak: 7, bestStreak: 14,
    totalWorkouts: 25, totalVolume: 50000, lastWorkoutDate: '2025-01-01',
  };

  test('returns correct values for valid input', () => {
    const result = sanitiseStats(validStats);
    expect(result.xp).toBe(1500);
    expect(result.streak).toBe(7);
    expect(result.totalWorkouts).toBe(25);
  });

  test('returns defaults for null input', () => {
    const result = sanitiseStats(null);
    expect(result.xp).toBe(0);
    expect(result.streak).toBe(0);
  });

  test('clamps negative XP to 0', () => {
    expect(sanitiseStats({ ...validStats, xp: -500 }).xp).toBe(0);
  });

  test('rejects non-string lastWorkoutDate', () => {
    const result = sanitiseStats({ ...validStats, lastWorkoutDate: 12345 });
    expect(result.lastWorkoutDate).toBeNull();
  });
});

// ─── sanitiseWorkoutEntry ─────────────────────────────────────────────────────
describe('sanitiseWorkoutEntry', () => {
  const validEntry = {
    id: 'workout-123',
    programId: 'b1',
    programTitle: 'First Steps',
    timestamp: 1700000000000,
    duration: 45,
    sets: 20,
    volume: 2500,
    xpEarned: 250,
    notes: 'Great session',
  };

  test('returns sanitised object for valid entry', () => {
    const result = sanitiseWorkoutEntry(validEntry);
    expect(result).not.toBeNull();
    expect(result.id).toBe('workout-123');
    expect(result.sets).toBe(20);
  });

  test('returns null for null input', () => {
    expect(sanitiseWorkoutEntry(null)).toBeNull();
  });

  test('returns null if id is missing', () => {
    expect(sanitiseWorkoutEntry({ ...validEntry, id: undefined })).toBeNull();
  });

  test('returns null if timestamp is missing', () => {
    expect(sanitiseWorkoutEntry({ ...validEntry, timestamp: undefined })).toBeNull();
  });

  test('sanitises XSS in notes field', () => {
    const result = sanitiseWorkoutEntry({ ...validEntry, notes: '<script>alert(1)</script>' });
    expect(result.notes).not.toContain('<');
  });

  test('clamps negative duration to 0', () => {
    const result = sanitiseWorkoutEntry({ ...validEntry, duration: -100 });
    expect(result.duration).toBe(0);
  });
});
