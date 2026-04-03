import { LIMITS } from '../constants';

// ─── LIGHTWEIGHT SANITISER (no DOMPurify dependency for test env) ─────────────
// In production, replace sanitiseString with DOMPurify.sanitize
function _sanitiseString(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/[<>]/g, '')          // strip angle brackets (XSS vector)
    .replace(/javascript:/gi, '')  // strip js: protocol
    .replace(/on\w+\s*=/gi, '')    // strip inline event handlers
    .slice(0, maxLen);
}

/**
 * Sanitise a user-supplied string input.
 * Strips XSS vectors; enforces max length.
 * @param {*} value
 * @param {number} [maxLen=200]
 * @returns {string}
 */
export function sanitiseString(value, maxLen = 200) {
  return _sanitiseString(value, maxLen);
}

/**
 * Sanitise a name field (shorter limit, stricter pattern).
 * @param {*} value
 * @returns {string}
 */
export function sanitiseName(value) {
  if (typeof value !== 'string') return '';
  // Strip full HTML/script tags before allowing any characters through
  const noTags = value
    .replace(/<[^>]*>/g, '')           // remove everything inside < >
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, LIMITS.NAME_MAX);
  // Allow letters, spaces, hyphens, apostrophes, dots only
  return noTags.replace(/[^a-zA-Z\s'\-.]/g, '').trim();
}

/**
 * Sanitise a numeric input; clamp to [min, max].
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function sanitiseNumber(value, min = 0, max = LIMITS.WEIGHT_MAX) {
  const n = parseFloat(value);
  if (isNaN(n)) return 0;
  return Math.min(max, Math.max(min, n));
}

/**
 * Sanitise rep count (integer, 0-999).
 * @param {*} value
 * @returns {number}
 */
export function sanitiseReps(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return 0;
  return Math.min(LIMITS.REPS_MAX, Math.max(0, n));
}

/**
 * Sanitise weight (float, 0-1000).
 * @param {*} value
 * @returns {number}
 */
export function sanitiseWeight(value) {
  return sanitiseNumber(value, 0, LIMITS.WEIGHT_MAX);
}

/**
 * Sanitise notes field.
 * @param {*} value
 * @returns {string}
 */
export function sanitiseNotes(value) {
  return _sanitiseString(value, LIMITS.NOTES_MAX);
}

/**
 * Validate that a value is one of an allowed set.
 * @param {*} value
 * @param {Array} allowed
 * @param {*} fallback
 * @returns {*}
 */
export function sanitiseEnum(value, allowed, fallback = allowed[0]) {
  if (!Array.isArray(allowed)) return fallback;
  return allowed.includes(value) ? value : fallback;
}

/**
 * Validate and sanitise a complete user profile object read from storage.
 * Returns sanitised object or null if critically malformed.
 * @param {*} raw
 * @returns {object|null}
 */
export function sanitiseUserProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  try {
    return {
      name: sanitiseName(raw.name ?? ''),
      gender: sanitiseEnum(raw.gender, ['All', 'Men', 'Women'], 'All'),
      goal: sanitiseString(raw.goal ?? '', 100),
      experience: sanitiseString(raw.experience ?? '', 60),
      createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Validate and sanitise stats object read from storage.
 * @param {*} raw
 * @returns {object}
 */
export function sanitiseStats(raw) {
  const defaults = {
    xp: 0, streak: 0, bestStreak: 0,
    totalWorkouts: 0, totalVolume: 0, lastWorkoutDate: null,
  };
  if (!raw || typeof raw !== 'object') return defaults;
  return {
    xp: sanitiseNumber(raw.xp, 0, 10_000_000),
    streak: sanitiseNumber(raw.streak, 0, 9999),
    bestStreak: sanitiseNumber(raw.bestStreak, 0, 9999),
    totalWorkouts: sanitiseNumber(raw.totalWorkouts, 0, 99999),
    totalVolume: sanitiseNumber(raw.totalVolume, 0, 100_000_000),
    lastWorkoutDate: typeof raw.lastWorkoutDate === 'string' ? raw.lastWorkoutDate : null,
  };
}

/**
 * Validate a single workout log entry.
 * @param {*} raw
 * @returns {object|null}
 */
export function sanitiseWorkoutEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || typeof raw.timestamp !== 'number') return null;
  return {
    id: sanitiseString(raw.id, 50),
    programId: sanitiseString(raw.programId ?? '', 20),
    programTitle: sanitiseString(raw.programTitle ?? '', 100),
    timestamp: raw.timestamp,
    duration: sanitiseNumber(raw.duration, 0, 86400),
    sets: sanitiseNumber(raw.sets, 0, LIMITS.SETS_MAX * 20),
    volume: sanitiseNumber(raw.volume, 0, 100_000_000),
    xpEarned: sanitiseNumber(raw.xpEarned, 0, 100_000),
    notes: sanitiseNotes(raw.notes ?? ''),
  };
}
