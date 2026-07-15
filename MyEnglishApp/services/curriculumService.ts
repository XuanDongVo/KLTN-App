import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  BackendAttemptResult,
  BackendFinishResult,
  BackendLevelCode,
  BackendLevelSummary,
  BackendLearningPath,
  BackendLessonSession,
} from '@/types/backendCurriculum';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

type ServerResponse<T> = { code: number; message: string; data: T };

export function resolveCurriculumMediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('Chưa cấu hình địa chỉ máy chủ.');
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Phiên đăng nhập đã hết hạn.');

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra Wi-Fi và địa chỉ API.');
  }

  const payload = (await response.json()) as ServerResponse<T>;
  if (!response.ok) throw new Error(payload.message || 'Yêu cầu không thành công.');
  return payload.data;
}

export const curriculumService = {
  getLevels: () => request<BackendLevelSummary[]>('/api/v1/learner/levels'),
  getPath: (level: BackendLevelCode) => request<BackendLearningPath>(`/api/v1/learner/path?level=${level}`),
  getSelectedPath: async () => {
    const stored = await AsyncStorage.getItem('@fun-english/selected-level');
    const level: BackendLevelCode = stored === 'A1_MOVERS' || stored === 'A2_FLYERS'
      ? stored
      : 'PRE_A1_STARTERS';
    return request<BackendLearningPath>(`/api/v1/learner/path?level=${level}`);
  },
  startLesson: (lessonId: number) => request<BackendLessonSession>(`/api/v1/lessons/${lessonId}/sessions`, { method: 'POST' }),
  getSession: (sessionId: string) => request<BackendLessonSession>(`/api/v1/sessions/${sessionId}`),
  submitAttempt: (sessionId: string, activityId: number, answer: unknown) =>
    request<BackendAttemptResult>(`/api/v1/sessions/${sessionId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ activityId, answer }),
    }),
  finishLesson: (sessionId: string) => request<BackendFinishResult>(`/api/v1/sessions/${sessionId}/finish`, { method: 'POST' }),
};
