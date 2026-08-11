import type { BackendActivityType, BackendLevelCode, BackendMedia } from '@/types/backendCurriculum';

export type CurriculumLifecycle = 'DRAFT' | 'PENDING' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
export type ActivityStage = 'LEARN' | 'PRACTISE' | 'CHECK';

export type AdminVersionCard = {
  id: number;
  versionCode: string;
  title: string;
  description?: string;
  status: CurriculumLifecycle;
  unitCount: number;
  lessonCount: number;
  activityCount: number;
  lockedByUserId?: string | null;
};

export type AdminLevelOverview = {
  code: BackendLevelCode;
  displayName: string;
  versions: AdminVersionCard[];
};

export type AdminActivity = {
  id: number;
  code: string;
  type: BackendActivityType;
  stage: ActivityStage;
  order: number;
  prompt: string;
  instruction?: string;
  xpReward: number;
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  sourceRefs: string[];
  isDeleted?: boolean;
  deletedAt?: string;
};

export type AdminLesson = {
  id: number;
  code: string;
  title: string;
  objective: string;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  coverImage: BackendMedia;
  isDeleted?: boolean;
  deletedAt?: string;
  activities: AdminActivity[];
};

export interface AdminCurriculumVersion {
  id: number;
  versionCode: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PENDING' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  reviewFeedback?: string;
  unitCount: number;
  lessonCount: number;
  activityCount: number;
  lockedByUserId?: string | null;
}

export type AdminUnit = {
  id: number;
  code: string;
  title: string;
  description?: string;
  order: number;
  coverImage: BackendMedia;
  isDeleted?: boolean;
  deletedAt?: string;
  lessons: AdminLesson[];
};

export interface AdminCurriculumTree {
  id: number;
  levelCode: string;
  versionCode: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PENDING' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  reviewFeedback?: string;
  lockedByUserId?: string | null;
  units: AdminUnit[];
};

export type DraftRequest = { versionCode?: string; title?: string; description?: string };
export type VersionRequest = { versionCode: string; title: string; description?: string };
export type UnitRequest = { code: string; title: string; description?: string; coverImage: BackendMedia };
export type LessonRequest = { code: string; title: string; objective: string; estimatedMinutes: number; xpReward: number; coverImage: BackendMedia };
export type ActivityRequest = {
  code: string;
  type: BackendActivityType;
  stage: ActivityStage;
  prompt: string;
  instruction?: string;
  xpReward: number;
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
};

export type ValidationReport = {
  valid: boolean;
  issues: Array<{ path: string; message: string }>;
};

export type VersionDeleteCheck = {
  versionId: number;
  versionCode: string;
  status: CurriculumLifecycle;
  canDelete: boolean;
  sessions: number;
  progressRows: number;
  attempts: number;
  message: string;
};

export type VersionDeleteResult = {
  versionId: number;
  versionCode: string;
  deleted: boolean;
};
