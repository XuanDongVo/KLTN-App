import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonPathNode } from '@/components/learner/LessonPathNode';
import { StatusStrip } from '@/components/learner/StatusStrip';
import { NotificationBell } from '@/components/NotificationBell';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { curriculumService, resolveCurriculumMediaUrl } from '@/services/curriculumService';
import type { BackendLearningPath, BackendLevelCode, BackendLevelSummary, BackendUnitSummary } from '@/types/backendCurriculum';
import type { Lesson } from '@/types/learning';
import { styles } from '@/styles/(tabs)/index.styles';

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
  const { levelCode, highlightUnitCode } = useLocalSearchParams<{ levelCode: BackendLevelCode; highlightUnitCode?: string }>();

  // If levelCode is passed from notification, update selectedLevel
  useEffect(() => {
    if (levelCode && (levelCode === 'PRE_A1_STARTERS' || levelCode === 'A1_MOVERS' || levelCode === 'A2_FLYERS')) {
      setSelectedLevel(levelCode);
      void AsyncStorage.setItem(selectedLevelKey, levelCode);
      hasChosenExpandedUnit.current = false; // Reset to allow highlight
    }
  }, [levelCode]);

  // If path is already loaded and highlightUnitCode changes, expand it immediately
  useEffect(() => {
    if (path && highlightUnitCode) {
      const currentUnit = path.units.find((unit) => unit.code === highlightUnitCode);
      if (currentUnit) {
        setExpandedUnits(new Set([currentUnit.id]));
        hasChosenExpandedUnit.current = true;
      }
    }
  }, [highlightUnitCode, path]);

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
      
      if (!hasChosenExpandedUnit.current || highlightUnitCode) {
        let currentUnit;
        if (highlightUnitCode) {
          currentUnit = nextPath.units.find((unit) => unit.code === highlightUnitCode);
        }
        
        if (!currentUnit) {
          currentUnit = nextPath.units.find((unit) => unit.lessons.some((lesson) => lesson.unlocked && lesson.progressStatus !== 'COMPLETED'))
            ?? nextPath.units.find((unit) => unit.lessons.some((lesson) => lesson.unlocked))
            ?? nextPath.units[0];
        }
        
        setExpandedUnits(currentUnit ? new Set([currentUnit.id]) : new Set());
        hasChosenExpandedUnit.current = true;
      }
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được lộ trình học.');
    } finally {
      setRefreshing(false);
    }
  }, [selectedLevel, highlightUnitCode]);

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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <NotificationBell />
        <StatusStrip />
      </View>
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
      
      <Pressable onPress={() => router.push('/(screens)/challenges')} style={{ backgroundColor: '#F0F9FF', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#BAE6FD' }}>
        <View style={{ backgroundColor: '#0EA5E9', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0369A1' }}>Thử thách của bạn</Text>
            <Text style={{ fontSize: 13, color: '#0284C7', marginTop: 2 }}>Tham gia thử thách để nhận thêm phần thưởng!</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" />
      </Pressable>

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
