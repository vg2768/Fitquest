/* eslint-disable */
import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { PROGRAMS, RANKS, ACHIEVEMENT_DEFS, GOALS, EXPERIENCE_LEVELS, GENDERS, LIMITS } from "./constants";
import { UserService, StatsService, HistoryService, AchievementService, ProgramService, migrateV1ToV2, resetAllData, exportUserData } from "./services/storage";
import { awardWorkoutXP, getRankForXP, getRankProgress, calculateXP, updateStreak } from "./services/xp";
import { sanitiseName, sanitiseString, sanitiseEnum, sanitiseNumber, sanitiseReps, sanitiseWeight, sanitiseNotes } from "./utils/sanitise";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0a", surface: "#111111", card: "#181818", border: "#2a2a2a",
  text: "#f0f0f0", muted: "#888", dim: "#555",
  accent: "#6366f1", accentHover: "#818cf8", accentDim: "rgba(99,102,241,0.15)",
  success: "#22c55e", warning: "#f59e0b", danger: "#ef4444",
  green: "#4ade80", pink: "#f472b6", purple: "#a78bfa", blue: "#38bdf8",
};

const css = (strings, ...vals) => strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ""), "");

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-text-size-adjust: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${T.bg}; color: ${T.text}; min-height: 100vh;
      line-height: 1.5; overflow-x: hidden;
    }
    button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
    input, textarea, select { font-family: inherit; }
    :focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; border-radius: 4px; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes notifIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    .animate-in { animation: fadeIn 0.3s ease forwards; }
    .slide-up { animation: slideUp 0.4s ease forwards; }
  `}</style>
);

// ─── REUSABLE UI ATOMS ────────────────────────────────────────────────────────
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "20px", cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.2s", ...style,
    }}
    onMouseEnter={onClick ? e => e.currentTarget.style.borderColor = T.dim : null}
    onMouseLeave={onClick ? e => e.currentTarget.style.borderColor = T.border : null}
    >{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600,
    borderRadius: 10, transition: "all 0.15s", border: "1px solid transparent",
    fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14,
    padding: size === "sm" ? "7px 14px" : size === "lg" ? "14px 28px" : "10px 20px",
    opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  };
  const variants = {
    primary: { background: T.accent, color: "#fff", borderColor: T.accent },
    secondary: { background: T.surface, color: T.text, borderColor: T.border },
    ghost: { background: "transparent", color: T.muted, borderColor: "transparent" },
    danger: { background: "transparent", color: T.danger, borderColor: T.danger },
    success: { background: T.success + "20", color: T.success, borderColor: T.success + "40" },
  };
  return (
    <button onClick={disabled ? null : onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
}

function XPBar({ current, next, progress }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: T.muted }}>
        <span>{current.name}</span>
        <span>{next ? next.name : "MAX"}</span>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3,
          width: `${Math.round(progress * 100)}%`,
          background: `linear-gradient(90deg, ${T.accent}, ${T.purple})`,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

function Badge({ children, color = T.accent }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: color + "22", color,
      border: `1px solid ${color}33`,
    }}>{children}</span>
  );
}

function StatCard({ label, value, icon, color = T.accent }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function Notification({ notification }) {
  if (!notification) return null;
  const colors = { success: T.success, error: T.danger, info: T.accent };
  const color = colors[notification.type] || T.accent;
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: T.card, border: `1px solid ${color}44`, borderRadius: 12,
      padding: "12px 18px", maxWidth: 320, fontSize: 14,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`,
      animation: "notifIn 0.3s ease",
    }}>
      <span style={{ color, marginRight: 8 }}>●</span>
      {notification.message}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", gender: "All", goal: GOALS[0], experience: EXPERIENCE_LEVELS[0] });
  const [error, setError] = useState("");

  const steps = ["Your name", "About you", "Your goal", "Experience"];

  function next() {
    if (step === 0) {
      const cleaned = sanitiseName(form.name);
      if (!cleaned) { setError("Please enter your name"); return; }
      setForm(f => ({ ...f, name: cleaned }));
    }
    setError("");
    if (step < 3) setStep(s => s + 1);
    else finish();
  }

  function finish() {
    try {
      onComplete({
        name: sanitiseName(form.name),
        gender: sanitiseEnum(form.gender, ["All", "Men", "Women"], "All"),
        goal: sanitiseString(form.goal, 100),
        experience: sanitiseString(form.experience, 60),
        createdAt: Date.now(),
      });
    } catch { setError("Something went wrong. Please try again."); }
  }

  const sel = (field, options) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => setForm(f => ({ ...f, [field]: opt }))} style={{
          padding: "14px 18px", borderRadius: 12, textAlign: "left",
          border: `1px solid ${form[field] === opt ? T.accent : T.border}`,
          background: form[field] === opt ? T.accentDim : T.surface,
          color: form[field] === opt ? T.accentHover : T.text,
          fontWeight: form[field] === opt ? 600 : 400, fontSize: 15,
          transition: "all 0.15s",
        }}>{opt}</button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }} className="slide-up">
        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? T.accent : T.border,
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>Step {step + 1} of {steps.length}</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          {["What's your name?", "Tell us about you", "What's your goal?", "Your experience level"][step]}
        </h1>
        <p style={{ color: T.muted, marginBottom: 32, fontSize: 15 }}>
          {["We'll personalise your FitQuest experience.", "Helps us tailor programs for you.", "We'll match you with the right programs.", "So we start you at the right intensity."][step]}
        </p>

        {step === 0 && (
          <input
            autoFocus value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(""); }}
            onKeyDown={e => e.key === "Enter" && next()}
            placeholder="e.g. Vijay"
            maxLength={LIMITS.NAME_MAX}
            style={{
              width: "100%", padding: "16px 18px", borderRadius: 12, fontSize: 18,
              background: T.surface, border: `1px solid ${error ? T.danger : T.border}`,
              color: T.text, outline: "none",
            }}
          />
        )}
        {step === 1 && sel("gender", ["All", "Men", "Women"])}
        {step === 2 && sel("goal", GOALS)}
        {step === 3 && sel("experience", EXPERIENCE_LEVELS)}

        {error && <p style={{ color: T.danger, fontSize: 13, marginTop: 10 }}>{error}</p>}

        <Btn onClick={next} size="lg" style={{ width: "100%", marginTop: 28, justifyContent: "center" }}>
          {step === 3 ? "Start my journey 🚀" : "Continue →"}
        </Btn>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ user, stats, history, setTab, activeProgram }) {
  const rank = getRankForXP(stats.xp);
  const { current, next, progress } = getRankProgress(stats.xp);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="animate-in" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>{greeting()}</p>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>{user?.name || "Athlete"} <span>{rank.emoji}</span></h1>
      </div>

      {/* XP / Rank Card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Current rank</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: rank.color }}>{rank.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Total XP</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.accent }}>{stats.xp.toLocaleString()}</div>
          </div>
        </div>
        <XPBar current={current} next={next} progress={progress} />
        {next && (
          <div style={{ fontSize: 12, color: T.muted, marginTop: 8, textAlign: "right" }}>
            {(next.minXP - stats.xp).toLocaleString()} XP to {next.name}
          </div>
        )}
      </Card>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard label="Streak" value={`${stats.streak}d`} icon="🔥" color={T.warning} />
        <StatCard label="Best streak" value={`${stats.bestStreak}d`} icon="⚡" color={T.purple} />
        <StatCard label="Workouts" value={stats.totalWorkouts} icon="💪" color={T.green} />
        <StatCard label="Volume (kg)" value={stats.totalVolume >= 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume} icon="🏋️" color={T.blue} />
      </div>

      {/* Active program */}
      {activeProgram ? (
        <Card style={{ marginBottom: 16, borderColor: T.accent + "44" }}>
          <div style={{ fontSize: 11, color: T.accent, marginBottom: 6, fontWeight: 600 }}>ACTIVE PROGRAM</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{activeProgram.emoji} {activeProgram.title}</div>
              <div style={{ color: T.muted, fontSize: 13 }}>{activeProgram.level} · {activeProgram.weeks}w</div>
            </div>
            <Btn onClick={() => setTab("workout")} size="sm">Start →</Btn>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 16, textAlign: "center", borderStyle: "dashed" }}>
          <div style={{ color: T.muted, marginBottom: 12 }}>No active program</div>
          <Btn onClick={() => setTab("programs")} size="sm">Browse Programs</Btn>
        </Card>
      )}

      {/* Recent workouts */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 12 }}>RECENT ACTIVITY</div>
          {history.slice(0, 3).map((w, i) => (
            <div key={w.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{w.programTitle || "Workout"}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>
                  {new Date(w.timestamp).toLocaleDateString()} · {w.sets} sets · {w.volume}kg
                </div>
              </div>
              <Badge color={T.success}>+{w.xpEarned} XP</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROGRAMS SCREEN ──────────────────────────────────────────────────────────
function ProgramsScreen({ user, activeProgram, setActiveProgram, setTab }) {
  const [filter, setFilter] = useState("All");
  const levels = ["All", "Beginner", "Novice", "Intermediate", "Advanced", "Pro"];

  const filtered = PROGRAMS.filter(p =>
    (filter === "All" || p.level === filter) &&
    (p.gender === "All" || p.gender === user?.gender || user?.gender === "All")
  );

  return (
    <div className="animate-in" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Programs</h2>

      {/* Level filter */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
        {levels.map(l => (
          <button key={l} onClick={() => setFilter(l)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            border: `1px solid ${filter === l ? T.accent : T.border}`,
            background: filter === l ? T.accentDim : T.surface,
            color: filter === l ? T.accentHover : T.muted,
            transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(p => {
          const isActive = activeProgram?.id === p.id;
          return (
            <Card key={p.id} style={{ borderColor: isActive ? p.color + "66" : T.border }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, background: p.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
                }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                    <Badge color={p.color}>{p.level}</Badge>
                  </div>
                  <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>{p.desc}</div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 12, color: T.dim }}>
                    <span>📅 {p.weeks}w</span><span>🗓️ {p.days}x/week</span><span>🎯 {p.tag}</span>
                  </div>
                  {isActive ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn onClick={() => setTab("workout")} size="sm">Resume →</Btn>
                      <Btn onClick={() => setActiveProgram(null)} size="sm" variant="ghost">Deactivate</Btn>
                    </div>
                  ) : (
                    <Btn onClick={() => setActiveProgram(p)} size="sm" variant="secondary">Start program</Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: T.muted }}>
            No programs match this filter
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WORKOUT LOGGER ───────────────────────────────────────────────────────────
function WorkoutScreen({ activeProgram, completeWorkout }) {
  const [activeEx, setActiveEx] = useState(0);
  const [sets, setSets] = useState({});
  const [timer, setTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [startTime] = useState(Date.now());
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const restRef = useRef(null);

  const exercises = activeProgram?.exercises || ["Squat", "Bench Press", "Deadlift"];

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Rest timer
  useEffect(() => {
    if (restTimer <= 0) { clearInterval(restRef.current); return; }
    restRef.current = setInterval(() => setRestTimer(r => {
      if (r <= 1) { clearInterval(restRef.current); return 0; }
      return r - 1;
    }), 1000);
    return () => clearInterval(restRef.current);
  }, [restTimer > 0]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  function addSet(exName) {
    setSets(prev => {
      const curr = prev[exName] || [];
      return { ...prev, [exName]: [...curr, { reps: 10, weight: 0, done: false }] };
    });
  }

  function updateSet(exName, idx, field, val) {
    setSets(prev => {
      const curr = [...(prev[exName] || [])];
      curr[idx] = { ...curr[idx], [field]: field === "reps" ? sanitiseReps(val) : sanitiseWeight(val) };
      return { ...prev, [exName]: curr };
    });
  }

  function markSetDone(exName, idx) {
    setSets(prev => {
      const curr = [...(prev[exName] || [])];
      curr[idx] = { ...curr[idx], done: true };
      return { ...prev, [exName]: curr };
    });
    setRestTimer(90);
  }

  function finish() {
    const allSets = Object.values(sets).flat();
    const doneSets = allSets.filter(s => s.done);
    const totalVolume = doneSets.reduce((sum, s) => sum + (sanitiseWeight(s.weight) * sanitiseReps(s.reps)), 0);
    const duration = Math.round((Date.now() - startTime) / 60000);

    const entry = {
      id: `w-${Date.now()}`,
      programId: activeProgram?.id || "free",
      programTitle: activeProgram?.title || "Free Workout",
      timestamp: Date.now(),
      duration, sets: doneSets.length, volume: Math.round(totalVolume),
      xpEarned: 0, notes: "",
    };

    const result = completeWorkout({ sets: doneSets.length, volume: Math.round(totalVolume), duration }, entry);
    if (result) entry.xpEarned = result.xpEarned;
    setDone(true);
  }

  if (done) {
    return (
      <div className="slide-up" style={{ padding: "48px 24px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Workout Complete!</h2>
        <p style={{ color: T.muted, marginBottom: 32 }}>Keep it up — every rep counts.</p>
        <Btn onClick={() => window.location.reload()} size="lg" style={{ justifyContent: "center", width: "100%" }}>
          Back to Home
        </Btn>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🏋️</div>
        <p style={{ color: T.muted, marginBottom: 20 }}>Select a program to start logging</p>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted }}>NOW TRAINING</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{activeProgram.emoji} {activeProgram.title}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: T.accent }}>{fmt(elapsed)}</div>
          <div style={{ fontSize: 11, color: T.muted }}>elapsed</div>
        </div>
      </div>

      {/* Rest timer */}
      {restTimer > 0 && (
        <div style={{
          background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 12,
          padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>Rest timer</span>
          <span style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: T.accent }}>{fmt(restTimer)}</span>
        </div>
      )}

      {/* Exercise tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {exercises.map((ex, i) => {
          const exSets = sets[ex] || [];
          const completed = exSets.filter(s => s.done).length;
          return (
            <button key={ex} onClick={() => setActiveEx(i)} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              border: `1px solid ${activeEx === i ? T.accent : T.border}`,
              background: activeEx === i ? T.accentDim : T.surface,
              color: activeEx === i ? T.accentHover : T.muted,
              transition: "all 0.15s",
            }}>
              {ex} {completed > 0 && <span style={{ color: T.success }}>✓{completed}</span>}
            </button>
          );
        })}
      </div>

      {/* Set logger */}
      {(() => {
        const ex = exercises[activeEx];
        const exSets = sets[ex] || [];
        return (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{ex}</div>
            {exSets.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 36px", gap: 8, marginBottom: 8, fontSize: 11, color: T.muted, padding: "0 4px" }}>
                  <span>SET</span><span>REPS</span><span>KG</span><span></span>
                </div>
                {exSets.map((s, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "40px 1fr 1fr 36px", gap: 8,
                    alignItems: "center", marginBottom: 8,
                    opacity: s.done ? 0.5 : 1,
                  }}>
                    <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{i + 1}</span>
                    <input type="number" min="0" max="999" value={s.reps} disabled={s.done}
                      onChange={e => updateSet(ex, i, "reps", e.target.value)}
                      style={{ padding: "8px 10px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, textAlign: "center" }}
                    />
                    <input type="number" min="0" max="1000" step="0.5" value={s.weight} disabled={s.done}
                      onChange={e => updateSet(ex, i, "weight", e.target.value)}
                      style={{ padding: "8px 10px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, textAlign: "center" }}
                    />
                    <button onClick={() => markSetDone(ex, i)} disabled={s.done}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${s.done ? T.success : T.border}`, background: s.done ? T.success + "22" : T.surface, color: s.done ? T.success : T.muted, fontWeight: 700 }}>
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Btn onClick={() => addSet(ex)} size="sm" variant="secondary" style={{ width: "100%", justifyContent: "center" }}>
              + Add set
            </Btn>
          </Card>
        );
      })()}

      <Btn onClick={finish} size="lg" variant="success" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>
        Finish workout 🎉
      </Btn>
    </div>
  );
}

// ─── PROGRESS SCREEN ──────────────────────────────────────────────────────────
function ProgressScreen({ stats, history }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const worked = history.some(h => new Date(h.timestamp).toISOString().slice(0, 10) === key);
    return { key, label: ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()], worked };
  });

  return (
    <div className="animate-in" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Progress</h2>

      {/* Weekly heatmap */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 14 }}>THIS WEEK</div>
        <div style={{ display: "flex", gap: 8 }}>
          {days.map(d => (
            <div key={d.key} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: 40, borderRadius: 8, marginBottom: 6,
                background: d.worked ? T.accent : T.surface,
                border: `1px solid ${d.worked ? T.accent : T.border}`,
                transition: "all 0.3s",
              }} />
              <div style={{ fontSize: 11, color: d.worked ? T.accent : T.muted }}>{d.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard label="Total XP" value={stats.xp.toLocaleString()} icon="⭐" color={T.accent} />
        <StatCard label="Best Streak" value={`${stats.bestStreak}d`} icon="🔥" color={T.warning} />
        <StatCard label="Workouts" value={stats.totalWorkouts} icon="💪" color={T.green} />
        <StatCard label="Volume (kg)" value={stats.totalVolume >= 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume} icon="🏋️" color={T.blue} />
      </div>

      {/* History */}
      <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 12 }}>WORKOUT LOG</div>
      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: T.muted }}>No workouts yet</div>
      ) : (
        history.slice(0, 20).map((w, i) => (
          <div key={w.id} style={{
            display: "flex", justifyContent: "space-between",
            padding: "12px 0", borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{w.programTitle || "Workout"}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>
                {new Date(w.timestamp).toLocaleDateString()} · {w.duration}min · {w.sets} sets
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge color={T.success}>+{w.xpEarned} XP</Badge>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{w.volume}kg</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── ACHIEVEMENTS SCREEN ──────────────────────────────────────────────────────
function AchievementsScreen({ stats }) {
  const unlocked = AchievementService.getUnlocked();
  return (
    <div className="animate-in" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Achievements</h2>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>
        {unlocked.length} / {ACHIEVEMENT_DEFS.length} unlocked
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACHIEVEMENT_DEFS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id} style={{
              display: "flex", gap: 14, alignItems: "center",
              padding: "16px", borderRadius: 14,
              background: isUnlocked ? T.card : T.surface,
              border: `1px solid ${isUnlocked ? T.accent + "44" : T.border}`,
              opacity: isUnlocked ? 1 : 0.5,
              transition: "all 0.2s",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, fontSize: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isUnlocked ? T.accentDim : T.border + "44",
                filter: isUnlocked ? "none" : "grayscale(1)",
              }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{a.label}</div>
                <div style={{ color: T.muted, fontSize: 13 }}>{a.desc}</div>
              </div>
              <Badge color={isUnlocked ? T.success : T.muted}>+{a.xp} XP</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ user, stats, resetAll }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const rank = getRankForXP(stats.xp);

  function handleExport() {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fitquest-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-in" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Profile</h2>

      {/* Avatar + name */}
      <Card style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 14px",
          background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800,
        }}>{user?.name?.[0]?.toUpperCase() || "?"}</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</div>
        <div style={{ color: rank.color, fontWeight: 600 }}>{rank.emoji} {rank.name}</div>
      </Card>

      {/* Details */}
      <Card style={{ marginBottom: 16 }}>
        {[
          ["Goal", user?.goal],
          ["Experience", user?.experience],
          ["Member since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ color: T.muted, fontSize: 14 }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{val || "—"}</span>
          </div>
        ))}
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn onClick={handleExport} variant="secondary" style={{ justifyContent: "center" }}>
          📦 Export my data
        </Btn>
        {!confirmReset ? (
          <Btn onClick={() => setConfirmReset(true)} variant="danger" style={{ justifyContent: "center" }}>
            Reset all data
          </Btn>
        ) : (
          <div style={{ background: T.danger + "11", border: `1px solid ${T.danger}44`, borderRadius: 12, padding: 16 }}>
            <p style={{ color: T.danger, fontSize: 14, marginBottom: 12 }}>This will delete all your data. Are you sure?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={resetAll} variant="danger" size="sm">Yes, reset</Btn>
              <Btn onClick={() => setConfirmReset(false)} variant="ghost" size="sm">Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function Nav({ tab, setTab }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "programs", icon: "📋", label: "Programs" },
    { id: "workout", icon: "💪", label: "Workout" },
    { id: "progress", icon: "📈", label: "Progress" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: T.surface, borderTop: `1px solid ${T.border}`,
      display: "flex", padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          color: tab === t.id ? T.accent : T.dim,
          padding: "4px 0", transition: "color 0.15s",
        }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 20, height: 2, background: T.accent, borderRadius: 1 }} />}
        </button>
      ))}
    </nav>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(StatsService.get());
  const [history, setHistory] = useState([]);
  const [activeProgram, setActiveProgramState] = useState(null);
  const [tab, setTab] = useState("home");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      migrateV1ToV2();
      const u = UserService.get();
      const s = StatsService.get();
      const h = HistoryService.getAll();
      const p = ProgramService.getActive();
      setUser(u); setStats(s); setHistory(h); setActiveProgramState(p);
    } catch (e) { console.error("Init error:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  function handleOnboarding(profile) {
    UserService.set(profile);
    setUser(UserService.get());
  }

  function handleCompleteWorkout(workoutData, entry) {
    const result = awardWorkoutXP(workoutData);
    HistoryService.add({ ...entry, xpEarned: result.xpEarned });
    setStats(StatsService.get());
    setHistory(HistoryService.getAll());
    const msg = `+${result.xpEarned} XP earned` + (result.newAchievements.length ? ` · 🏆 ${result.newAchievements.map(a => a.label).join(", ")}` : "");
    setNotification({ type: "success", message: msg });
    return result;
  }

  function handleSetActiveProgram(program) {
    ProgramService.setActive(program);
    setActiveProgramState(program);
  }

  function handleReset() {
    resetAllData();
    setUser(null); setStats(StatsService.get()); setHistory([]);
    setActiveProgramState(null); setTab("home");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <GlobalStyle />
        <Onboarding onComplete={handleOnboarding} />
      </>
    );
  }

  const screens = {
    home: <HomeScreen user={user} stats={stats} history={history} setTab={setTab} activeProgram={activeProgram} />,
    programs: <ProgramsScreen user={user} activeProgram={activeProgram} setActiveProgram={handleSetActiveProgram} setTab={setTab} />,
    workout: <WorkoutScreen activeProgram={activeProgram} completeWorkout={handleCompleteWorkout} />,
    progress: <ProgressScreen stats={stats} history={history} />,
    profile: <ProfileScreen user={user} stats={stats} resetAll={handleReset} />,
  };

  return (
    <>
      <GlobalStyle />
      <Notification notification={notification} />
      <main style={{ paddingBottom: 80, minHeight: "100vh" }}>
        {screens[tab] || screens.home}
      </main>
      <Nav tab={tab} setTab={setTab} />
    </>
  );
}
