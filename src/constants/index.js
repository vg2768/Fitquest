// ─── SCHEMA VERSION ───────────────────────────────────────────────────────────
export const SCHEMA_VERSION = '2.0.0';

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  USER: 'fq_user_v2',
  STATS: 'fq_stats_v2',
  HISTORY: 'fq_history_v2',
  PROGRAM: 'fq_program_v2',
  ACHIEVEMENTS: 'fq_achievements_v2',
  SCHEMA_VERSION: 'fq_schema_version',
};

// ─── LEGACY KEYS (v1 migration) ───────────────────────────────────────────────
export const LEGACY_KEYS = {
  USER: 'fq_user',
  STATS: 'fq_stats',
  HISTORY: 'fq_history',
  PROGRAM: 'fq_program',
};

// ─── XP & RANK CONFIG ─────────────────────────────────────────────────────────
export const RANKS = [
  { name: 'Rookie',      minXP: 0,      color: '#94a3b8', emoji: '🥉' },
  { name: 'Athlete',     minXP: 500,    color: '#22c55e', emoji: '🏃' },
  { name: 'Competitor',  minXP: 1500,   color: '#3b82f6', emoji: '💪' },
  { name: 'Champion',    minXP: 4000,   color: '#a855f7', emoji: '🏆' },
  { name: 'Elite',       minXP: 10000,  color: '#f59e0b', emoji: '⚡' },
  { name: 'Legend',      minXP: 25000,  color: '#ef4444', emoji: '🔥' },
];

export const XP_REWARDS = {
  BASE_WORKOUT: 100,
  PER_SET: 5,
  PER_100KG_VOLUME: 10,
  STREAK_MULTIPLIER_PER_DAY: 0.05,
  MAX_STREAK_MULTIPLIER: 2.0,
  ACHIEVEMENT_BONUS: 50,
};

// ─── ACHIEVEMENT DEFINITIONS ───────────────────────────────────────────────────
export const ACHIEVEMENT_DEFS = [
  { id: 'first_workout',  label: 'First Step',      desc: 'Complete your first workout',             xp: 50,  icon: '🌱', trigger: (s) => s.totalWorkouts >= 1 },
  { id: 'streak_3',       label: 'Hat Trick',        desc: '3-day workout streak',                   xp: 75,  icon: '🔥', trigger: (s) => s.streak >= 3 },
  { id: 'streak_7',       label: 'Week Warrior',     desc: '7-day workout streak',                   xp: 150, icon: '⚡', trigger: (s) => s.streak >= 7 },
  { id: 'streak_30',      label: 'Iron Discipline',  desc: '30-day workout streak',                  xp: 500, icon: '🏆', trigger: (s) => s.streak >= 30 },
  { id: 'workouts_10',    label: 'Getting Serious',  desc: 'Complete 10 workouts',                   xp: 100, icon: '💪', trigger: (s) => s.totalWorkouts >= 10 },
  { id: 'workouts_50',    label: 'Committed',        desc: 'Complete 50 workouts',                   xp: 300, icon: '🎯', trigger: (s) => s.totalWorkouts >= 50 },
  { id: 'workouts_100',   label: 'Centurion',        desc: 'Complete 100 workouts',                  xp: 750, icon: '💯', trigger: (s) => s.totalWorkouts >= 100 },
  { id: 'volume_10k',     label: 'Heavy Lifter',     desc: 'Lift 10,000 kg total volume',            xp: 200, icon: '🏋️', trigger: (s) => s.totalVolume >= 10000 },
  { id: 'volume_100k',    label: 'Tonnage King',     desc: 'Lift 100,000 kg total volume',           xp: 1000,icon: '👑', trigger: (s) => s.totalVolume >= 100000 },
  { id: 'rank_champion',  label: 'Champion Rise',    desc: 'Reach Champion rank',                    xp: 250, icon: '🥇', trigger: (s) => s.xp >= 4000 },
];

