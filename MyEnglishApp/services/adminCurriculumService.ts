import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  ActivityRequest,
  AdminCurriculumTree,
  AdminLevelOverview,
  DraftRequest,
  LessonRequest,
  UnitRequest,
  ValidationReport,
  VersionDeleteCheck,
  VersionDeleteResult,
  VersionRequest,
} from '@/types/adminCurriculum';
import type { BackendLevelCode } from '@/types/backendCurriculum';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';
type ServerResponse<T> = { code: number; message: string; data: T };

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
  if (!response.ok) throw new Error(payload.message || 'Yêu cầu quản trị không thành công.');
  return payload.data;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const adminCurriculumService = {
  getLevels: () => request<AdminLevelOverview[]>('/api/admin/curriculum/levels'),
  getVersion: (versionId: number) => request<AdminCurriculumTree>(`/api/admin/curriculum/versions/${versionId}`),
  createDraft: (level: BackendLevelCode, body: DraftRequest = {}) => request<AdminCurriculumTree>(`/api/admin/curriculum/levels/${level}/drafts`, json('POST', body)),
  updateVersion: (versionId: number, body: VersionRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/versions/${versionId}`, json('PUT', body)),
  checkVersionDelete: (versionId: number) => request<VersionDeleteCheck>(`/api/admin/curriculum/versions/${versionId}/delete-check`),
  deleteVersion: (versionId: number) => request<VersionDeleteResult>(`/api/admin/curriculum/versions/${versionId}`, json('DELETE')),
  createUnit: (versionId: number, body: UnitRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/versions/${versionId}/units`, json('POST', body)),
  updateUnit: (unitId: number, body: UnitRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/units/${unitId}`, json('PUT', body)),
  deleteUnit: (unitId: number) => request<AdminCurriculumTree>(`/api/admin/curriculum/units/${unitId}`, json('DELETE')),
  reorderUnits: (versionId: number, orderedIds: number[]) => request<AdminCurriculumTree>(`/api/admin/curriculum/versions/${versionId}/units/reorder`, json('POST', { orderedIds })),
  createLesson: (unitId: number, body: LessonRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/units/${unitId}/lessons`, json('POST', body)),
  updateLesson: (lessonId: number, body: LessonRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/lessons/${lessonId}`, json('PUT', body)),
  deleteLesson: (lessonId: number) => request<AdminCurriculumTree>(`/api/admin/curriculum/lessons/${lessonId}`, json('DELETE')),
  reorderLessons: (unitId: number, orderedIds: number[]) => request<AdminCurriculumTree>(`/api/admin/curriculum/units/${unitId}/lessons/reorder`, json('POST', { orderedIds })),
  createActivity: (lessonId: number, body: ActivityRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/lessons/${lessonId}/activities`, json('POST', body)),
  updateActivity: (activityId: number, body: ActivityRequest) => request<AdminCurriculumTree>(`/api/admin/curriculum/activities/${activityId}`, json('PUT', body)),
  deleteActivity: (activityId: number) => request<AdminCurriculumTree>(`/api/admin/curriculum/activities/${activityId}`, json('DELETE')),
  reorderActivities: (lessonId: number, orderedIds: number[]) => request<AdminCurriculumTree>(`/api/admin/curriculum/lessons/${lessonId}/activities/reorder`, json('POST', { orderedIds })),
  validate: (versionId: number) => request<ValidationReport>(`/api/admin/curriculum/versions/${versionId}/validate`, json('POST')),
  publish: (versionId: number) => request<AdminCurriculumTree>(`/api/admin/curriculum/versions/${versionId}/publish`, json('POST')),
};
