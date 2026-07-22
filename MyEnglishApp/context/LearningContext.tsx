import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LearnerState, LessonResult } from '@/types/learning';

const STORAGE_KEY = '@fun-english/learner-state-v2';
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
};

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => value && setState({ ...initialState, ...JSON.parse(value) }))
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
    await persist({
      ...state,
      xp: state.xp + xpDelta,
      dailyXp: state.dailyXp + xpDelta,
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
    () => ({ state, ready, completeLesson, resolveMistake, resetProgress }),
    [state, ready, completeLesson, resolveMistake, resetProgress],
  );
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error('useLearning must be used inside LearningProvider');
  return value;
}
