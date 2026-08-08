import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LearnerState, LessonResult } from '@/types/learning';
import { request, ServerResponse } from '@/services/apiClient';

const STORAGE_KEY = '@fun-english/learner-state-v2';

type LearnerProfileResponse = {
  totalScore: number;
  dailyGoal: number;
  dailyXp: number;
  streak: number;
  hearts: number;
  username?: string;
  avatarUrl?: string;
};

const initialState: LearnerState = {
  xp: 0,
  streak: 1,
  hearts: 5,
  dailyGoal: 20,
  dailyXp: 0,
  completedLessonIds: [],
  results: {},
  mistakeActivityIds: [],
};

type LearningContextValue = {
  state: LearnerState;
  ready: boolean;
  completeLesson: (result: LessonResult) => Promise<void>;
  resolveMistake: (activityId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await request<LearnerProfileResponse>('/api/learner/profile');
      if (profile) {
        setState((prev) => ({
          ...prev,
          xp: profile.totalScore || 0,
          dailyGoal: profile.dailyGoal || 20,
          dailyXp: profile.dailyXp || 0,
          streak: profile.streak || 0,
          hearts: profile.hearts ?? 5,
          username: profile.username,
          avatarUrl: profile.avatarUrl,
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      request<LearnerProfileResponse>('/api/learner/profile').catch(() => null)
    ])
      .then(([localValue, profile]) => {
        let newState = { ...initialState };
        if (localValue) {
          newState = { ...newState, ...JSON.parse(localValue) };
        }
        if (profile) {
          newState.xp = profile.totalScore || 0;
          newState.dailyGoal = profile.dailyGoal || 20;
          newState.dailyXp = profile.dailyXp || 0;
          newState.streak = profile.streak || 0;
          newState.hearts = profile.hearts ?? 5;
          newState.username = profile.username;
          newState.avatarUrl = profile.avatarUrl;
        }
        setState(newState);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback(async (next: LearnerState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const completeLesson = useCallback(async (result: LessonResult) => {
    const previous = state.results[result.lessonId];
    const xpDelta = previous ? Math.max(0, result.xpEarned - previous.xpEarned) : result.xpEarned;
    const completedLessonIds = state.completedLessonIds.includes(result.lessonId)
      ? state.completedLessonIds
      : [...state.completedLessonIds, result.lessonId];
    const newDailyXp = state.dailyXp + xpDelta;
    const newStreak = state.dailyXp < state.dailyGoal && newDailyXp >= state.dailyGoal 
      ? state.streak + 1 : state.streak;
    
    await persist({
      ...state,
      xp: state.xp + xpDelta,
      dailyXp: newDailyXp,
      streak: newStreak,
      completedLessonIds,
      results: { ...state.results, [result.lessonId]: result },
      mistakeActivityIds: [...new Set([...state.mistakeActivityIds, ...result.mistakes])],
    });
  }, [persist, state]);

  const resolveMistake = useCallback(async (activityId: string) => {
    await persist({ ...state, mistakeActivityIds: state.mistakeActivityIds.filter((id) => id !== activityId) });
  }, [persist, state]);

  const resetProgress = useCallback(async () => persist(initialState), [persist]);

  const value = useMemo(
    () => ({ state, ready, completeLesson, resolveMistake, resetProgress, refreshProfile }),
    [state, ready, completeLesson, resolveMistake, resetProgress, refreshProfile],
  );
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error('useLearning must be used inside LearningProvider');
  return value;
}
