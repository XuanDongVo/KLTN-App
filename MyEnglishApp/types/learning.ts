export type ActivityType =
  | 'WORD_CARD'
  | 'IMAGE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_BLANK'
  | 'TRUE_FALSE'
  | 'MATCHING'
  | 'SENTENCE_BUILDER'
  | 'LISTEN_CHOOSE'
  | 'SPEAK_REPEAT'
  | 'IMAGE_CAPTION';

export type Choice = { id: string; label: string; imageUrl?: string; image?: ImageSourcePropType };
export type MatchPair = { left: string; right: string };

export type Activity = {
  id: string;
  type: ActivityType;
  prompt: string;
  instruction?: string;
  imageUrl?: string;
  image?: ImageSourcePropType;
  audioUrl?: string;
  speechText?: string;
  choices?: Choice[];
  answer?: string | boolean;
  sentence?: string;
  words?: string[];
  pairs?: MatchPair[];
  explanation?: string;
  meaning?: string;
  example?: string;
  xp: number;
};

export type Lesson = {
  id: string;
  title: string;
  objective: string;
  icon: string;
  color: string;
  estimatedMinutes: number;
  activities: Activity[];
};

export type LearningUnit = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  coverImage: ImageSourcePropType;
  lessons: Lesson[];
};

export type LessonResult = {
  lessonId: string;
  correct: number;
  total: number;
  xpEarned: number;
  stars: number;
  completedAt: string;
  mistakes: string[];
};

export type LearnerState = {
  xp: number;
  streak: number;
  hearts: number;
  dailyGoal: number;
  dailyXp: number;
  completedLessonIds: string[];
  results: Record<string, LessonResult>;
  mistakeActivityIds: string[];
};

export type CaptionResult = {
  caption: string;
  confidence?: number;
  objects?: string[];
  source: 'mock' | 'backend';
};
import type { ImageSourcePropType } from 'react-native';
