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

import { request } from './apiClient';

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
  generateImageCaption: (imageUrl: string) => request<{ caption: string; objects: string[]; confidence: number }>(`/api/admin/curriculum/ai/image-caption`, json('POST', { imageUrl })),
};
