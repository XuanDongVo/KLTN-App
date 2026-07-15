import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonPathNode } from '@/components/learner/LessonPathNode';
import { StatusStrip } from '@/components/learner/StatusStrip';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { curriculumService, resolveCurriculumMediaUrl } from '@/services/curriculumService';
import type { BackendLearningPath, BackendLevelCode, BackendLevelSummary, BackendUnitSummary } from '@/types/backendCurriculum';
import type { Lesson } from '@/types/learning';

const lessonIcons = ['hand-wave', 'human-handsup', 'account-group', 'party-popper', 'food-apple', 'home-heart', 'school', 'elephant', 'beach', 'city-variant'];
const selectedLevelKey = '@fun-english/selected-level';
const levelShortNames: Record<BackendLevelCode, string> = {
  PRE_A1_STARTERS: 'Starters',
  A1_MOVERS: 'Movers',
  A2_FLYERS: 'Flyers',
};

export default function HomeScreen() {
  const router = useRouter();
  const { state, ready } = useLearning();
  const [levels, setLevels] = useState<BackendLevelSummary[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<BackendLevelCode>('PRE_A1_STARTERS');
  const [path, setPath] = useState<BackendLearningPath>();
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const hasChosenExpandedUnit = useRef(false);
  const hasRestoredLevel = useRef(false);

  const loadPath = useCallback(async () => {
    setRefreshing(true);
    try {
      let level = selectedLevel;
      if (!hasRestoredLevel.current) {
        const storedLevel = await AsyncStorage.getItem(selectedLevelKey);
        if (storedLevel === 'PRE_A1_STARTERS' || storedLevel === 'A1_MOVERS' || storedLevel === 'A2_FLYERS') {
          level = storedLevel;
          setSelectedLevel(storedLevel);
        }
        hasRestoredLevel.current = true;
      }

      const [nextLevels, nextPath] = await Promise.all([
        curriculumService.getLevels(),
        curriculumService.getPath(level),
      ]);
      setLevels(nextLevels);
      setPath(nextPath);
      if (!hasChosenExpandedUnit.current) {
        const currentUnit = nextPath.units.find((unit) => unit.lessons.some((lesson) => lesson.unlocked && lesson.progressStatus !== 'COMPLETED'))
          ?? nextPath.units.find((unit) => unit.lessons.some((lesson) => lesson.unlocked))
          ?? nextPath.units[0];
        setExpandedUnits(currentUnit ? new Set([currentUnit.id]) : new Set());
        hasChosenExpandedUnit.current = true;
      }
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được lộ trình học.');
    } finally {
      setRefreshing(false);
    }
  }, [selectedLevel]);

  useFocusEffect(useCallback(() => {
    void loadPath();
  }, [loadPath]));

  const selectLevel = (level: BackendLevelCode) => {
    if (level === selectedLevel) return;
    setSelectedLevel(level);
    setPath(undefined);
    setExpandedUnits(new Set());
    hasChosenExpandedUnit.current = false;
    void AsyncStorage.setItem(selectedLevelKey, level);
  };

  if (!ready || (!path && !error)) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View>;
  }

  const allLessons = path?.units.flatMap((unit) => unit.lessons) ?? [];
  const lessonIndexById = new Map(allLessons.map((lesson, index) => [lesson.id, index]));
  const completedLessons = allLessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;

  const toggleUnit = (unitId: number) => {
    hasChosenExpandedUnit.current = true;
    setExpandedUnits((current) => current.has(unitId) ? new Set() : new Set([unitId]));
  };

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>{selectedLevel.replaceAll('_', ' ')}</Text>
        <Text style={styles.greeting}>Sẵn sàng học nào!</Text>
      </View>
      <StatusStrip />
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.goalBand}>
        <View style={styles.goalIcon}><MaterialCommunityIcons name="target" size={24} color={Theme.colors.blueDark} /></View>
        <View style={styles.goalCopy}>
          <Text style={styles.goalTitle}>Mục tiêu hôm nay</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (state.dailyXp / state.dailyGoal) * 100)}%` }]} /></View>
        </View>
        <Text style={styles.goalValue}>{state.dailyXp}/{state.dailyGoal} XP</Text>
      </View>

      <View style={styles.levelTabs}>
        {levels.map((level) => {
          const active = level.code === selectedLevel;
          return <Pressable
            key={level.code}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => selectLevel(level.code)}
            style={[styles.levelTab, active && styles.levelTabActive]}
          >
            <View style={[styles.levelBadge, level.unlocked ? styles.levelBadgeOpen : styles.levelBadgeLocked]}>
              <MaterialCommunityIcons name={level.unlocked ? 'shield-star' : 'lock'} size={17} color={level.unlocked ? '#FFFFFF' : Theme.colors.muted} />
            </View>
            <Text style={[styles.levelTabTitle, active && styles.levelTabTitleActive]}>{levelShortNames[level.code]}</Text>
            <Text style={styles.levelTabProgress}>{level.completedLessons}/{level.lessonCount}</Text>
          </Pressable>;
        })}
      </View>

      {path ? <View style={styles.levelOverview}>
        <Text style={styles.levelLabel}>HÀNH TRÌNH CỦA EM</Text>
        <Text style={styles.levelTitle}>{path.title}</Text>
        <Text style={styles.levelStats}>{path.units.length} unit · {allLessons.length} bài · {completedLessons}/{allLessons.length} hoàn thành</Text>
      </View> : null}

      {error ? <View style={styles.errorBand}>
        <MaterialCommunityIcons name="cloud-alert" size={24} color={Theme.colors.coralDark} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable accessibilityLabel="Tải lại lộ trình" onPress={loadPath} style={styles.retryButton}>
          {refreshing ? <ActivityIndicator color={Theme.colors.coralDark} /> : <MaterialCommunityIcons name="refresh" size={23} color={Theme.colors.coralDark} />}
        </Pressable>
      </View> : null}

      {path?.units.map((unit, unitIndex) => {
        const expanded = expandedUnits.has(unit.id);
        const completed = unit.lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
        const unitCompleted = completed === unit.lessons.length;
        const unitUnlocked = unit.lessons.some((lesson) => lesson.unlocked);
        return <View key={unit.id} style={styles.unitSection}>
          <UnitHeader unit={unit} index={unitIndex} expanded={expanded} completed={completed} unitCompleted={unitCompleted} unitUnlocked={unitUnlocked} onPress={() => toggleUnit(unit.id)} />
          {expanded ? <View style={styles.path}>{unit.lessons.map((summary) => {
            const globalIndex = lessonIndexById.get(summary.id) ?? 0;
            const lesson: Lesson = {
              id: String(summary.id),
              title: summary.title,
              objective: summary.objective,
              icon: lessonIcons[globalIndex % lessonIcons.length],
              color: globalIndex % 3 === 0 ? Theme.colors.green : globalIndex % 3 === 1 ? Theme.colors.blue : Theme.colors.violet,
              estimatedMinutes: summary.estimatedMinutes,
              activities: [],
            };
            const side = globalIndex % 4 === 1 ? 'right' : globalIndex % 4 === 3 ? 'left' : 'center';
            const lessonCompleted = summary.progressStatus === 'COMPLETED';
            return <LessonPathNode
              key={summary.id}
              lesson={lesson}
              locked={!summary.unlocked}
              completed={lessonCompleted}
              current={summary.unlocked && !lessonCompleted}
              side={side}
              stars={summary.stars}
              onPress={() => router.push({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: String(summary.id), level: selectedLevel } })}
            />;
          })}</View> : null}
        </View>;
      })}
    </ScrollView>
  </SafeAreaView>;
}

function UnitHeader({ unit, index, expanded, completed, unitCompleted, unitUnlocked, onPress }: {
  unit: BackendUnitSummary;
  index: number;
  expanded: boolean;
  completed: number;
  unitCompleted: boolean;
  unitUnlocked: boolean;
  onPress: () => void;
}) {
  return <Pressable
    accessibilityRole="button"
    accessibilityState={{ expanded }}
    accessibilityLabel={`${expanded ? 'Thu gọn' : 'Mở'} unit ${index + 1}: ${unit.title}`}
    onPress={onPress}
    style={({ pressed }) => [styles.unitHeader, pressed && styles.unitPressed]}
  >
    <Image accessibilityLabel={unit.coverImage.alt} source={{ uri: resolveCurriculumMediaUrl(unit.coverImage.path) }} style={styles.unitImage} resizeMode="cover" />
    <View style={styles.unitImageShade} />
    <View style={[styles.unitState, unitCompleted && styles.unitStateComplete, !unitUnlocked && styles.unitStateLocked]}>
      <MaterialCommunityIcons name={unitCompleted ? 'check' : unitUnlocked ? 'flag-variant' : 'lock'} size={20} color={unitCompleted || unitUnlocked ? '#FFFFFF' : Theme.colors.muted} />
    </View>
    <View style={styles.unitCopy}>
      <Text style={styles.unitEyebrow}>UNIT {index + 1} · {completed}/{unit.lessons.length} BÀI</Text>
      <Text style={styles.unitTitle}>{unit.title}</Text>
      <Text style={styles.unitSubtitle} numberOfLines={expanded ? 2 : 1}>{unit.description}</Text>
    </View>
    <View style={styles.chevron}><MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={27} color="#FFFFFF" /></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 76, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  eyebrow: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 11 },
  greeting: { color: Theme.colors.ink, fontWeight: '900', fontSize: 19, marginTop: 2 },
  content: { padding: 16, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  goalBand: { minHeight: 70, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#CBEAFA', borderRadius: 8, padding: 12, gap: 10, marginBottom: 14 },
  goalIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  goalCopy: { flex: 1 },
  goalTitle: { color: Theme.colors.ink, fontWeight: '800', fontSize: 14, marginBottom: 7 },
  goalValue: { color: Theme.colors.blueDark, fontWeight: '900', fontSize: 13 },
  progressTrack: { height: 9, borderRadius: 5, backgroundColor: '#C9DFEA', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: Theme.colors.blue },
  levelTabs: { flexDirection: 'row', gap: 8, marginBottom: 13 },
  levelTab: { flex: 1, minWidth: 0, minHeight: 76, alignItems: 'center', justifyContent: 'center', gap: 3, padding: 7, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  levelTabActive: { borderColor: Theme.colors.green, backgroundColor: '#F0FBF2' },
  levelBadge: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  levelBadgeOpen: { backgroundColor: Theme.colors.green },
  levelBadgeLocked: { backgroundColor: '#E8EEF2' },
  levelTabTitle: { color: Theme.colors.ink, fontSize: 12, fontWeight: '900' },
  levelTabTitleActive: { color: Theme.colors.greenDark },
  levelTabProgress: { color: Theme.colors.muted, fontSize: 10, fontWeight: '800' },
  levelOverview: { paddingVertical: 10, marginBottom: 9 },
  levelLabel: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' },
  levelTitle: { color: Theme.colors.ink, fontSize: 21, lineHeight: 27, fontWeight: '900', marginTop: 2 },
  levelStats: { color: Theme.colors.muted, fontSize: 13, fontWeight: '700', marginTop: 5 },
  unitSection: { marginBottom: 12 },
  unitHeader: { minHeight: 104, borderRadius: 8, borderBottomWidth: 4, borderBottomColor: Theme.colors.greenDark, backgroundColor: Theme.colors.green, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden' },
  unitPressed: { opacity: 0.9, transform: [{ translateY: 1 }] },
  unitImage: { position: 'absolute', right: 0, top: 0, width: '48%', height: '100%' },
  unitImageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,45,52,0.36)' },
  unitState: { width: 42, height: 42, borderRadius: 21, backgroundColor: Theme.colors.blue, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  unitStateComplete: { backgroundColor: Theme.colors.greenDark },
  unitStateLocked: { backgroundColor: 'rgba(255,255,255,0.9)' },
  unitCopy: { flex: 1, minWidth: 0 },
  unitEyebrow: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  unitTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '900', marginTop: 2 },
  unitSubtitle: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 3, maxWidth: 360 },
  chevron: { width: 34, height: 42, alignItems: 'center', justifyContent: 'center' },
  path: { paddingTop: 14, paddingBottom: 4 },
  errorBand: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', marginBottom: 16 },
  errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700', lineHeight: 19 },
  retryButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
