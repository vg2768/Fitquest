import { useState, useEffect, useRef, useContext, createContext, useCallback, useMemo, memo, Component } from "react";
import { signInWithGoogle, signInWithFacebook, signOutUser, isFirebaseConfigured } from "./firebase";

// ─── THEME ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext();

const DARK = {
  bg: "#080F08", card: "#101810", cardAlt: "#0A120A", border: "#1A2E1A",
  inputBg: "#0A120A", inputBorder: "#253525", text: "#EFF7EF", muted: "#7A9E7A",
  faint: "#4A6B4A", subtle: "#2E3F2E", accent: "#22C55E", accentLight: "#4ADE80",
  accentDark: "#15803D", accentBg: "#0B2010", accentBorder: "#164430",
  success: "#14532D", successText: "#4ADE80", navBg: "#080F08", navBorder: "#1A2E1A",
  shadow: "none", errorBg: "#1a0a0a", errorBorder: "#7f1d1d",
  warningBg: "#1a0f00", warningBorder: "#92400e",
};

const LIGHT = {
  bg: "#F4FAF4", card: "#FFFFFF", cardAlt: "#F0F7F0", border: "#D1E8D1",
  inputBg: "#FAFCFA", inputBorder: "#C5DFC5", text: "#0A1A0A", muted: "#3D6342",
  faint: "#6B8F6E", subtle: "#A8C5A8", accent: "#16A34A", accentLight: "#22C55E",
  accentDark: "#15803D", accentBg: "#DCFCE7", accentBorder: "#BBF7D0",
  success: "#15803D", successText: "#16A34A", navBg: "#FFFFFF", navBorder: "#E5EFE5",
  shadow: "0 1px 6px rgba(0,0,0,0.06)", errorBg: "#FEF2F2", errorBorder: "#FECACA",
  warningBg: "#FFFBEB", warningBorder: "#FDE68A",
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROGRAMS = [
  // BEGINNER
  {
    id: "b1", level: "Beginner", tag: "Full Body", gender: "All", weeks: 4, days: 3,
    title: "First Steps", subtitle: "Your first month of movement",
    emoji: "🌱", color: "#4ade80", dark: "#166534",
    desc: "Perfect if you've never exercised before. Gentle, guided, zero equipment needed.",
    workouts: [
      { day: "Mon", name: "Upper Body Basics", exercises: [
        { name: "Wall Push-ups", sets: 3, reps: "8-10", rest: 60, muscle: "Chest" },
        { name: "Chair Dips", sets: 3, reps: "6-8", rest: 60, muscle: "Triceps" },
        { name: "Arm Circles", sets: 2, reps: "20", rest: 30, muscle: "Shoulders" },
        { name: "Seated Row (Band)", sets: 3, reps: "10", rest: 60, muscle: "Back" },
      ]},
      { day: "Wed", name: "Lower Body & Core", exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "10-12", rest: 60, muscle: "Quads" },
        { name: "Glute Bridges", sets: 3, reps: "12", rest: 45, muscle: "Glutes" },
        { name: "Calf Raises", sets: 3, reps: "15", rest: 30, muscle: "Calves" },
        { name: "Dead Bug", sets: 2, reps: "8 each side", rest: 45, muscle: "Core" },
      ]},
      { day: "Fri", name: "Full Body Flow", exercises: [
        { name: "March in Place", sets: 1, reps: "2 min", rest: 30, muscle: "Cardio" },
        { name: "Incline Push-ups", sets: 3, reps: "8", rest: 60, muscle: "Chest" },
        { name: "Step-ups", sets: 3, reps: "10 each leg", rest: 60, muscle: "Legs" },
        { name: "Plank Hold", sets: 3, reps: "15 sec", rest: 30, muscle: "Core" },
      ]},
    ]
  },
  {
    id: "b2", level: "Beginner", tag: "Women", gender: "Women", weeks: 6, days: 3,
    title: "Glow Up", subtitle: "Tone & build confidence",
    emoji: "✨", color: "#f472b6", dark: "#831843",
    desc: "Designed for women starting their fitness journey. Focus on toning and building strength.",
    workouts: [
      { day: "Mon", name: "Booty & Legs", exercises: [
        { name: "Sumo Squats", sets: 3, reps: "15", rest: 45, muscle: "Glutes" },
        { name: "Donkey Kicks", sets: 3, reps: "12 each", rest: 30, muscle: "Glutes" },
        { name: "Fire Hydrants", sets: 3, reps: "12 each", rest: 30, muscle: "Hip Abductors" },
        { name: "Wall Sit", sets: 3, reps: "20 sec", rest: 45, muscle: "Quads" },
      ]},
      { day: "Wed", name: "Core & Arms", exercises: [
        { name: "Knee Push-ups", sets: 3, reps: "10", rest: 45, muscle: "Chest" },
        { name: "Bicycle Crunches", sets: 3, reps: "20", rest: 30, muscle: "Core" },
        { name: "Superman Hold", sets: 3, reps: "10 sec", rest: 30, muscle: "Back" },
        { name: "Side Planks", sets: 2, reps: "15 sec each", rest: 30, muscle: "Obliques" },
      ]},
      { day: "Fri", name: "Full Body Burn", exercises: [
        { name: "Jumping Jacks", sets: 3, reps: "30 sec", rest: 30, muscle: "Cardio" },
        { name: "Reverse Lunges", sets: 3, reps: "10 each leg", rest: 45, muscle: "Quads" },
        { name: "Tricep Dips", sets: 3, reps: "10", rest: 45, muscle: "Triceps" },
        { name: "Plank", sets: 3, reps: "20 sec", rest: 30, muscle: "Core" },
      ]},
    ]
  },
  {
    id: "b3", level: "Beginner", tag: "Prenatal", gender: "Women", weeks: 12, days: 3,
    title: "Mama Strong", subtitle: "Safe movement for every trimester",
    emoji: "🤰", color: "#fb923c", dark: "#7c2d12",
    desc: "OB-approved exercises for all trimesters. Focus on pelvic floor, back strength, and gentle cardio.",
    workouts: [
      { day: "Mon", name: "Pelvic Floor & Core", exercises: [
        { name: "Kegel Exercises", sets: 3, reps: "10 hold 5s", rest: 30, muscle: "Pelvic Floor" },
        { name: "Bird-Dog", sets: 3, reps: "8 each side", rest: 45, muscle: "Core" },
        { name: "Cat-Cow", sets: 2, reps: "10", rest: 30, muscle: "Spine" },
        { name: "Seated Deep Breathing", sets: 1, reps: "2 min", rest: 0, muscle: "Breathing" },
      ]},
      { day: "Wed", name: "Gentle Strength", exercises: [
        { name: "Wall Push-ups", sets: 3, reps: "10", rest: 45, muscle: "Chest" },
        { name: "Seated Row (Band)", sets: 3, reps: "12", rest: 45, muscle: "Back" },
        { name: "Standing Hip Abduction", sets: 3, reps: "12 each", rest: 30, muscle: "Hips" },
        { name: "Calf Raises", sets: 3, reps: "15", rest: 30, muscle: "Calves" },
      ]},
      { day: "Fri", name: "Gentle Cardio", exercises: [
        { name: "Marching in Place", sets: 1, reps: "5 min", rest: 0, muscle: "Cardio" },
        { name: "Side Steps", sets: 3, reps: "30 sec", rest: 20, muscle: "Legs" },
        { name: "Arm Swings", sets: 2, reps: "30 sec", rest: 20, muscle: "Shoulders" },
        { name: "Gentle Yoga Stretch", sets: 1, reps: "5 min", rest: 0, muscle: "Flexibility" },
      ]},
    ]
  },
  {
    id: "b4", level: "Beginner", tag: "Adaptive", gender: "All", weeks: 4, days: 3,
    title: "Able & Strong", subtitle: "Fitness without limits",
    emoji: "♿", color: "#60a5fa", dark: "#1e3a8a",
    desc: "Fully seated or supported workouts. Every exercise has modifications. Inclusive fitness for everyone.",
    workouts: [
      { day: "Mon", name: "Seated Upper Body", exercises: [
        { name: "Seated Shoulder Press", sets: 3, reps: "10", rest: 60, muscle: "Shoulders" },
        { name: "Seated Bicep Curl", sets: 3, reps: "12", rest: 45, muscle: "Biceps" },
        { name: "Seated Chest Squeeze", sets: 3, reps: "15", rest: 30, muscle: "Chest" },
        { name: "Neck Rolls", sets: 1, reps: "5 each side", rest: 0, muscle: "Neck" },
      ]},
      { day: "Wed", name: "Seated Core & Lower", exercises: [
        { name: "Seated Leg Raises", sets: 3, reps: "10", rest: 45, muscle: "Core" },
        { name: "Seated Marching", sets: 3, reps: "20", rest: 30, muscle: "Hips" },
        { name: "Seated Torso Twist", sets: 3, reps: "10 each side", rest: 30, muscle: "Obliques" },
        { name: "Ankle Circles", sets: 2, reps: "10 each", rest: 0, muscle: "Ankles" },
      ]},
      { day: "Fri", name: "Full Seated Circuit", exercises: [
        { name: "Seated Punches", sets: 3, reps: "30 sec", rest: 30, muscle: "Cardio" },
        { name: "Chair Squats", sets: 3, reps: "8", rest: 60, muscle: "Legs" },
        { name: "Resistance Band Pull-apart", sets: 3, reps: "12", rest: 45, muscle: "Back" },
        { name: "Deep Breathing", sets: 1, reps: "3 min", rest: 0, muscle: "Recovery" },
      ]},
    ]
  },
  // NOVICE
  {
    id: "n1", level: "Novice", tag: "Strength", gender: "All", weeks: 8, days: 3,
    title: "Starting Strength", subtitle: "Build your foundation",
    emoji: "💪", color: "#facc15", dark: "#713f12",
    desc: "Classic barbell program. Squat, Bench, Deadlift. Add weight every session.",
    workouts: [
      { day: "Mon", name: "Workout A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "5", rest: 180, muscle: "Quads" },
        { name: "Bench Press", sets: 3, reps: "5", rest: 180, muscle: "Chest" },
        { name: "Deadlift", sets: 1, reps: "5", rest: 300, muscle: "Back" },
      ]},
      { day: "Wed", name: "Workout B", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "5", rest: 180, muscle: "Quads" },
        { name: "Overhead Press", sets: 3, reps: "5", rest: 180, muscle: "Shoulders" },
        { name: "Barbell Row", sets: 3, reps: "5", rest: 180, muscle: "Back" },
      ]},
      { day: "Fri", name: "Workout A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "5", rest: 180, muscle: "Quads" },
        { name: "Bench Press", sets: 3, reps: "5", rest: 180, muscle: "Chest" },
        { name: "Deadlift", sets: 1, reps: "5", rest: 300, muscle: "Back" },
      ]},
    ]
  },
  // INTERMEDIATE
  {
    id: "i1", level: "Intermediate", tag: "Hypertrophy", gender: "All", weeks: 12, days: 4,
    title: "PHUL", subtitle: "Power Hypertrophy Upper Lower",
    emoji: "🔥", color: "#f97316", dark: "#7c2d12",
    desc: "4-day upper/lower split combining power and hypertrophy training.",
    workouts: [
      { day: "Mon", name: "Upper Power", exercises: [
        { name: "Bench Press", sets: 3, reps: "3-5", rest: 180, muscle: "Chest" },
        { name: "Bent Over Row", sets: 3, reps: "3-5", rest: 180, muscle: "Back" },
        { name: "Overhead Press", sets: 3, reps: "5", rest: 120, muscle: "Shoulders" },
        { name: "Pull-ups", sets: 3, reps: "Max", rest: 120, muscle: "Back" },
      ]},
      { day: "Tue", name: "Lower Power", exercises: [
        { name: "Squat", sets: 3, reps: "3-5", rest: 180, muscle: "Quads" },
        { name: "Deadlift", sets: 3, reps: "3-5", rest: 180, muscle: "Hamstrings" },
        { name: "Leg Press", sets: 3, reps: "10-12", rest: 90, muscle: "Quads" },
        { name: "Leg Curl", sets: 3, reps: "10-12", rest: 90, muscle: "Hamstrings" },
      ]},
      { day: "Thu", name: "Upper Hypertrophy", exercises: [
        { name: "Incline DB Press", sets: 4, reps: "8-12", rest: 90, muscle: "Chest" },
        { name: "Cable Row", sets: 4, reps: "8-12", rest: 90, muscle: "Back" },
        { name: "Lateral Raises", sets: 4, reps: "12-15", rest: 60, muscle: "Shoulders" },
        { name: "Tricep Pushdown", sets: 3, reps: "10-12", rest: 60, muscle: "Triceps" },
        { name: "Barbell Curl", sets: 3, reps: "10-12", rest: 60, muscle: "Biceps" },
      ]},
      { day: "Fri", name: "Lower Hypertrophy", exercises: [
        { name: "Front Squat", sets: 4, reps: "8-12", rest: 90, muscle: "Quads" },
        { name: "Romanian Deadlift", sets: 4, reps: "8-12", rest: 90, muscle: "Hamstrings" },
        { name: "Hip Thrust", sets: 3, reps: "12-15", rest: 60, muscle: "Glutes" },
        { name: "Calf Raises", sets: 5, reps: "12-15", rest: 60, muscle: "Calves" },
      ]},
    ]
  },
  // ADVANCED
  {
    id: "a1", level: "Advanced", tag: "Strength", gender: "All", weeks: 16, days: 5,
    title: "5/3/1 BBB", subtitle: "Boring But Big protocol",
    emoji: "⚡", color: "#a78bfa", dark: "#3b0764",
    desc: "Jim Wendler's proven system for long-term strength and size gains.",
    workouts: [
      { day: "Mon", name: "Press Day", exercises: [
        { name: "Overhead Press (5/3/1)", sets: 3, reps: "5/3/1", rest: 180, muscle: "Shoulders" },
        { name: "Overhead Press (BBB)", sets: 5, reps: "10 @ 50%", rest: 120, muscle: "Shoulders" },
        { name: "Chin-ups", sets: 5, reps: "10", rest: 90, muscle: "Back" },
        { name: "Face Pulls", sets: 5, reps: "15", rest: 60, muscle: "Rear Delt" },
      ]},
      { day: "Wed", name: "Deadlift Day", exercises: [
        { name: "Deadlift (5/3/1)", sets: 3, reps: "5/3/1", rest: 300, muscle: "Back" },
        { name: "Deadlift (BBB)", sets: 5, reps: "10 @ 50%", rest: 180, muscle: "Back" },
        { name: "Leg Press", sets: 5, reps: "10", rest: 90, muscle: "Quads" },
        { name: "Leg Curl", sets: 5, reps: "10", rest: 60, muscle: "Hamstrings" },
      ]},
      { day: "Fri", name: "Bench Day", exercises: [
        { name: "Bench Press (5/3/1)", sets: 3, reps: "5/3/1", rest: 180, muscle: "Chest" },
        { name: "Bench Press (BBB)", sets: 5, reps: "10 @ 50%", rest: 120, muscle: "Chest" },
        { name: "DB Row", sets: 5, reps: "10 each", rest: 60, muscle: "Back" },
        { name: "Tricep Dips", sets: 5, reps: "10", rest: 60, muscle: "Triceps" },
      ]},
      { day: "Sat", name: "Squat Day", exercises: [
        { name: "Squat (5/3/1)", sets: 3, reps: "5/3/1", rest: 300, muscle: "Quads" },
        { name: "Squat (BBB)", sets: 5, reps: "10 @ 50%", rest: 180, muscle: "Quads" },
        { name: "Romanian Deadlift", sets: 5, reps: "10", rest: 90, muscle: "Hamstrings" },
        { name: "Hanging Leg Raise", sets: 5, reps: "10", rest: 60, muscle: "Core" },
      ]},
    ]
  },
  // PRO
  {
    id: "p1", level: "Pro", tag: "Powerlifting", gender: "All", weeks: 16, days: 6,
    title: "Sheiko #29", subtitle: "Russian powerlifting system",
    emoji: "🏆", color: "#ef4444", dark: "#7f1d1d",
    desc: "Elite Russian program. High frequency, high volume. Not for the faint of heart.",
    workouts: [
      { day: "Mon", name: "Heavy Squat + Bench", exercises: [
        { name: "Squat", sets: 5, reps: "5 @ 80%", rest: 300, muscle: "Quads" },
        { name: "Bench Press", sets: 5, reps: "5 @ 80%", rest: 180, muscle: "Chest" },
        { name: "Squat (down sets)", sets: 3, reps: "3 @ 75%", rest: 240, muscle: "Quads" },
        { name: "Good Mornings", sets: 4, reps: "5", rest: 120, muscle: "Hamstrings" },
      ]},
      { day: "Wed", name: "Bench + Deadlift", exercises: [
        { name: "Bench Press", sets: 4, reps: "5 @ 75%", rest: 180, muscle: "Chest" },
        { name: "Deadlift", sets: 4, reps: "4 @ 80%", rest: 300, muscle: "Back" },
        { name: "Incline Press", sets: 4, reps: "6", rest: 120, muscle: "Chest" },
        { name: "Romanian Deadlift", sets: 3, reps: "5", rest: 180, muscle: "Hamstrings" },
      ]},
      { day: "Fri", name: "Squat + Bench", exercises: [
        { name: "Squat", sets: 4, reps: "5 @ 75%", rest: 240, muscle: "Quads" },
        { name: "Bench Press", sets: 4, reps: "6 @ 70%", rest: 180, muscle: "Chest" },
        { name: "Box Squats", sets: 3, reps: "5", rest: 180, muscle: "Quads" },
        { name: "Floor Press", sets: 3, reps: "6", rest: 120, muscle: "Chest" },
      ]},
    ]
  },
];

