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
  startReviewSession: () => request<BackendLessonSession>('/api/learner/review/start', { method: 'POST' }),
  getSession: (sessionId: string) => request<BackendLessonSession>(`/api/sessions/${sessionId}`),
  submitAttempt: (sessionId: string, activityId: number, answer: unknown) =>
    request<BackendAttemptResult>(`/api/sessions/${sessionId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ activityId, answer }),
    }),
  submitSpeakingAttempt: (sessionId: string, activityId: number, recordingUri: string) => {
    const form = new FormData();
    const extension = recordingUri.split('?')[0].split('.').pop()?.toLowerCase() || 'm4a';
    form.append('activityId', String(activityId));
    form.append('audio', {
      uri: recordingUri,
      name: `speaking.${extension}`,
      type: extension === 'webm' ? 'audio/webm' : 'audio/m4a',
    } as unknown as Blob);
    return request<BackendAttemptResult>(`/api/sessions/${sessionId}/speaking-attempts`, {
      method: 'POST',
      body: form,
    });
  },
  finishLesson: (sessionId: string) => request<BackendFinishResult>(`/api/sessions/${sessionId}/finish`, { method: 'POST' }),
};
