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

export const createCurriculumService = (prefix: '/api/admin/curriculum' | '/api/contributor/curriculum') => ({
  getLevels: () => request<AdminLevelOverview[]>(`${prefix}/levels`),
  getVersion: (versionId: number) => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}`),
  createDraft: (level: BackendLevelCode, body: DraftRequest = {}) => request<AdminCurriculumTree>(`${prefix}/levels/${level}/drafts`, json('POST', body)),
  updateVersion: (versionId: number, body: VersionRequest) => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}`, json('PUT', body)),
  checkVersionDelete: (versionId: number) => request<VersionDeleteCheck>(`${prefix}/versions/${versionId}/delete-check`),
  deleteVersion: (versionId: number) => request<VersionDeleteResult>(`${prefix}/versions/${versionId}`, json('DELETE')),
  createUnit: (versionId: number, body: UnitRequest) => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}/units`, json('POST', body)),
  updateUnit: (unitId: number, body: UnitRequest) => request<AdminCurriculumTree>(`${prefix}/units/${unitId}`, json('PUT', body)),
  deleteUnit: (unitId: number) => request<AdminCurriculumTree>(`${prefix}/units/${unitId}`, json('DELETE')),
  restoreUnit: (unitId: number) => request<AdminCurriculumTree>(`${prefix}/units/${unitId}/restore`, json('POST')),
  reorderUnits: (versionId: number, orderedIds: number[]) => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}/units/reorder`, json('POST', { orderedIds })),
  createLesson: (unitId: number, body: LessonRequest) => request<AdminCurriculumTree>(`${prefix}/units/${unitId}/lessons`, json('POST', body)),
  updateLesson: (lessonId: number, body: LessonRequest) => request<AdminCurriculumTree>(`${prefix}/lessons/${lessonId}`, json('PUT', body)),
  deleteLesson: (lessonId: number) => request<AdminCurriculumTree>(`${prefix}/lessons/${lessonId}`, json('DELETE')),
  restoreLesson: (lessonId: number) => request<AdminCurriculumTree>(`${prefix}/lessons/${lessonId}/restore`, json('POST')),
  reorderLessons: (unitId: number, orderedIds: number[]) => request<AdminCurriculumTree>(`${prefix}/units/${unitId}/lessons/reorder`, json('POST', { orderedIds })),
  createActivity: (lessonId: number, body: ActivityRequest) => request<AdminCurriculumTree>(`${prefix}/lessons/${lessonId}/activities`, json('POST', body)),
  updateActivity: (activityId: number, body: ActivityRequest) => request<AdminCurriculumTree>(`${prefix}/activities/${activityId}`, json('PUT', body)),
  deleteActivity: (activityId: number) => request<AdminCurriculumTree>(`${prefix}/activities/${activityId}`, json('DELETE')),
  restoreActivity: (activityId: number) => request<AdminCurriculumTree>(`${prefix}/activities/${activityId}/restore`, json('POST')),
  reorderActivities: (lessonId: number, orderedIds: number[]) => request<AdminCurriculumTree>(`${prefix}/lessons/${lessonId}/activities/reorder`, json('POST', { orderedIds })),
  validate: (versionId: number) => request<ValidationReport>(`${prefix}/versions/${versionId}/validate`, json('POST')),
  publish: (versionId: number) => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}/publish`, json('POST')),
  reviewDraft: (versionId: number, approve: boolean, feedback: string = "") => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}/review`, json('POST', { approve, feedback })),
  submitForReview: (versionId: number) => request<AdminCurriculumTree>(`${prefix}/versions/${versionId}/submit-review`, json('POST')),
  generateImageCaption: (imageUrl: string) => request<{ caption: string; objects: string[]; confidence: number }>(`${prefix}/ai/image-caption`, json('POST', { imageUrl })),
});

export const adminCurriculumService = createCurriculumService('/api/admin/curriculum');
export const contributorCurriculumService = createCurriculumService('/api/contributor/curriculum');
