import { useLocalSearchParams } from 'expo-router';

import { BackendLessonScreen } from '@/components/learner/BackendLessonScreen';
import type { BackendLevelCode } from '@/types/backendCurriculum';

export default function LessonScreen() {
  const { lessonId, level } = useLocalSearchParams<{ lessonId: string; level?: BackendLevelCode }>();
  return <BackendLessonScreen lessonId={lessonId} level={level ?? 'PRE_A1_STARTERS'} />;
}
