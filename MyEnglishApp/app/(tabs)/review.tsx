import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { findActivity } from '@/data/curriculum';

export default function ReviewScreen() {
  const { state, resolveMistake } = useLearning();
  const [revealed, setRevealed] = useState<string>();
  const mistakes = state.mistakeActivityIds.map(findActivity).filter(Boolean);

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>SMART REVIEW</Text><Text style={styles.title}>Ôn lại để nhớ lâu</Text></View><View style={styles.count}><MaterialCommunityIcons name="brain" size={22} color={Theme.colors.violet} /><Text style={styles.countText}>{mistakes.length}</Text></View></View>
    <ScrollView contentContainerStyle={styles.content}>
      {mistakes.length === 0 ? <View style={styles.empty}><View style={styles.emptyIcon}><MaterialCommunityIcons name="check-decagram" size={58} color={Theme.colors.greenDark} /></View><Text style={styles.emptyTitle}>Hôm nay đã ôn xong!</Text><Text style={styles.emptyText}>Các câu trả lời sai trong bài học sẽ xuất hiện tại đây để bé luyện lại.</Text></View> : mistakes.map((activity) => activity && <Pressable key={activity.id} onPress={() => setRevealed(revealed === activity.id ? undefined : activity.id)} style={styles.reviewCard}>
        <View style={styles.cardTop}><View style={styles.typeIcon}><MaterialCommunityIcons name="lightbulb-on" size={22} color={Theme.colors.yellowDark} /></View><View style={{ flex: 1 }}><Text style={styles.typeLabel}>{activity.type.replaceAll('_', ' ')}</Text><Text style={styles.prompt}>{activity.sentence ?? activity.prompt}</Text></View><MaterialCommunityIcons name={revealed === activity.id ? 'chevron-up' : 'chevron-down'} size={24} color={Theme.colors.muted} /></View>
        {revealed === activity.id && <View style={styles.answer}><Text style={styles.answerLabel}>ĐÁP ÁN</Text><Text style={styles.answerText}>{String(activity.answer ?? activity.example ?? 'Luyện lại hoạt động này')}</Text>{activity.explanation && <Text style={styles.explanation}>{activity.explanation}</Text>}<Pressable onPress={() => resolveMistake(activity.id)} style={styles.learnedButton}><MaterialCommunityIcons name="check" size={18} color="#FFFFFF" /><Text style={styles.learnedLabel}>Đã nhớ</Text></Pressable></View>}
      </Pressable>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, header: { minHeight: 82, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: Theme.colors.violet, fontSize: 11, fontWeight: '900' }, title: { color: Theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 2 }, count: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0EDFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }, countText: { color: Theme.colors.violet, fontWeight: '900' },
  content: { padding: 16, gap: 12, maxWidth: 680, width: '100%', alignSelf: 'center' }, empty: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 90 }, emptyIcon: { width: 116, height: 116, borderRadius: 58, backgroundColor: '#E6F8E9', alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: Theme.colors.ink, fontSize: 23, fontWeight: '900', marginTop: 20 }, emptyText: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 7, maxWidth: 390 },
  reviewCard: { borderWidth: 1, borderColor: Theme.colors.border, borderBottomWidth: 3, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' }, cardTop: { minHeight: 78, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }, typeIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#FFF6D9', alignItems: 'center', justifyContent: 'center' }, typeLabel: { color: Theme.colors.muted, fontSize: 10, fontWeight: '900' }, prompt: { color: Theme.colors.ink, fontSize: 16, fontWeight: '800', marginTop: 3 },
  answer: { padding: 14, backgroundColor: '#F5FAFC', borderTopWidth: 1, borderTopColor: Theme.colors.border }, answerLabel: { color: Theme.colors.greenDark, fontSize: 10, fontWeight: '900' }, answerText: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 3 }, explanation: { color: Theme.colors.muted, lineHeight: 19, marginTop: 7 }, learnedButton: { alignSelf: 'flex-end', marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Theme.colors.greenDark, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 7 }, learnedLabel: { color: '#FFFFFF', fontWeight: '900' },
});
