import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { UserService, StatsService, HistoryService, AchievementService, ProgramService, migrateV1ToV2 } from '../services/storage';
import { awardWorkoutXP, checkAchievements } from '../services/xp';
import { ACHIEVEMENT_DEFS } from '../constants';

// ─── State shape ──────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  stats: { xp: 0, streak: 0, bestStreak: 0, totalWorkouts: 0, totalVolume: 0, lastWorkoutDate: null },
  history: [],
  achievements: [],
  activeProgram: null,
  notification: null,
  tab: 'home',
  loading: true,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    case 'SET_PROGRAM':
      return { ...state, activeProgram: action.payload };
    case 'SET_TAB':
      return { ...state, tab: action.payload };
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    case 'COMPLETE_WORKOUT': {
      const { entry, xpResult } = action.payload;
      return {
        ...state,
        stats: xpResult.newStats,
        history: [entry, ...state.history].slice(0, 1000),
        achievements: AchievementService.getUnlocked()
          .map(id => ACHIEVEMENT_DEFS.find(a => a.id === id))
          .filter(Boolean),
      };
    }
    case 'RESET':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialise — run migration, load all data
  useEffect(() => {
    try {
      migrateV1ToV2();
      const user = UserService.get();
      const stats = StatsService.get();
      const history = HistoryService.getAll();
      const activeProgram = ProgramService.getActive();
      const unlockedIds = AchievementService.getUnlocked();
      const achievements = unlockedIds
        .map(id => ACHIEVEMENT_DEFS.find(a => a.id === id))
        .filter(Boolean);

      dispatch({ type: 'INIT', payload: { user, stats, history, achievements, activeProgram } });
    } catch (e) {
      console.error('[AppContext] init error:', e);
      dispatch({ type: 'INIT', payload: {} });
    }
  }, []);

  // Auto-clear notifications after 4 seconds
  useEffect(() => {
    if (!state.notification) return;
    const t = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 4000);
    return () => clearTimeout(t);
  }, [state.notification]);

  const completeOnboarding = useCallback((profile) => {
    UserService.set(profile);
    dispatch({ type: 'SET_USER', payload: UserService.get() });
  }, []);

  const completeWorkout = useCallback((workoutData, entry) => {
    try {
      const xpResult = awardWorkoutXP(workoutData);
      HistoryService.add(entry);
      dispatch({ type: 'COMPLETE_WORKOUT', payload: { entry, xpResult } });

      const notifParts = [`+${xpResult.xpEarned} XP`];
      if (xpResult.newAchievements.length > 0) {
        notifParts.push(`🏆 ${xpResult.newAchievements.map(a => a.label).join(', ')}`);
      }
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { type: 'success', message: notifParts.join(' · ') } });

      return xpResult;
    } catch (e) {
      console.error('[AppContext] completeWorkout error:', e);
    }
  }, []);

  const setActiveProgram = useCallback((program) => {
    ProgramService.setActive(program);
    dispatch({ type: 'SET_PROGRAM', payload: program });
  }, []);

  const resetAll = useCallback(() => {
    const { resetAllData } = require('../services/storage');
    resetAllData();
    dispatch({ type: 'RESET' });
  }, []);

  const setTab = useCallback((tab) => dispatch({ type: 'SET_TAB', payload: tab }), []);

  const value = {
    ...state,
    completeOnboarding,
    completeWorkout,
    setActiveProgram,
    resetAll,
    setTab,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            {this.props.fallbackMessage || 'This section encountered an error. Your data is safe.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
