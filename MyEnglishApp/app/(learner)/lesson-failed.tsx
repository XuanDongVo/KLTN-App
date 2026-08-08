import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { styles } from '@/styles/(learner)/lesson-failed.styles';

export default function LessonFailedScreen() {
  const params = useLocalSearchParams<{ lessonId: string; level?: string }>();
  const router = useRouter();

  return <SafeAreaView style={styles.safe}>
    <View style={styles.content}>
      <View style={styles.badge}><MaterialCommunityIcons name="heart-broken" size={66} color={Theme.colors.coral} /></View>
      <Text style={styles.eyebrow}>HẾT TIM RỒI!</Text>
      <Text style={styles.title}>Đừng nản chí!</Text>
      <Text style={styles.subtitle}>Bạn đã trả lời sai quá nhiều lần. Hãy đợi tim hồi lại hoặc ôn tập thêm nhé.</Text>
    </View>
    <View style={styles.bottom}>
      <ActionButton label="Tiếp tục lộ trình" icon="map-marker-path" onPress={() => router.replace('/(tabs)')} />
      <ActionButton label="Học lại bài này" outline icon="refresh" onPress={() => router.replace({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: params.lessonId, level: params.level ?? 'PRE_A1_STARTERS' } })} />
    </View>
  </SafeAreaView>;
}