const ACHIEVEMENTS = [
  { id: "first_workout", icon: "🎯", name: "First Steps", desc: "Complete your first workout", xp: 100, unlocked: false },
  { id: "streak_3", icon: "🔥", name: "On Fire", desc: "3-day workout streak", xp: 150, unlocked: false },
  { id: "streak_7", icon: "⚡", name: "Weekly Warrior", desc: "7-day streak", xp: 500, unlocked: false },
  { id: "streak_30", icon: "💎", name: "Iron Will", desc: "30-day streak", xp: 2000, unlocked: false },
  { id: "workouts_10", icon: "💪", name: "Getting Serious", desc: "Complete 10 workouts", xp: 300, unlocked: false },
  { id: "workouts_50", icon: "🏅", name: "Dedicated", desc: "Complete 50 workouts", xp: 1000, unlocked: false },
  { id: "workouts_100", icon: "🏆", name: "Century Club", desc: "100 workouts done", xp: 3000, unlocked: false },
  { id: "pr", icon: "🎉", name: "New Record!", desc: "Set a personal record", xp: 200, unlocked: false },
  { id: "early_bird", icon: "🌅", name: "Early Bird", desc: "Workout before 7am", xp: 150, unlocked: false },
  { id: "night_owl", icon: "🦉", name: "Night Owl", desc: "Workout after 9pm", xp: 150, unlocked: false },
];

