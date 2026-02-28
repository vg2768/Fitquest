import { useState, useEffect, useRef } from "react";

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
  const set = (v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
  return [val, set];
}

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function XPBar({ xp }) {
  const lvl = getLevelInfo(xp);
  // eslint-disable-next-line no-unused-vars
  const prog = getLevelProgress(xp);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
        <span>{lvl.icon} {lvl.rank}</span>
        <span>{xp.toLocaleString()} XP</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${prog}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#a78bfa)", borderRadius: 99, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function Badge({ emoji, label, sub, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#0f172a", borderRadius: 12, border: `1px solid ${color}22` }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#64748b" }}>{sub}</div>}
      </div>
    </div>
  );
}

function Pill({ children, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
      background: active ? (color || "#6366f1") : "#1e293b",
      color: active ? "#fff" : "#64748b",
      transition: "all 0.2s",
      flexShrink: 0,
    }}>{children}</button>
  );
}

function Timer({ onDone }) {
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
        <circle cx={50} cy={50} r={45} fill="none" stroke="#1e293b" strokeWidth={8} />
        <circle cx={50} cy={50} r={45} fill="none" stroke="#6366f1" strokeWidth={8}
          strokeDasharray="283" strokeDashoffset={283 - pct}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s linear" }} />
        <text x={50} y={55} textAnchor="middle" fontSize={18} fill="#f1f5f9" fontWeight="bold">{formatTime(secs)}</text>
      </svg>
      <div style={{ display: "flex", gap: 8 }}>
        {[60, 90, 120, 180].map(t => (
          <button key={t} onClick={() => { setSecs(t); setInitial(t); setRunning(false); }}
            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, border: "1px solid #334155", background: initial === t ? "#6366f1" : "transparent", color: initial === t ? "#fff" : "#64748b", cursor: "pointer" }}>
            {t}s
          </button>
        ))}
      </div>
      <button onClick={() => setRunning(r => !r)} style={{
        padding: "8px 24px", borderRadius: 99, background: running ? "#ef4444" : "#6366f1",
        color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer"
      }}>{running ? "⏸ Pause" : "▶ Start"}</button>
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", gender: "All", goal: "Build Muscle", level: "Beginner" });

  const steps = [
    {
      title: "Welcome to FitQuest 🏋️",
      sub: "Your gamified fitness journey starts here.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Your name</label>
          <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
            placeholder="Enter your name..."
            style={{ padding: "14px 16px", background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9", fontSize: 15 }} />
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
              style={{ padding: "16px", borderRadius: 12, border: `2px solid ${data.gender === (g === "Prefer not to say" ? "All" : g) ? "#6366f1" : "#1e293b"}`, background: data.gender === (g === "Prefer not to say" ? "All" : g) ? "#1e1b4b" : "#0f172a", color: "#f1f5f9", fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
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
              style={{ padding: "16px", borderRadius: 12, border: `2px solid ${data.goal === g ? "#6366f1" : "#1e293b"}`, background: data.goal === g ? "#1e1b4b" : "#0f172a", color: "#f1f5f9", fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
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
              style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${data.level === l ? "#6366f1" : "#1e293b"}`, background: data.level === l ? "#1e1b4b" : "#0f172a", color: "#f1f5f9", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{e} {l}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{d}</span>
            </button>
          ))}
        </div>
      )
    },
  ];

  const canNext = step === 0 ? data.name.trim().length > 0 : true;

  return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 99, background: i <= step ? "#6366f1" : "#1e293b", transition: "all 0.3s" }} />
          ))}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>{steps[step].title}</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>{steps[step].sub}</p>

        {steps[step].content}

        <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onDone(data)}
          disabled={!canNext}
          style={{ marginTop: 28, width: "100%", padding: "16px", borderRadius: 14, background: canNext ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e293b", color: canNext ? "#fff" : "#475569", fontWeight: 700, fontSize: 15, border: "none", cursor: canNext ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          {step < steps.length - 1 ? "Continue →" : "Start My Journey 🚀"}
        </button>
        {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 14, background: "transparent", color: "#64748b", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>← Back</button>}
      </div>
    </div>
  );
}

function Home({ user, stats, workoutHistory, activeProgram, setActiveProgram, navigate, addXP, programs }) {
  const todayStr = new Date().toDateString();
  const workedOutToday = workoutHistory.some(w => new Date(w.date).toDateString() === todayStr);
  const lvl = getLevelInfo(stats.xp);
  const prog = getLevelProgress(stats.xp);

  const quote = [
    "Every rep counts. Every day matters.",
    "The only bad workout is the one that didn't happen.",
    "Your future self is watching. Make them proud.",
    "Champions are made when nobody's watching.",
    "Pain is temporary. Pride is forever.",
  ][new Date().getDay() % 5];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>{user.name} 👋</h1>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 18 }}>{lvl.icon}</div>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{lvl.rank}</div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ background: "#0f172a", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
        <XPBar xp={stats.xp} />
        <p style={{ fontSize: 11, color: "#475569", marginTop: 8, fontStyle: "italic" }}>"{quote}"</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { v: stats.streak, label: "Day Streak", icon: "🔥", color: "#f97316" },
          { v: stats.totalWorkouts, label: "Workouts", icon: "💪", color: "#6366f1" },
          { v: stats.totalVolume ? `${(stats.totalVolume / 1000).toFixed(1)}k` : "0", label: "Total kg", icon: "⚡", color: "#facc15" },
        ].map(s => (
          <div key={s.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's workout */}
      {activeProgram ? (
        <div style={{ background: "linear-gradient(135deg,#1e1b4b,#0f172a)", borderRadius: 18, padding: 18, border: "1px solid #312e81" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Active Program</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{activeProgram.emoji} {activeProgram.title}</h3>
            </div>
            {workedOutToday && <span style={{ background: "#166534", color: "#4ade80", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>✓ Done Today</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("workout")} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              {workedOutToday ? "Log Another Set 💪" : "Start Today's Workout 🚀"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#0f172a", borderRadius: 18, padding: 18, border: "1px dashed #334155", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>No active program</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Pick a program to get started on your fitness journey.</p>
          <button onClick={() => navigate("programs")} style={{ padding: "10px 24px", borderRadius: 12, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Browse Programs</button>
        </div>
      )}

      {/* Recent activity */}
      {workoutHistory.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {workoutHistory.slice(-3).reverse().map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", borderRadius: 12, padding: "12px 14px", border: "1px solid #1e293b" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(w.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>+{w.xpEarned} XP</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{w.duration}min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Programs({ user, activeProgram, setActiveProgram, navigate }) {
  const [filter, setFilter] = useState("All");
  const [gFilter, setGFilter] = useState("All");

  const levels = ["All", "Beginner", "Novice", "Intermediate", "Advanced", "Pro"];
  const genders = ["All", "Men", "Women"];

  const filtered = PROGRAMS.filter(p =>
    (filter === "All" || p.level === filter) &&
    (gFilter === "All" || p.gender === "All" || p.gender === gFilter)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Programs 📋</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>Find the perfect plan for your goals</p>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {levels.map(l => <Pill key={l} active={filter === l} onClick={() => setFilter(l)}>{l}</Pill>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {genders.map(g => <Pill key={g} active={gFilter === g} color="#ec4899" onClick={() => setGFilter(g)}>{g}</Pill>)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#0f172a", borderRadius: 18, padding: 18, border: "1px solid #1e293b", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: p.color }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span style={{ background: p.dark + "66", color: p.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, textTransform: "uppercase", letterSpacing: 0.5 }}>{p.level}</span>
                  <span style={{ background: "#1e293b", color: "#64748b", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>{p.tag}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9" }}>{p.emoji} {p.title}</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{p.subtitle}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.weeks}wk</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.days}d/wk</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.6 }}>{p.desc}</p>
            <button
              onClick={() => { setActiveProgram(p); navigate("home"); }}
              style={{ width: "100%", padding: "11px", borderRadius: 12, background: activeProgram?.id === p.id ? "#166534" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
              {activeProgram?.id === p.id ? "✓ Active Program" : "Start Program"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutLogger({ activeProgram, onComplete, navigate }) {
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
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeProgram) return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
      <h3 style={{ fontSize: 18, color: "#f1f5f9", marginBottom: 8 }}>No Active Program</h3>
      <p style={{ color: "#64748b", marginBottom: 20 }}>Choose a program first to start logging workouts.</p>
      <button onClick={() => navigate("programs")} style={{ padding: "12px 24px", borderRadius: 12, background: "#6366f1", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Browse Programs</button>
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
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Workout Complete!</h2>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>You crushed it! Duration: {formatTime(elapsed)}</p>
      <div style={{ background: "#1e1b4b", borderRadius: 18, padding: 20, marginBottom: 24, border: "1px solid #312e81" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa", marginBottom: 4 }}>+250 XP</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>earned this session</div>
      </div>
      <button onClick={() => navigate("home")} style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>Back to Home 🏠</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{workout?.name}</h2>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>{formatTime(elapsed)}</span>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 99, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${progPct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#a78bfa)", transition: "width 0.5s ease", borderRadius: 99 }} />
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{doneSets}/{totalSets} sets completed</div>
      </div>

      {/* Exercise tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {exercises.map((e, i) => (
          <button key={i} onClick={() => setCurrentExIdx(i)}
            style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0,
              background: i === currentExIdx ? "#6366f1" : "#1e293b", color: i === currentExIdx ? "#fff" : "#64748b" }}>
            {e.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Exercise card */}
      {ex && (
        <div style={{ background: "#0f172a", borderRadius: 18, padding: 18, border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ background: "#1e293b", color: "#94a3b8", fontSize: 10, padding: "3px 8px", borderRadius: 99, fontWeight: 600 }}>{ex.muscle}</span>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", marginTop: 6 }}>{ex.name}</h3>
              <p style={{ fontSize: 12, color: "#64748b" }}>Target: {ex.sets} sets × {ex.reps} reps</p>
            </div>
            <button onClick={() => setShowTimer(t => !t)} style={{ padding: "8px 12px", borderRadius: 10, background: "#1e293b", color: "#64748b", border: "none", cursor: "pointer", fontSize: 18 }}>⏱</button>
          </div>

          {showTimer && (
            <div style={{ background: "#0a0f1e", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #334155" }}>
              <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10, textAlign: "center" }}>REST TIMER</p>
              <Timer onDone={() => setShowTimer(false)} />
            </div>
          )}

          {/* Set logger */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 32px", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>SET</span>
              <span style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>KG</span>
              <span style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>REPS</span>
              <span style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>✓</span>
            </div>
            {Array.from({ length: ex.sets }).map((_, si) => {
              const key = `${ex.name}-${si}`;
              const isDone = completed[key];
              return (
                <div key={si} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 32px", gap: 8, alignItems: "center", opacity: isDone ? 0.6 : 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", textAlign: "center" }}>{si + 1}</span>
                  <input type="number" placeholder="0" value={sets[ex.name]?.[si]?.weight || ""}
                    onChange={e => updateSet(ex.name, si, "weight", e.target.value)}
                    style={{ padding: "10px 8px", background: isDone ? "#0a0f1e" : "#1e293b", border: `1px solid ${isDone ? "#166534" : "#334155"}`, borderRadius: 10, color: "#f1f5f9", fontSize: 15, fontWeight: 700, textAlign: "center" }} />
                  <input type="number" placeholder={ex.reps} value={sets[ex.name]?.[si]?.reps || ""}
                    onChange={e => updateSet(ex.name, si, "reps", e.target.value)}
                    style={{ padding: "10px 8px", background: isDone ? "#0a0f1e" : "#1e293b", border: `1px solid ${isDone ? "#166534" : "#334155"}`, borderRadius: 10, color: "#f1f5f9", fontSize: 15, fontWeight: 700, textAlign: "center" }} />
                  <button onClick={() => { toggleComplete(ex.name, si); if (!isDone) setShowTimer(true); }}
                    style={{ width: 32, height: 32, borderRadius: 8, background: isDone ? "#166534" : "#1e293b", border: `1px solid ${isDone ? "#4ade80" : "#334155"}`, cursor: "pointer", fontSize: 16 }}>
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
        <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Workout Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How did it feel? Any PRs?"
          style={{ width: "100%", padding: "12px 14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, color: "#f1f5f9", fontSize: 13, resize: "none", height: 80, boxSizing: "border-box" }} />
      </div>

      {/* Finish */}
      <button onClick={() => { onComplete({ name: workout?.name, date: new Date(), duration: Math.ceil(elapsed / 60), xpEarned: 250 + doneSets * 10, sets: doneSets, notes }); setDone(true); }}
        style={{ padding: "16px", borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer" }}>
        Finish Workout 🎉
      </button>
    </div>
  );
}

function Progress({ workoutHistory, stats }) {
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    return { label: ["S","M","T","W","T","F","S"][d.getDay()], active: workoutHistory.some(w => new Date(w.date).toDateString() === ds) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Progress 📈</h1>

      {/* Week view */}
      <div style={{ background: "#0f172a", borderRadius: 18, padding: 18, border: "1px solid #1e293b" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>This Week</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: d.active ? "#6366f1" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: d.active ? 16 : 12, color: d.active ? "#fff" : "#334155" }}>
                {d.active ? "✓" : ""}
              </div>
              <span style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All-time stats */}
      <div style={{ background: "#0f172a", borderRadius: 18, padding: 18, border: "1px solid #1e293b" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>All-Time Stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Total Workouts", val: stats.totalWorkouts, icon: "💪", color: "#6366f1" },
            { label: "Best Streak", val: `${stats.bestStreak}d`, icon: "🔥", color: "#f97316" },
            { label: "Total XP", val: stats.xp.toLocaleString(), icon: "⭐", color: "#facc15" },
            { label: "Total Volume", val: `${(stats.totalVolume / 1000).toFixed(1)}k kg`, icon: "⚡", color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0a0f1e", borderRadius: 14, padding: 14, border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout log */}
      {workoutHistory.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Workout Log</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...workoutHistory].reverse().map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", borderRadius: 12, padding: "12px 14px", border: "1px solid #1e293b" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>+{w.xpEarned} XP</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{w.duration}min • {w.sets} sets</div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Achievements 🏆</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>{earned.length}/{ACHIEVEMENTS.length} unlocked</p>
      </div>

      <div style={{ background: "#0f172a", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
        <XPBar xp={stats.xp} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACHIEVEMENTS.map(a => {
          const isEarned = earned.includes(a.id);
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isEarned ? "#0f172a" : "#0a0f1e", borderRadius: 14, border: `1px solid ${isEarned ? "#312e81" : "#1e293b"}`, opacity: isEarned ? 1 : 0.5 }}>
              <div style={{ fontSize: 28, filter: isEarned ? "none" : "grayscale(1)" }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isEarned ? "#f1f5f9" : "#64748b" }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>{a.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isEarned ? "#6366f1" : "#334155" }}>+{a.xp} XP</div>
                {isEarned && <div style={{ fontSize: 10, color: "#4ade80" }}>✓ Earned</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileScreen({ user, stats, onReset }) {
  const lvl = getLevelInfo(stats.xp);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Profile</h1>

      <div style={{ background: "linear-gradient(135deg,#1e1b4b,#0f172a)", borderRadius: 20, padding: 24, border: "1px solid #312e81", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px" }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{user.name}</h2>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>{user.goal} · {user.level}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#312e81", borderRadius: 99, padding: "6px 14px" }}>
          <span style={{ fontSize: 16 }}>{lvl.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{lvl.rank}</span>
        </div>
      </div>

      <div style={{ background: "#0f172a", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
        <XPBar xp={stats.xp} />
      </div>

      <div style={{ background: "#0f172a", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Settings</p>
        {[
          { label: "Gender", val: user.gender || "Not set" },
          { label: "Goal", val: user.goal },
          { label: "Level", val: user.level },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{s.val}</span>
          </div>
        ))}
      </div>

      <button onClick={onReset} style={{ padding: "14px", borderRadius: 14, background: "#1e293b", color: "#ef4444", fontWeight: 700, fontSize: 14, border: "1px solid #334155", cursor: "pointer" }}>
        Reset App Data
      </button>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useLocalStorage("fq_user", null);
  const [stats, setStats] = useLocalStorage("fq_stats", { xp: 0, streak: 0, bestStreak: 0, totalWorkouts: 0, totalVolume: 0 });
  const [workoutHistory, setWorkoutHistory] = useLocalStorage("fq_history", []);
  const [activeProgram, setActiveProgram] = useLocalStorage("fq_program", null);
  const [tab, setTab] = useState("home");
  const [notification, setNotification] = useState(null);

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

  if (!user) return <Onboarding onDone={(data) => setUser(data)} />;

  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "programs", icon: "📋", label: "Programs" },
    { id: "workout", icon: "💪", label: "Workout" },
    { id: "progress", icon: "📈", label: "Progress" },
    { id: "achievements", icon: "🏆", label: "Awards" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "#f1f5f9" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Notification */}
      {notification && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#1e1b4b", border: "1px solid #6366f1", borderRadius: 99, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 20px 60px #6366f144", animation: "slideDown 0.3s ease" }}>
          <span style={{ fontSize: 20 }}>{notification.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{notification.msg}</span>
        </div>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input:focus, textarea:focus { outline: 1px solid #6366f1; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>

      {/* Main content */}
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 90 }}>
        <div style={{ padding: "20px 16px 0" }}>
          {tab === "home" && <Home user={user} stats={stats} workoutHistory={workoutHistory} activeProgram={activeProgram} setActiveProgram={setActiveProgram} navigate={setTab} addXP={addXP} programs={PROGRAMS} />}
          {tab === "programs" && <Programs user={user} activeProgram={activeProgram} setActiveProgram={setActiveProgram} navigate={setTab} />}
          {tab === "workout" && <WorkoutLogger activeProgram={activeProgram} onComplete={completeWorkout} navigate={setTab} />}
          {tab === "progress" && <Progress workoutHistory={workoutHistory} stats={stats} />}
          {tab === "achievements" && <Achievements stats={stats} workoutHistory={workoutHistory} />}
          {tab === "profile" && <ProfileScreen user={user} stats={stats} onReset={() => { if (confirm("Reset all data? This cannot be undone.")) { localStorage.clear(); window.location.reload(); } }} />}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0f1e", borderTop: "1px solid #1e293b", paddingBottom: "env(safe-area-inset-bottom)", zIndex: 100 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", color: tab === t.id ? "#6366f1" : "#475569", transition: "color 0.2s" }}>
              <span style={{ fontSize: t.id === "workout" ? 20 : 18 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.label}</span>
              {tab === t.id && <div style={{ width: 20, height: 2, background: "#6366f1", borderRadius: 99, marginTop: 1 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
