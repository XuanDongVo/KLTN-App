export type BackendProgressStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

export type BackendLevelCode = 'PRE_A1_STARTERS' | 'A1_MOVERS' | 'A2_FLYERS';

export type BackendLevelSummary = {
  code: BackendLevelCode;
  title: string;
  versionCode: string;
  unitCount: number;
  lessonCount: number;
  completedLessons: number;
  unlocked: boolean;
};

export type BackendMedia = {
  path: string;
  width: number;
  height: number;
  alt: string;
};

export type BackendLessonSummary = {
  id: number;
  code: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  xpReward: number;
  coverImage: BackendMedia;
  activityCount: number;
  unlocked: boolean;
  progressStatus: BackendProgressStatus;
  stars: number;
  bestScore: number;
};

export type BackendUnitSummary = {
  id: number;
  code: string;
  title: string;
  description: string;
  coverImage: BackendMedia;
  lessons: BackendLessonSummary[];
};

export type BackendLearningPath = {
  level: BackendLevelCode;
  title: string;
  versionCode: string;
  units: BackendUnitSummary[];
};

export type BackendActivityType =
  | 'INTRO'
  | 'FLASHCARD'
  | 'IMAGE_CHOICE'
  | 'LISTEN_CHOICE'
  | 'TRUE_FALSE'
  | 'MATCH_PAIRS'
  | 'WORD_ORDER'
  | 'TYPE_ANSWER'
  | 'SPEAK';

export type BackendActivity = {
  id: number;
  code: string;
  type: BackendActivityType;
  stage: 'LEARN' | 'PRACTISE' | 'CHECK';
  order: number;
  prompt: string;
  instruction?: string;
  xpReward: number;
  content: Record<string, unknown>;
};

export type BackendLessonSession = {
  id: string;
  lessonId: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  currentActivityIndex: number;
  heartsRemaining: number;
  correctAttempts: number;
  totalAttempts: number;
  xpEarned: number;
  activities: BackendActivity[];
};

export type BackendAttemptResult = {
  correct: boolean;
  feedback: string;
  heartsRemaining: number;
  currentActivityIndex: number;
  xpEarned: number;
  canFinish: boolean;
};

export type BackendFinishResult = {
  sessionId: string;
  correct: number;
  total: number;
  score: number;
  stars: number;
  xpEarned: number;
  heartsRemaining: number;
};