const LEVELS = [
  { min: 0, max: 500, rank: "Rookie", icon: "🌱" },
  { min: 500, max: 1500, rank: "Trainee", icon: "💪" },
  { min: 1500, max: 3500, rank: "Fighter", icon: "⚔️" },
  { min: 3500, max: 7000, rank: "Warrior", icon: "🛡️" },
  { min: 7000, max: 15000, rank: "Champion", icon: "🏆" },
  { min: 15000, max: Infinity, rank: "Legend", icon: "🌟" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getLevelInfo(xp) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

function getLevelProgress(xp) {
  const lvl = getLevelInfo(xp);
  if (lvl.max === Infinity) return 100;
  return Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100);
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

// Strip HTML tags and limit length to prevent stored XSS
function sanitize(str, maxLen = 200) {
  return String(str ?? "").replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, maxLen);
}

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#080F08", color: "#EFF7EF", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: "#7A9E7A", marginBottom: 20, fontSize: 14 }}>Please refresh to try again.</p>
            <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", borderRadius: 12, background: "#22C55E", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Refresh App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const XPBar = memo(function XPBar({ xp }) {
  const { t } = useContext(ThemeContext);
  const lvl = getLevelInfo(xp);
  const prog = getLevelProgress(xp);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.muted }}>
        <span>{lvl.icon} {lvl.rank}</span>
        <span>{xp.toLocaleString()} XP</span>
      </div>
      <div style={{ background: t.border, borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${prog}%`, height: "100%", background: `linear-gradient(90deg,${t.accent},${t.accentLight})`, borderRadius: 99, transition: "width 1s ease" }} />
      </div>
    </div>
  );
});

// eslint-disable-next-line no-unused-vars
function Badge({ emoji, label, sub, color }) {
  const { t } = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: t.card, borderRadius: 12, border: `1px solid ${color}22` }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: t.faint }}>{sub}</div>}
      </div>
    </div>
  );
}

function Pill({ children, active, color, onClick }) {
  const { t } = useContext(ThemeContext);
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
      background: active ? (color || t.accent) : t.border,
      color: active ? "#fff" : t.faint,
      transition: "all 0.2s",
      flexShrink: 0,
    }}>{children}</button>
  );
}

function Timer({ onDone }) {
  const { t } = useContext(ThemeContext);
  const [secs, setSecs] = useState(90);
  const [running, setRunning] = useState(false);
  const [initial, setInitial] = useState(90);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { clearInterval(ref.current); setRunning(false); onDone?.(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = (secs / initial) * 283;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={80} height={80} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={45} fill="none" stroke={t.border} strokeWidth={8} />
        <circle cx={50} cy={50} r={45} fill="none" stroke={t.accent} strokeWidth={8}
          strokeDasharray="283" strokeDashoffset={283 - pct}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s linear" }} />
        <text x={50} y={55} textAnchor="middle" fontSize={18} fill={t.text} fontWeight="bold">{formatTime(secs)}</text>
      </svg>
      <div style={{ display: "flex", gap: 8 }}>
        {[60, 90, 120, 180].map(tv => (
          <button key={tv} onClick={() => { setSecs(tv); setInitial(tv); setRunning(false); }}
            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, border: `1px solid ${t.inputBorder}`, background: initial === tv ? t.accent : "transparent", color: initial === tv ? "#fff" : t.faint, cursor: "pointer" }}>
            {tv}s
          </button>
        ))}
      </div>
      <button onClick={() => setRunning(r => !r)} style={{
        padding: "8px 24px", borderRadius: 99, background: running ? "#ef4444" : t.accent,
        color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer"
      }}>{running ? "⏸ Pause" : "▶ Start"}</button>
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// ─── SOCIAL LOGIN ICONS ───────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#fff"/>
    </svg>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

function LoginScreen({ onGoogle, onFacebook, onManual, authLoading, authError }) {
  const { t } = useContext(ThemeContext);
  const configured = isFirebaseConfigured;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>🏋️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: -0.5, fontFamily: '"DM Serif Display", serif' }}>FitQuest</h1>
          <p style={{ fontSize: 15, color: t.faint, marginTop: 8 }}>Your gamified fitness journey starts here</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Firebase not configured banner */}
          {!configured && (
            <div style={{ background: t.warningBg, border: `1px solid ${t.warningBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: 4 }}>
              <p style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600, marginBottom: 4 }}>Firebase not configured</p>
              <p style={{ fontSize: 11, color: "#d97706", lineHeight: 1.5 }}>
                Edit <code style={{ background: t.cardAlt, padding: "1px 5px", borderRadius: 4 }}>src/firebase.js</code> and add your project credentials to enable Google &amp; Facebook login.
              </p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={onGoogle}
            disabled={!configured || !!authLoading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "15px", borderRadius: 14, background: configured ? "#fff" : t.border,
              color: configured ? "#1a1a1a" : t.subtle, fontWeight: 700, fontSize: 15,
              border: "none", cursor: (!configured || authLoading) ? "not-allowed" : "pointer",
              opacity: authLoading && authLoading !== "google" ? 0.5 : 1, transition: "opacity 0.2s",
            }}
          >
            {authLoading === "google"
              ? <span style={{ color: "#666" }}>Connecting…</span>
              : <><GoogleIcon /> Continue with Google</>}
          </button>

          {/* Facebook */}
          <button
            onClick={onFacebook}
            disabled={!configured || !!authLoading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "15px", borderRadius: 14, background: configured ? "#1877F2" : t.border,
              color: "#fff", fontWeight: 700, fontSize: 15,
              border: "none", cursor: (!configured || authLoading) ? "not-allowed" : "pointer",
              opacity: authLoading && authLoading !== "facebook" ? 0.5 : 1, transition: "opacity 0.2s",
            }}
          >
            {authLoading === "facebook"
              ? "Connecting…"
              : <><FacebookIcon /> Continue with Facebook</>}
          </button>

          {/* Auth error */}
          {authError && (
            <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#f87171", textAlign: "center" }}>{authError}</p>
            </div>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <span style={{ fontSize: 12, color: t.inputBorder, fontWeight: 600, letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>

          {/* Manual */}
          <button
            onClick={onManual}
            disabled={!!authLoading}
            style={{
              padding: "15px", borderRadius: 14, background: "transparent",
              color: t.muted, fontWeight: 600, fontSize: 14,
              border: `1px solid ${t.border}`, cursor: authLoading ? "not-allowed" : "pointer",
            }}
          >
            Continue without account
          </button>
        </div>

        <p style={{ fontSize: 11, color: t.border, textAlign: "center", marginTop: 24 }}>
          By continuing you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function Onboarding({ onDone }) {
  const { t } = useContext(ThemeContext);
  const [showLogin, setShowLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", gender: "All", goal: "Build Muscle", level: "Beginner" });
  const [authLoading, setAuthLoading] = useState(null);
  const [authError, setAuthError] = useState(null);

  const handleSocialLogin = async (provider) => {
    setAuthLoading(provider);
    setAuthError(null);
    try {
      const result = await (provider === "google" ? signInWithGoogle() : signInWithFacebook());
      const fbUser = result.user;
      setData(d => ({
        ...d,
        name: fbUser.displayName || "",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || null,
        uid: fbUser.uid,
        authProvider: provider,
      }));
      setShowLogin(false);
      setStep(1); // name is pre-filled from OAuth — skip to gender step
    } catch (err) {
      const msg = err.code === "auth/popup-closed-by-user"
        ? "Login was cancelled."
        : err.message;
      setAuthError(msg);
    } finally {
      setAuthLoading(null);
    }
  };

  if (showLogin) {
    return (
      <LoginScreen
        onGoogle={() => handleSocialLogin("google")}
        onFacebook={() => handleSocialLogin("facebook")}
        onManual={() => { setShowLogin(false); setStep(0); }}
        authLoading={authLoading}
        authError={authError}
      />
    );
  }

  const steps = [
    {
      title: "Welcome to FitQuest 🏋️",
      sub: "Your gamified fitness journey starts here.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, color: t.faint, textTransform: "uppercase", letterSpacing: 1 }}>Your name</label>
          <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
            placeholder="Enter your name..."
            style={{ padding: "14px 16px", background: t.card, border: `1px solid ${t.inputBorder}`, borderRadius: 12, color: t.text, fontSize: 15 }} />
        </div>
      )
    },
    {
      title: "I am a...",
      sub: "We'll personalize programs for you.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["Men", "Women", "Prefer not to say"].map(g => (
            <button key={g} onClick={() => setData({ ...data, gender: g === "Prefer not to say" ? "All" : g })}
              style={{ padding: "16px", borderRadius: 12, border: `2px solid ${data.gender === (g === "Prefer not to say" ? "All" : g) ? t.accent : t.border}`, background: data.gender === (g === "Prefer not to say" ? "All" : g) ? t.accentBg : t.card, color: t.text, fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
              {g === "Men" ? "👨 " : g === "Women" ? "👩 " : "🧑 "}{g}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Your main goal?",
      sub: "Pick what drives you.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Build Muscle", "💪"], ["Lose Fat", "🔥"], ["Get Stronger", "⚡"], ["Stay Active", "🌱"], ["Sport Performance", "🏅"]].map(([g, e]) => (
            <button key={g} onClick={() => setData({ ...data, goal: g })}
              style={{ padding: "16px", borderRadius: 12, border: `2px solid ${data.goal === g ? t.accent : t.border}`, background: data.goal === g ? t.accentBg : t.card, color: t.text, fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
              {e} {g}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Experience level?",
      sub: "Be honest — you can always change later.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Beginner", "Never worked out or less than 6 months", "🌱"], ["Novice", "6–18 months", "💪"], ["Intermediate", "1–3 years", "⚡"], ["Advanced", "3+ years", "🔥"], ["Pro", "Competitive / 5+ years", "🏆"]].map(([l, d, e]) => (
            <button key={l} onClick={() => setData({ ...data, level: l })}
              style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${data.level === l ? t.accent : t.border}`, background: data.level === l ? t.accentBg : t.card, color: t.text, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{e} {l}</span>
              <span style={{ fontSize: 11, color: t.faint }}>{d}</span>
            </button>
          ))}
        </div>
      )
    },
  ];

  const canNext = step === 0 ? data.name.trim().length > 0 : true;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 99, background: i <= step ? t.accent : t.border, transition: "all 0.3s" }} />
          ))}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 6, fontFamily: '"DM Serif Display", serif' }}>{steps[step].title}</h1>
        <p style={{ fontSize: 14, color: t.faint, marginBottom: 28 }}>{steps[step].sub}</p>

        {steps[step].content}

        <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onDone(data)}
          disabled={!canNext}
          style={{ marginTop: 28, width: "100%", padding: "16px", borderRadius: 14, background: canNext ? `linear-gradient(135deg,${t.accent},${t.accentLight})` : t.border, color: canNext ? "#fff" : t.subtle, fontWeight: 700, fontSize: 15, border: "none", cursor: canNext ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          {step < steps.length - 1 ? "Continue →" : "Start My Journey 🚀"}
        </button>
        {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 14, background: "transparent", color: t.faint, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>← Back</button>}
      </div>
    </div>
  );
}

function Home({ user, stats, workoutHistory, activeProgram, setActiveProgram, navigate, addXP, programs }) {
  const { t, isDark, toggleTheme } = useContext(ThemeContext);
  const todayStr = new Date().toDateString();
  const workedOutToday = workoutHistory.some(w => new Date(w.date).toDateString() === todayStr);
  const lvl = getLevelInfo(stats.xp);

  const quote = [
    "Every rep counts. Every day matters.",
    "The only bad workout is the one that didn't happen.",
    "Your future self is watching. Make them proud.",
    "Champions are made when nobody's watching.",
    "Pain is temporary. Pride is forever.",
  ][new Date().getDay() % 5];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 13, color: t.faint, marginBottom: 2 }}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, fontFamily: '"DM Serif Display", serif' }}>{user.name} 👋</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button onClick={toggleTheme} style={{ background: t.border, border: "none", borderRadius: 99, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>
            {isDark ? "☀️" : "🌙"}
          </button>
          <div style={{ background: t.border, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{lvl.icon}</div>
            <div style={{ fontSize: 10, color: t.faint, fontWeight: 600 }}>{lvl.rank}</div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ background: t.card, borderRadius: 16, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <XPBar xp={stats.xp} />
        <p style={{ fontSize: 11, color: t.subtle, marginTop: 8, fontStyle: "italic" }}>"{quote}"</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { v: stats.streak, label: "Day Streak", icon: "🔥", color: "#f97316" },
          { v: stats.totalWorkouts, label: "Workouts", icon: "💪", color: t.accent },
          { v: stats.totalVolume ? `${(stats.totalVolume / 1000).toFixed(1)}k` : "0", label: "Total kg", icon: "⚡", color: "#facc15" },
        ].map(s => (
          <div key={s.label} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "14px 10px", textAlign: "center", boxShadow: t.shadow }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 10, color: t.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's workout */}
      {activeProgram ? (
        <div style={{ background: t.accentBg, borderRadius: 18, padding: 22, border: `1px solid ${t.accentBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: t.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Active Program</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{activeProgram.emoji} {activeProgram.title}</h3>
            </div>
            {workedOutToday && <span style={{ background: t.success, color: t.successText, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>✓ Done Today</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("workout")} style={{ flex: 1, padding: "12px", borderRadius: 12, background: t.accent, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              {workedOutToday ? "Log Another Set 💪" : "Start Today's Workout 🚀"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: t.card, borderRadius: 18, padding: 22, border: `1px dashed ${t.inputBorder}`, textAlign: "center", boxShadow: t.shadow }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>No active program</h3>
          <p style={{ fontSize: 13, color: t.faint, marginBottom: 14 }}>Pick a program to get started on your fitness journey.</p>
          <button onClick={() => navigate("programs")} style={{ padding: "10px 24px", borderRadius: 12, background: t.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Browse Programs</button>
        </div>
      )}

      {/* Recent activity */}
      {workoutHistory.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {workoutHistory.slice(-3).reverse().map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: t.faint }}>{new Date(w.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>+{w.xpEarned} XP</div>
                  <div style={{ fontSize: 11, color: t.faint }}>{w.duration}min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateProgramScreen({ onSave, onCancel, editProgram }) {
  const { t } = useContext(ThemeContext);
  const [step, setStep] = useState(0);

  // Step 1: program info
  const [title, setTitle] = useState(editProgram?.title || "");
  const [emoji, setEmoji] = useState(editProgram?.emoji || "⭐");
  const [level, setLevel] = useState(editProgram?.level || "Beginner");
  const [weeks, setWeeks] = useState(editProgram?.weeks || 4);
  const [desc, setDesc] = useState(editProgram?.desc || "");

  // Step 2+3: workout days with exercises
  const [workouts, setWorkouts] = useState(editProgram?.workouts || [
    { day: "Day 1", name: "Workout 1", exercises: [] }
  ]);

  const EMOJIS = ["⭐", "💪", "🔥", "⚡", "🏆", "🌱", "🎯", "🦁"];
  const LEVELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Pro"];
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const addWorkout = () => {
    if (workouts.length >= 7) return;
    setWorkouts(w => [...w, { day: `Day ${w.length + 1}`, name: `Workout ${w.length + 1}`, exercises: [] }]);
  };

  const removeWorkout = (idx) => setWorkouts(w => w.filter((_, i) => i !== idx));

  const updateWorkout = (idx, field, val) => setWorkouts(w => w.map((wo, i) => i === idx ? { ...wo, [field]: val } : wo));

  const addExercise = (wIdx) => {
    setWorkouts(w => w.map((wo, i) => i === wIdx
      ? { ...wo, exercises: [...wo.exercises, { name: "", sets: 3, reps: "10", rest: 60, muscle: "" }] }
      : wo
    ));
  };

  const removeExercise = (wIdx, eIdx) => {
    setWorkouts(w => w.map((wo, i) => i === wIdx
      ? { ...wo, exercises: wo.exercises.filter((_, ei) => ei !== eIdx) }
      : wo
    ));
  };

  const updateExercise = (wIdx, eIdx, field, val) => {
    setWorkouts(w => w.map((wo, i) => i === wIdx
      ? { ...wo, exercises: wo.exercises.map((ex, ei) => ei === eIdx ? { ...ex, [field]: val } : ex) }
      : wo
    ));
  };

  const handleSave = () => {
    const safeWorkouts = workouts.map(wo => ({
      ...wo,
      name: sanitize(wo.name, 80),
      exercises: wo.exercises.map(ex => ({
        ...ex,
        name: sanitize(ex.name, 80),
        reps: sanitize(ex.reps, 20),
        muscle: sanitize(ex.muscle, 40),
        sets: Math.max(1, Math.min(20, Number(ex.sets) || 1)),
        rest: Math.max(0, Math.min(600, Number(ex.rest) || 0)),
      })),
    }));
    const program = {
      id: editProgram?.id || ("custom_" + Date.now()),
      level, tag: "Custom", gender: "All",
      weeks: Math.max(1, Math.min(52, Number(weeks) || 4)),
      days: safeWorkouts.length,
      title: sanitize(title, 60),
      subtitle: "Custom program",
      emoji, color: "#22C55E", dark: "#15803D",
      desc: sanitize(desc, 300), custom: true, workouts: safeWorkouts,
    };
    onSave(program);
  };

  const canProceed = [
    title.trim().length > 0,           // step 0
    workouts.length > 0,               // step 1
    workouts.every(w => w.exercises.length > 0 && w.exercises.every(e => e.name.trim())), // step 2
    true,                              // step 3 review
  ][step];

  const inputStyle = { padding: "12px 14px", background: t.card, border: `1px solid ${t.inputBorder}`, borderRadius: 12, color: t.text, fontSize: 14, width: "100%", boxSizing: "border-box" };
  const labelStyle = { fontSize: 11, color: t.faint, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 };

  const steps = ["Program Info", "Workout Days", "Exercises", "Review"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: '"DM Serif Display", serif' }}>
          {editProgram ? "Edit Program" : "Create Program"}
        </h1>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: t.faint, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 6 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 3, borderRadius: 99, background: i <= step ? t.accent : t.border, marginBottom: 4 }} />
            <span style={{ fontSize: 9, color: i <= step ? t.accent : t.subtle, fontWeight: 700, textTransform: "uppercase" }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Program Info */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Program Name *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. My Push/Pull Split" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pick an Emoji</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setEmoji(em)} style={{ fontSize: 24, background: emoji === em ? t.accentBg : t.card, border: `2px solid ${emoji === em ? t.accent : t.border}`, borderRadius: 12, padding: "8px 12px", cursor: "pointer" }}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Level</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)} style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: level === l ? t.accent : t.border, color: level === l ? "#fff" : t.faint }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Duration (weeks)</label>
            <input type="number" value={weeks} onChange={e => setWeeks(e.target.value)} min="1" max="52" style={{ ...inputStyle, width: 100 }} />
          </div>
          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this program about?" rows={3}
              style={{ ...inputStyle, resize: "none", height: 80 }} />
          </div>
        </div>
      )}

      {/* Step 1: Workout Days */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: t.muted }}>Add your workout days (up to 7). You'll add exercises in the next step.</p>
          {workouts.map((wo, idx) => (
            <div key={idx} style={{ background: t.card, borderRadius: 14, padding: 16, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>Day {idx + 1}</span>
                {workouts.length > 1 && (
                  <button onClick={() => removeWorkout(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✕</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: "0 0 80px" }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Day</label>
                  <select value={wo.day} onChange={e => updateWorkout(idx, "day", e.target.value)}
                    style={{ ...inputStyle, padding: "10px 8px" }}>
                    {DAY_LABELS.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="Rest">Rest</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Workout Name</label>
                  <input value={wo.name} onChange={e => updateWorkout(idx, "name", e.target.value)} placeholder="e.g. Upper Body Push"
                    style={{ ...inputStyle, padding: "10px 14px" }} />
                </div>
              </div>
            </div>
          ))}
          {workouts.length < 7 && (
            <button onClick={addWorkout} style={{ padding: "12px", borderRadius: 12, background: "transparent", color: t.accent, fontWeight: 700, fontSize: 14, border: `2px dashed ${t.accentBorder}`, cursor: "pointer" }}>
              + Add Day
            </button>
          )}
        </div>
      )}

      {/* Step 2: Exercises */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {workouts.map((wo, wIdx) => (
            <div key={wIdx} style={{ background: t.card, borderRadius: 14, padding: 16, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 12 }}>{wo.day} — {wo.name}</p>
              {wo.exercises.map((ex, eIdx) => (
                <div key={eIdx} style={{ background: t.cardAlt, borderRadius: 10, padding: 12, marginBottom: 8, border: `1px solid ${t.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>Exercise {eIdx + 1}</span>
                    <button onClick={() => removeExercise(wIdx, eIdx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                  <input value={ex.name} onChange={e => updateExercise(wIdx, eIdx, "name", e.target.value)}
                    placeholder="Exercise name *" style={{ ...inputStyle, marginBottom: 8 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 9 }}>Sets</label>
                      <input type="number" value={ex.sets} onChange={e => updateExercise(wIdx, eIdx, "sets", Number(e.target.value))}
                        min="1" style={{ ...inputStyle, padding: "8px", textAlign: "center" }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 9 }}>Reps</label>
                      <input value={ex.reps} onChange={e => updateExercise(wIdx, eIdx, "reps", e.target.value)}
                        placeholder="10" style={{ ...inputStyle, padding: "8px", textAlign: "center" }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 9 }}>Rest(s)</label>
                      <input type="number" value={ex.rest} onChange={e => updateExercise(wIdx, eIdx, "rest", Number(e.target.value))}
                        min="0" style={{ ...inputStyle, padding: "8px", textAlign: "center" }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: 9 }}>Muscle</label>
                      <input value={ex.muscle} onChange={e => updateExercise(wIdx, eIdx, "muscle", e.target.value)}
                        placeholder="e.g. Chest" style={{ ...inputStyle, padding: "8px" }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addExercise(wIdx)} style={{ width: "100%", padding: "10px", borderRadius: 10, background: "transparent", color: t.accent, fontWeight: 600, fontSize: 13, border: `1px dashed ${t.accentBorder}`, cursor: "pointer", marginTop: 4 }}>
                + Add Exercise
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: t.accentBg, borderRadius: 16, padding: 20, border: `1px solid ${t.accentBorder}`, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{emoji}</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>{title}</h2>
            <p style={{ fontSize: 13, color: t.muted }}>{level} · {weeks} weeks · {workouts.length} days/week</p>
            {desc && <p style={{ fontSize: 12, color: t.faint, marginTop: 8 }}>{desc}</p>}
          </div>
          {workouts.map((wo, i) => (
            <div key={i} style={{ background: t.card, borderRadius: 12, padding: 14, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8 }}>{wo.day} — {wo.name}</p>
              {wo.exercises.map((ex, j) => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: j < wo.exercises.length - 1 ? `1px solid ${t.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: t.text }}>{ex.name}</span>
                  <span style={{ fontSize: 12, color: t.faint }}>{ex.sets}×{ex.reps}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "14px", borderRadius: 14, background: t.border, color: t.muted, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canProceed}
            style={{ flex: 2, padding: "14px", borderRadius: 14, background: canProceed ? t.accent : t.border, color: canProceed ? "#fff" : t.subtle, fontWeight: 700, fontSize: 14, border: "none", cursor: canProceed ? "pointer" : "not-allowed" }}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSave} style={{ flex: 2, padding: "14px", borderRadius: 14, background: `linear-gradient(135deg,${t.accent},${t.accentLight})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
            {editProgram ? "Save Changes ✓" : "Create Program 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}

function Programs({ user, activeProgram, setActiveProgram, navigate, customPrograms, setCustomPrograms }) {
  const { t } = useContext(ThemeContext);
  const [filter, setFilter] = useState("All");
  const [gFilter, setGFilter] = useState("All");
  const [creatingProgram, setCreatingProgram] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // program to delete

  const levels = ["All", "Beginner", "Novice", "Intermediate", "Advanced", "Pro"];
  const genders = ["All", "Men", "Women"];

  const filtered = useMemo(() => {
    const all = [...PROGRAMS, ...customPrograms];
    return all.filter(p =>
      (filter === "All" || p.level === filter) &&
      (gFilter === "All" || p.gender === "All" || p.gender === gFilter)
    );
  }, [filter, gFilter, customPrograms]);

  if (creatingProgram || editingProgram) {
    return (
      <CreateProgramScreen
        onSave={(prog) => {
          if (editingProgram) {
            setCustomPrograms(prev => prev.map(p => p.id === prog.id ? prog : p));
          } else {
            setCustomPrograms(prev => [...prev, prog]);
          }
          setCreatingProgram(false);
          setEditingProgram(null);
        }}
        onCancel={() => { setCreatingProgram(false); setEditingProgram(null); }}
        editProgram={editingProgram}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Inline delete confirmation dialog */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: t.card, borderRadius: 18, padding: 24, width: "100%", maxWidth: 340, border: `1px solid ${t.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, textAlign: "center", marginBottom: 8 }}>Delete Program?</h3>
            <p style={{ fontSize: 13, color: t.faint, textAlign: "center", marginBottom: 20 }}>"{confirmDelete.title}" will be permanently removed.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: t.border, color: t.muted, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setCustomPrograms(prev => prev.filter(cp => cp.id !== confirmDelete.id)); setConfirmDelete(null); }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: '"DM Serif Display", serif' }}>Programs 📋</h1>
          <p style={{ fontSize: 13, color: t.faint }}>Find the perfect plan for your goals</p>
        </div>
        <button onClick={() => setCreatingProgram(true)} style={{ background: t.accent, border: "none", borderRadius: 99, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          + Create
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {levels.map(l => <Pill key={l} active={filter === l} onClick={() => setFilter(l)}>{l}</Pill>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {genders.map(g => <Pill key={g} active={gFilter === g} color="#ec4899" onClick={() => setGFilter(g)}>{g}</Pill>)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: t.card, borderRadius: 18, padding: 22, border: `1px solid ${t.border}`, position: "relative", overflow: "hidden", boxShadow: t.shadow }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: p.color }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span style={{ background: p.dark + "66", color: p.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, textTransform: "uppercase", letterSpacing: 0.5 }}>{p.level}</span>
                  <span style={{ background: t.border, color: t.faint, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>{p.tag}</span>
                  {p.custom && <span style={{ background: t.accentBg, color: t.accent, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>Custom</span>}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: t.text }}>{p.emoji} {p.title}</h3>
                <p style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{p.subtitle}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 12, color: t.faint }}>{p.weeks}wk</div>
                <div style={{ fontSize: 12, color: t.faint }}>{p.days}d/wk</div>
                {p.custom && (
                  <div style={{ display: "flex", gap: 6, marginLeft: 8, marginTop: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingProgram(p); }}
                      style={{ background: t.border, border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(p); }}
                      style={{ background: t.border, border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 13 }}>🗑️</button>
                  </div>
                )}
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.faint, marginBottom: 14, lineHeight: 1.6 }}>{p.desc}</p>
            <button
              onClick={() => { setActiveProgram(p); navigate("home"); }}
              style={{ width: "100%", padding: "11px", borderRadius: 12, background: activeProgram?.id === p.id ? t.success : t.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
              {activeProgram?.id === p.id ? "✓ Active Program" : "Start Program"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutLogger({ activeProgram, onComplete, navigate }) {
  const { t } = useContext(ThemeContext);
  const workout = activeProgram?.workouts?.[0] || null;
  const [sets, setSets] = useState({});
  const [completed, setCompleted] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [currentExIdx, setCurrentExIdx] = useState(0);

  useEffect(() => {
    const tv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(tv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeProgram) return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
      <h3 style={{ fontSize: 18, color: t.text, marginBottom: 8 }}>No Active Program</h3>
      <p style={{ color: t.faint, marginBottom: 20 }}>Choose a program first to start logging workouts.</p>
      <button onClick={() => navigate("programs")} style={{ padding: "12px 24px", borderRadius: 12, background: t.accent, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Browse Programs</button>
    </div>
  );

  const exercises = workout?.exercises || [];
  const ex = exercises[currentExIdx];

  const updateSet = (exName, setIdx, field, val) => {
    setSets(prev => ({ ...prev, [exName]: { ...prev[exName], [setIdx]: { ...prev[exName]?.[setIdx], [field]: val } } }));
  };

  const toggleComplete = (exName, setIdx) => {
    setCompleted(prev => ({ ...prev, [`${exName}-${setIdx}`]: !prev[`${exName}-${setIdx}`] }));
  };

  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = Object.values(completed).filter(Boolean).length;
  const progPct = Math.round((doneSets / totalSets) * 100);

  if (done) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 16, animation: "bounce 0.6s ease" }}>🎉</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 8 }}>Workout Complete!</h2>
      <p style={{ color: t.muted, marginBottom: 24 }}>You crushed it! Duration: {formatTime(elapsed)}</p>
      <div style={{ background: t.accentBg, borderRadius: 18, padding: 20, marginBottom: 24, border: `1px solid ${t.accentBorder}` }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: t.accentLight, marginBottom: 4 }}>+250 XP</div>
        <div style={{ fontSize: 13, color: t.faint }}>earned this session</div>
      </div>
      <button onClick={() => navigate("home")} style={{ width: "100%", padding: "14px", borderRadius: 14, background: t.accent, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>Back to Home 🏠</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{workout?.name}</h2>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.accent }}>{formatTime(elapsed)}</span>
        </div>
        <div style={{ background: t.border, borderRadius: 99, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${progPct}%`, height: "100%", background: `linear-gradient(90deg,${t.accent},${t.accentLight})`, transition: "width 0.5s ease", borderRadius: 99 }} />
        </div>
        <div style={{ fontSize: 11, color: t.faint, marginTop: 4 }}>{doneSets}/{totalSets} sets completed</div>
      </div>

      {/* Exercise tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {exercises.map((e, i) => (
          <button key={i} onClick={() => setCurrentExIdx(i)}
            style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0,
              background: i === currentExIdx ? t.accent : t.border, color: i === currentExIdx ? "#fff" : t.faint }}>
            {e.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Exercise card */}
      {ex && (
        <div style={{ background: t.card, borderRadius: 18, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ background: t.border, color: t.muted, fontSize: 10, padding: "3px 8px", borderRadius: 99, fontWeight: 600 }}>{ex.muscle}</span>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: t.text, marginTop: 6 }}>{ex.name}</h3>
              <p style={{ fontSize: 12, color: t.faint }}>Target: {ex.sets} sets × {ex.reps} reps</p>
            </div>
            <button onClick={() => setShowTimer(tv => !tv)} style={{ padding: "8px 12px", borderRadius: 10, background: t.border, color: t.faint, border: "none", cursor: "pointer", fontSize: 18 }}>⏱</button>
          </div>

          {showTimer && (
            <div style={{ background: t.cardAlt, borderRadius: 14, padding: 16, marginBottom: 16, border: `1px solid ${t.inputBorder}` }}>
              <p style={{ fontSize: 11, color: t.faint, marginBottom: 10, textAlign: "center" }}>REST TIMER</p>
              <Timer onDone={() => setShowTimer(false)} />
            </div>
          )}

          {/* Set logger */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 32px", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: t.subtle, textAlign: "center" }}>SET</span>
              <span style={{ fontSize: 10, color: t.subtle, textAlign: "center" }}>KG</span>
              <span style={{ fontSize: 10, color: t.subtle, textAlign: "center" }}>REPS</span>
              <span style={{ fontSize: 10, color: t.subtle, textAlign: "center" }}>✓</span>
            </div>
            {Array.from({ length: ex.sets }).map((_, si) => {
              const key = `${ex.name}-${si}`;
              const isDone = completed[key];
              return (
                <div key={si} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 32px", gap: 8, alignItems: "center", opacity: isDone ? 0.6 : 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.subtle, textAlign: "center" }}>{si + 1}</span>
                  <input type="number" placeholder="0" value={sets[ex.name]?.[si]?.weight || ""}
                    onChange={e => updateSet(ex.name, si, "weight", e.target.value)}
                    style={{ padding: "10px 8px", background: isDone ? t.cardAlt : t.border, border: `1px solid ${isDone ? t.success : t.inputBorder}`, borderRadius: 10, color: t.text, fontSize: 15, fontWeight: 700, textAlign: "center" }} />
                  <input type="number" placeholder={ex.reps} value={sets[ex.name]?.[si]?.reps || ""}
                    onChange={e => updateSet(ex.name, si, "reps", e.target.value)}
                    style={{ padding: "10px 8px", background: isDone ? t.cardAlt : t.border, border: `1px solid ${isDone ? t.success : t.inputBorder}`, borderRadius: 10, color: t.text, fontSize: 15, fontWeight: 700, textAlign: "center" }} />
                  <button onClick={() => { toggleComplete(ex.name, si); if (!isDone) setShowTimer(true); }}
                    style={{ width: 32, height: 32, borderRadius: 8, background: isDone ? t.success : t.border, border: `1px solid ${isDone ? t.successText : t.inputBorder}`, cursor: "pointer", fontSize: 16 }}>
                    {isDone ? "✓" : ""}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label style={{ fontSize: 11, color: t.faint, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Workout Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How did it feel? Any PRs?"
          style={{ width: "100%", padding: "12px 14px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, color: t.text, fontSize: 13, resize: "none", height: 80, boxSizing: "border-box" }} />
      </div>

      {/* Finish */}
      <button onClick={() => { onComplete({ name: workout?.name, date: new Date(), duration: Math.ceil(elapsed / 60), xpEarned: 250 + doneSets * 10, sets: doneSets, notes }); setDone(true); }}
        style={{ padding: "16px", borderRadius: 14, background: `linear-gradient(135deg,${t.accent},${t.accentLight})`, color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer" }}>
        Finish Workout 🎉
      </button>
    </div>
  );
}

function Progress({ workoutHistory, stats }) {
  const { t } = useContext(ThemeContext);
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    return { label: ["S","M","T","W","T","F","S"][d.getDay()], active: workoutHistory.some(w => new Date(w.date).toDateString() === ds) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: '"DM Serif Display", serif' }}>Progress 📈</h1>

      {/* Week view */}
      <div style={{ background: t.card, borderRadius: 18, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>This Week</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: d.active ? t.accent : t.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: d.active ? 16 : 12, color: d.active ? "#fff" : t.inputBorder }}>
                {d.active ? "✓" : ""}
              </div>
              <span style={{ fontSize: 10, color: t.subtle, fontWeight: 700 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All-time stats */}
      <div style={{ background: t.card, borderRadius: 18, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>All-Time Stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Total Workouts", val: stats.totalWorkouts, icon: "💪", color: t.accent },
            { label: "Best Streak", val: `${stats.bestStreak}d`, icon: "🔥", color: "#f97316" },
            { label: "Total XP", val: stats.xp.toLocaleString(), icon: "⭐", color: "#facc15" },
            { label: "Total Volume", val: `${(stats.totalVolume / 1000).toFixed(1)}k kg`, icon: "⚡", color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{ background: t.cardAlt, borderRadius: 14, padding: 14, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: t.subtle, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout log */}
      {workoutHistory.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: t.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Workout Log</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...workoutHistory].reverse().map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: t.faint }}>{new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>+{w.xpEarned} XP</div>
                  <div style={{ fontSize: 11, color: t.faint }}>{w.duration}min • {w.sets} sets</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Achievements({ stats, workoutHistory }) {
  const { t } = useContext(ThemeContext);
  const earned = [
    workoutHistory.length >= 1 && "first_workout",
    stats.streak >= 3 && "streak_3",
    stats.streak >= 7 && "streak_7",
    stats.streak >= 30 && "streak_30",
    stats.totalWorkouts >= 10 && "workouts_10",
    stats.totalWorkouts >= 50 && "workouts_50",
    stats.totalWorkouts >= 100 && "workouts_100",
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: '"DM Serif Display", serif' }}>Achievements 🏆</h1>
        <p style={{ fontSize: 13, color: t.faint }}>{earned.length}/{ACHIEVEMENTS.length} unlocked</p>
      </div>

      <div style={{ background: t.card, borderRadius: 16, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <XPBar xp={stats.xp} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACHIEVEMENTS.map(a => {
          const isEarned = earned.includes(a.id);
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isEarned ? t.card : t.cardAlt, borderRadius: 14, border: `1px solid ${isEarned ? t.accentBorder : t.border}`, opacity: isEarned ? 1 : 0.5, boxShadow: isEarned ? t.shadow : "none" }}>
              <div style={{ fontSize: 28, filter: isEarned ? "none" : "grayscale(1)" }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isEarned ? t.text : t.faint }}>{a.name}</div>
                <div style={{ fontSize: 12, color: t.subtle }}>{a.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isEarned ? t.accent : t.inputBorder }}>+{a.xp} XP</div>
                {isEarned && <div style={{ fontSize: 10, color: t.successText }}>✓ Earned</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileScreen({ user, stats, onReset, onSignOut }) {
  const { t, isDark, toggleTheme } = useContext(ThemeContext);
  const lvl = getLevelInfo(stats.xp);
  const providerLabel = user.authProvider === "google" ? "Google" : user.authProvider === "facebook" ? "Facebook" : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: '"DM Serif Display", serif' }}>Profile</h1>

      <div style={{ background: t.accentBg, borderRadius: 20, padding: 24, border: `1px solid ${t.accentBorder}`, textAlign: "center", boxShadow: t.shadow }}>
        {user.photoURL
          ? <img src={user.photoURL} alt="avatar" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block", border: `2px solid ${t.accent}` }} />
          : <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent},${t.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{user.name}</h2>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 8 }}>{user.goal} · {user.level}</p>
        {providerLabel && (
          <p style={{ fontSize: 11, color: t.subtle, marginBottom: 8 }}>
            Signed in with {providerLabel}
          </p>
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: t.accentBorder, borderRadius: 99, padding: "6px 14px" }}>
          <span style={{ fontSize: 16 }}>{lvl.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.accentLight }}>{lvl.rank}</span>
        </div>
      </div>

      <div style={{ background: t.card, borderRadius: 16, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <XPBar xp={stats.xp} />
      </div>

      <div style={{ background: t.card, borderRadius: 16, padding: 22, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Settings</p>
        {[
          { label: "Gender", val: user.gender || "Not set" },
          { label: "Goal", val: user.goal },
          { label: "Level", val: user.level },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 14, color: t.muted }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{s.val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card, borderRadius: 16, padding: 16, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <span style={{ fontSize: 14, color: t.muted }}>Appearance</span>
        <button onClick={toggleTheme} style={{ background: t.border, border: "none", borderRadius: 99, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: t.text }}>
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <button onClick={onSignOut} style={{ padding: "14px", borderRadius: 14, background: t.border, color: t.muted, fontWeight: 700, fontSize: 14, border: `1px solid ${t.inputBorder}`, cursor: "pointer" }}>
        Sign Out
      </button>

      <button onClick={onReset} style={{ padding: "14px", borderRadius: 14, background: t.border, color: "#ef4444", fontWeight: 700, fontSize: 14, border: `1px solid ${t.inputBorder}`, cursor: "pointer" }}>
        Reset App Data
      </button>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState(() => (localStorage.getItem("fq_theme") || "dark") === "dark");
  const t = isDark ? DARK : LIGHT;
  const toggleTheme = () => setIsDark(d => { const next = !d; localStorage.setItem("fq_theme", next ? "dark" : "light"); return next; });

  const [user, setUser] = useLocalStorage("fq_user", null);
  const [stats, setStats] = useLocalStorage("fq_stats", { xp: 0, streak: 0, bestStreak: 0, totalWorkouts: 0, totalVolume: 0 });
  const [workoutHistory, setWorkoutHistory] = useLocalStorage("fq_history", []);
  const [activeProgram, setActiveProgram] = useLocalStorage("fq_program", null);
  const [customPrograms, setCustomPrograms] = useLocalStorage("fq_custom_programs", []);
  const [tab, setTab] = useState("home");
  const [notification, setNotification] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showNotif = (msg, icon = "🎉") => {
    setNotification({ msg, icon });
    setTimeout(() => setNotification(null), 3000);
  };

  const addXP = (amount) => {
    setStats(s => ({ ...s, xp: s.xp + amount }));
  };

  const completeWorkout = (data) => {
    const newHistory = [...workoutHistory, { ...data, date: new Date().toISOString() }];
    setWorkoutHistory(newHistory);

    const lastDate = workoutHistory.length > 0 ? new Date(workoutHistory[workoutHistory.length - 1].date) : null;
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const isConsecutive = lastDate && (lastDate.toDateString() === yesterday.toDateString() || lastDate.toDateString() === today.toDateString());
    const newStreak = isConsecutive ? stats.streak + 1 : 1;

    setStats(s => ({
      ...s,
      xp: s.xp + data.xpEarned,
      streak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
      totalWorkouts: s.totalWorkouts + 1,
      totalVolume: s.totalVolume + data.sets * 50, // rough estimate
    }));

    showNotif(`+${data.xpEarned} XP earned!`);
  };

  if (!user) return (
    <ThemeContext.Provider value={{ t, isDark, toggleTheme }}>
      <Onboarding onDone={(data) => setUser(data)} />
    </ThemeContext.Provider>
  );

  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "programs", icon: "📋", label: "Programs" },
    { id: "workout", icon: "💪", label: "Workout" },
    { id: "progress", icon: "📈", label: "Progress" },
    { id: "achievements", icon: "🏆", label: "Awards" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <ErrorBoundary>
    <ThemeContext.Provider value={{ t, isDark, toggleTheme }}>
      <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif", color: t.text }}>

        {/* Reset confirmation dialog */}
        {showResetConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: t.card, borderRadius: 18, padding: 24, width: "100%", maxWidth: 340, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, textAlign: "center", marginBottom: 8 }}>Reset All Data?</h3>
              <p style={{ fontSize: 13, color: t.faint, textAlign: "center", marginBottom: 20 }}>This will permanently delete all your workouts, stats, and programs. This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: t.border, color: t.muted, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Reset</button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: t.accentBg, border: `1px solid ${t.accentBorder}`, borderRadius: 99, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 20px 60px ${t.accent}33`, animation: "slideDown 0.3s ease" }}>
            <span style={{ fontSize: 20 }}>{notification.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{notification.msg}</span>
          </div>
        )}

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          input:focus, textarea:focus { outline: 1px solid #22C55E; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: ${t.card}; }
          ::-webkit-scrollbar-thumb { background: #22C55E44; border-radius: 99px; }
          @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
          @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        `}</style>

        {/* Main content */}
        <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 90 }}>
          <div style={{ padding: "20px 16px 0" }}>
            {tab === "home" && <Home user={user} stats={stats} workoutHistory={workoutHistory} activeProgram={activeProgram} setActiveProgram={setActiveProgram} navigate={setTab} addXP={addXP} programs={PROGRAMS} />}
            {tab === "programs" && <Programs user={user} activeProgram={activeProgram} setActiveProgram={setActiveProgram} navigate={setTab} customPrograms={customPrograms} setCustomPrograms={setCustomPrograms} />}
            {tab === "workout" && <WorkoutLogger activeProgram={activeProgram} onComplete={completeWorkout} navigate={setTab} />}
            {tab === "progress" && <Progress workoutHistory={workoutHistory} stats={stats} />}
            {tab === "achievements" && <Achievements stats={stats} workoutHistory={workoutHistory} />}
            {tab === "profile" && <ProfileScreen user={user} stats={stats}
              onReset={() => { setShowResetConfirm(true); }}
              onSignOut={() => { signOutUser().catch(() => {}); localStorage.clear(); window.location.reload(); }}
            />}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: t.navBg, borderTop: `1px solid ${t.navBorder}`, paddingBottom: "env(safe-area-inset-bottom)", zIndex: 100 }}>
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{ flex: 1, padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", color: tab === tb.id ? t.accent : t.faint, transition: "color 0.2s" }}>
                <span style={{ fontSize: tb.id === "workout" ? 20 : 18 }}>{tb.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{tb.label}</span>
                {tab === tb.id && <div style={{ width: 20, height: 2, background: t.accent, borderRadius: 99, marginTop: 1 }} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
    </ErrorBoundary>
  );
}