// ─── PROGRAMS ─────────────────────────────────────────────────────────────────
export const PROGRAMS = [
  {
    id: 'b1', level: 'Beginner', tag: 'Full Body', gender: 'All', weeks: 4, days: 3,
    title: 'First Steps', subtitle: 'Your first month of movement',
    emoji: '🌱', color: '#4ade80', dark: '#166534',
    desc: 'Perfect if you have never exercised before. Gentle, guided, zero equipment needed.',
    exercises: ['Bodyweight Squat', 'Wall Push-Up', 'Seated Row', 'Glute Bridge', 'Plank Hold'],
  },
  {
    id: 'b2', level: 'Beginner', tag: 'Women', gender: 'Women', weeks: 6, days: 3,
    title: 'Glow Up', subtitle: 'Tone and confidence for women',
    emoji: '✨', color: '#f472b6', dark: '#831843',
    desc: 'Designed specifically for women. Targets core, glutes, and upper body strength.',
    exercises: ['Hip Thrust', 'Romanian Deadlift', 'Cable Kickback', 'Lateral Raise', 'Calf Raise'],
  },
  {
    id: 'b3', level: 'Beginner', tag: 'Prenatal', gender: 'Women', weeks: 12, days: 3,
    title: 'Mama Strong', subtitle: 'Safe movement through pregnancy',
    emoji: '🤰', color: '#a78bfa', dark: '#4c1d95',
    desc: 'Safe, trimester-aware workouts. Always consult your healthcare provider before starting.',
    exercises: ['Pelvic Floor Hold', 'Seated Leg Press', 'Side-Lying Clam', 'Cat-Cow Stretch', 'Supported Squat'],
  },
  {
    id: 'b4', level: 'Beginner', tag: 'Adaptive', gender: 'All', weeks: 8, days: 3,
    title: 'Able & Strong', subtitle: 'Adaptive fitness for all abilities',
    emoji: '♿', color: '#38bdf8', dark: '#0c4a6e',
    desc: 'Fully modifiable movements. Seated, standing, and resistance band options for every exercise.',
    exercises: ['Seated Press', 'Resistance Band Row', 'Seated Leg Extension', 'Chair Squat', 'Upper Body Circuit'],
  },
  {
    id: 'n1', level: 'Novice', tag: 'Strength', gender: 'All', weeks: 12, days: 3,
    title: 'Starting Strength', subtitle: 'Build your foundation',
    emoji: '🏗️', color: '#fb923c', dark: '#7c2d12',
    desc: 'Linear progression on the big 4 lifts. The most proven beginner strength program.',
    exercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row'],
  },
  {
    id: 'i1', level: 'Intermediate', tag: 'Hypertrophy', gender: 'All', weeks: 16, days: 4,
    title: 'PHUL', subtitle: 'Power Hypertrophy Upper Lower',
    emoji: '💪', color: '#818cf8', dark: '#1e1b4b',
    desc: 'Upper/lower split blending power and hypertrophy days for maximum muscle growth.',
    exercises: ['Bench Press', 'Squat', 'Pull-Up', 'Romanian Deadlift', 'Incline Dumbbell Press', 'Leg Press'],
  },
  {
    id: 'a1', level: 'Advanced', tag: 'Strength', gender: 'All', weeks: 16, days: 4,
    title: '5/3/1 BBB', subtitle: 'Boring But Big method',
    emoji: '⚡', color: '#fbbf24', dark: '#78350f',
    desc: 'Wendler\'s proven system. Heavy triples, joker sets, and high-volume accessory work.',
    exercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'],
  },
  {
    id: 'p1', level: 'Pro', tag: 'Powerlifting', gender: 'All', weeks: 13, days: 4,
    title: 'Sheiko #29', subtitle: 'Russian powerlifting mastery',
    emoji: '🏆', color: '#f87171', dark: '#7f1d1d',
    desc: 'High-frequency, high-volume Russian powerlifting. For the serious competitor.',
    exercises: ['Squat', 'Bench Press', 'Deadlift'],
  },
];

// ─── VALIDATION LIMITS ────────────────────────────────────────────────────────
export const LIMITS = {
  NAME_MAX: 50,
  NOTES_MAX: 500,
  WEIGHT_MAX: 1000,
  REPS_MAX: 999,
  SETS_MAX: 100,
  HISTORY_MAX: 1000,
};

export const GENDERS = ['All', 'Men', 'Women'];
export const GOALS = ['Build Muscle', 'Lose Weight', 'Improve Fitness', 'Increase Strength', 'Maintain Health'];
export const EXPERIENCE_LEVELS = ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced', 'Athlete'];
