import { STORAGE_KEYS, LEGACY_KEYS, SCHEMA_VERSION, LIMITS } from '../constants';
import {
  sanitiseUserProfile,
  sanitiseStats,
  sanitiseWorkoutEntry,
  sanitiseString,
} from '../utils/sanitise';

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function _write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // Storage quota exceeded or private browsing restriction
    console.error('[StorageService] write failed:', e);
    return false;
  }
}

function _remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ─── SCHEMA MIGRATION ─────────────────────────────────────────────────────────

/**
 * Migrate v1 localStorage keys to v2 schema.
 * Safe to call multiple times (idempotent).
 */
export function migrateV1ToV2() {
  const currentVersion = _read(STORAGE_KEYS.SCHEMA_VERSION);
  if (currentVersion === SCHEMA_VERSION) return false; // already migrated

  let migrated = false;

  // Migrate user profile
  const oldUser = _read(LEGACY_KEYS.USER);
  if (oldUser && !_read(STORAGE_KEYS.USER)) {
    const sanitised = sanitiseUserProfile(oldUser);
    if (sanitised) {
      _write(STORAGE_KEYS.USER, sanitised);
      migrated = true;
    }
  }

  // Migrate stats
  const oldStats = _read(LEGACY_KEYS.STATS);
  if (oldStats && !_read(STORAGE_KEYS.STATS)) {
    const sanitised = sanitiseStats(oldStats);
    _write(STORAGE_KEYS.STATS, sanitised);
    migrated = true;
  }

  // Migrate history
  const oldHistory = _read(LEGACY_KEYS.HISTORY);
  if (Array.isArray(oldHistory) && !_read(STORAGE_KEYS.HISTORY)) {
    const sanitised = oldHistory
      .map(sanitiseWorkoutEntry)
      .filter(Boolean)
      .slice(0, LIMITS.HISTORY_MAX);
    _write(STORAGE_KEYS.HISTORY, sanitised);
    migrated = true;
  }

  // Mark migration complete
  _write(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION);

  if (migrated) {
    console.info('[StorageService] Migrated v1 → v2 successfully');
  }

  return migrated;
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export const UserService = {
  get() {
    const raw = _read(STORAGE_KEYS.USER);
    return sanitiseUserProfile(raw);
  },

  set(profile) {
    const sanitised = sanitiseUserProfile(profile);
    if (!sanitised) throw new Error('Invalid user profile data');
    if (!sanitised.name) throw new Error('User name is required');
    return _write(STORAGE_KEYS.USER, sanitised);
  },

  clear() {
    return _remove(STORAGE_KEYS.USER);
  },

  exists() {
    return this.get() !== null;
  },
};

// ─── STATS ─────────────────────────────────────────────────────────────────────

export const StatsService = {
  get() {
    const raw = _read(STORAGE_KEYS.STATS);
    return sanitiseStats(raw);
  },

  set(stats) {
    const sanitised = sanitiseStats(stats);
    return _write(STORAGE_KEYS.STATS, sanitised);
  },

  update(partial) {
    const current = this.get();
    return this.set({ ...current, ...partial });
  },

  clear() {
    return _remove(STORAGE_KEYS.STATS);
  },
};

// ─── WORKOUT HISTORY ───────────────────────────────────────────────────────────

export const HistoryService = {
  getAll() {
    const raw = _read(STORAGE_KEYS.HISTORY);
    if (!Array.isArray(raw)) return [];
    return raw
      .map(sanitiseWorkoutEntry)
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  add(entry) {
    const sanitised = sanitiseWorkoutEntry(entry);
    if (!sanitised) throw new Error('Invalid workout entry');
    const history = this.getAll();
    // Prepend and enforce max length
    const updated = [sanitised, ...history].slice(0, LIMITS.HISTORY_MAX);
    return _write(STORAGE_KEYS.HISTORY, updated);
  },

  getRecent(n = 7) {
    return this.getAll().slice(0, n);
  },

  clear() {
    return _remove(STORAGE_KEYS.HISTORY);
  },
};

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

export const AchievementService = {
  getUnlocked() {
    const raw = _read(STORAGE_KEYS.ACHIEVEMENTS);
    if (!Array.isArray(raw)) return [];
    return raw.filter((id) => typeof id === 'string').map((id) => sanitiseString(id, 50));
  },

  unlock(achievementId) {
    const unlocked = this.getUnlocked();
    const sanitisedId = sanitiseString(achievementId, 50);
    if (unlocked.includes(sanitisedId)) return false; // already unlocked
    return _write(STORAGE_KEYS.ACHIEVEMENTS, [...unlocked, sanitisedId]);
  },

  isUnlocked(achievementId) {
    return this.getUnlocked().includes(achievementId);
  },

  clear() {
    return _remove(STORAGE_KEYS.ACHIEVEMENTS);
  },
};

// ─── ACTIVE PROGRAM ───────────────────────────────────────────────────────────

export const ProgramService = {
  getActive() {
    return _read(STORAGE_KEYS.PROGRAM);
  },

  setActive(program) {
    if (!program || typeof program !== 'object') return false;
    return _write(STORAGE_KEYS.PROGRAM, program);
  },

  clear() {
    return _remove(STORAGE_KEYS.PROGRAM);
  },
};

// ─── FULL RESET ───────────────────────────────────────────────────────────────

export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(_remove);
  Object.values(LEGACY_KEYS).forEach(_remove);
}

// ─── EXPORT DATA (for portability, NFR-13) ────────────────────────────────────

export function exportUserData() {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    user: UserService.get(),
    stats: StatsService.get(),
    history: HistoryService.getAll(),
    achievements: AchievementService.getUnlocked(),
  };
}
