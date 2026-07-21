import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  BackendAttemptResult,
  BackendFinishResult,
  BackendLevelCode,
  BackendLevelSummary,
  BackendLearningPath,
  BackendLessonSession,
} from '@/types/backendCurriculum';

import { API_URL, request } from './apiClient';

export function resolveCurriculumMediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const curriculumService = {
  getLevels: () => request<BackendLevelSummary[]>('/api/learner/levels'),
  getPath: (level: BackendLevelCode) => request<BackendLearningPath>(`/api/learner/path?level=${level}`),
  getSelectedPath: async () => {
    const stored = await AsyncStorage.getItem('@fun-english/selected-level');
    const level: BackendLevelCode = stored === 'A1_MOVERS' || stored === 'A2_FLYERS'
      ? stored
      : 'PRE_A1_STARTERS';
    return request<BackendLearningPath>(`/api/learner/path?level=${level}`);
  },
  startLesson: (lessonId: number) => request<BackendLessonSession>(`/api/lessons/${lessonId}/sessions`, { method: 'POST' }),
  getSession: (sessionId: string) => request<BackendLessonSession>(`/api/sessions/${sessionId}`),
  submitAttempt: (sessionId: string, activityId: number, answer: unknown) =>
    request<BackendAttemptResult>(`/api/sessions/${sessionId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ activityId, answer }),
    }),
  finishLesson: (sessionId: string) => request<BackendFinishResult>(`/api/sessions/${sessionId}/finish`, { method: 'POST' }),
};
