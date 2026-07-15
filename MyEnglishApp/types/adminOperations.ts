import type { BackendLevelCode } from '@/types/backendCurriculum';

export type AccountStatus = 'ACTIVE' | 'LOCKED';

export type AdminAudit = {
  id: number;
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  createdAt: string;
};

export type AdminDashboard = {
  totalLearners: number;
  activeLearners: number;
  lockedLearners: number;
  activeLastSevenDays: number;
  totalSessions: number;
  completedLessons: number;
  recentActions: AdminAudit[];
};

export type AdminUserSummary = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: AccountStatus;
  totalScore: number;
  completedLessons: number;
  createdAt: string;
  lastLoginAt?: string;
};

export type AdminUserPage = {
  items: AdminUserSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type AdminLevelProgress = {
  level: BackendLevelCode;
  title: string;
  completedLessons: number;
  totalLessons: number;
  stars: number;
};

export type AdminSession = {
  id: string;
  lessonTitle: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  correctAttempts: number;
  totalAttempts: number;
  xpEarned: number;
  startedAt: string;
  finishedAt?: string;
};

export type AdminUserDetail = {
  user: AdminUserSummary;
  totalStars: number;
  levels: AdminLevelProgress[];
  recentSessions: AdminSession[];
};

export type AdminMediaAsset = {
  id: number;
  publicId: string;
  secureUrl: string;
  originalFileName: string;
  contentType: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
};

export type CloudinarySignature = {
  fields: Record<string, string | number>;
};
