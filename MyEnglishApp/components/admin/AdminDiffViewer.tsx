import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Theme } from '@/constants/Theme';
import { adminStyles, CommandButton } from './AdminShared';
import type { AdminCurriculumTree, AdminUnit, AdminLesson, AdminActivity } from '@/types/adminCurriculum';
import type { BackendLevelCode } from '@/types/backendCurriculum';

import { useModal } from '@/context/ModalContext';

interface DiffViewerProps {
  pendingVersionId: number;
  levelCode: BackendLevelCode;
  service: any;
  onClose: () => void;
  onReviewComplete: () => void;
}

export function AdminDiffViewer({ pendingVersionId, levelCode, service, onClose, onReviewComplete }: DiffViewerProps) {
  const { showAlert } = useModal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishedTree, setPublishedTree] = useState<AdminCurriculumTree>();
  const [pendingTree, setPendingTree] = useState<AdminCurriculumTree>();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const levels = await service.getLevels();
        const level = levels.find((l: any) => l.code === levelCode);
        const published = level?.versions.find((v: any) => v.status === 'PUBLISHED');
        
        const [pending, pub] = await Promise.all([
          service.getVersion(pendingVersionId),
          published ? service.getVersion(published.id) : Promise.resolve(undefined)
        ]);
        
        setPendingTree(pending);
        setPublishedTree(pub);
      } catch (e: any) {
        setError(e.message || 'Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pendingVersionId, levelCode, service]);

  const handleReview = async (approve: boolean) => {
    if (!approve && !feedback.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    setSubmitting(true);
    try {
      await service.reviewDraft(pendingVersionId, approve, feedback);
      onReviewComplete();
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Có lỗi xảy ra.');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={Theme.colors.ink} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Duyệt nội dung thay đổi</Text>
            <Text style={styles.subtitle}>So sánh bản chờ duyệt và bản xuất bản hiện tại</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.green} /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
        ) : (
          <View style={styles.splitView}>
            <View style={styles.column}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>Đang xuất bản</Text>
                <Text style={styles.columnMeta}>{publishedTree ? publishedTree.versionCode : 'Chưa có bản xuất bản'}</Text>
              </View>
              <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                {publishedTree ? <TreeViewer tree={publishedTree} /> : <Text style={styles.emptyText}>Trống</Text>}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            <View style={styles.column}>
              <View style={[styles.columnHeader, { backgroundColor: `${Theme.colors.blue}11` }]}>
                <Text style={[styles.columnTitle, { color: Theme.colors.blueDark }]}>Chờ duyệt</Text>
                <Text style={styles.columnMeta}>{pendingTree?.versionCode}</Text>
              </View>
              <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                {pendingTree && <TreeViewer tree={pendingTree} />}
              </ScrollView>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập nhận xét hoặc lý do từ chối (bắt buộc nếu từ chối)"
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />
          <View style={styles.actions}>
            <CommandButton icon="close-circle-outline" label="Từ chối" danger onPress={() => handleReview(false)} disabled={submitting || loading} />
            <View style={{ width: 12 }} />
            <CommandButton icon="check-circle-outline" label="Chấp nhận" primary onPress={() => handleReview(true)} disabled={submitting || loading} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function TreeViewer({ tree }: { tree: AdminCurriculumTree }) {
  return (
    <View style={styles.tree}>
      {tree.units.map(unit => (
        <View key={unit.id} style={[styles.unit, unit.isDeleted && { opacity: 0.5 }]}>
          <Text style={[styles.unitTitle, unit.isDeleted && { textDecorationLine: 'line-through', color: Theme.colors.coralDark }]}>
            {unit.code} - {unit.title} {unit.isDeleted ? '(Đã xóa)' : ''}
          </Text>
          {unit.lessons.map(lesson => (
            <View key={lesson.id} style={[styles.lesson, lesson.isDeleted && { opacity: 0.5 }]}>
              <Text style={[styles.lessonTitle, lesson.isDeleted && { textDecorationLine: 'line-through', color: Theme.colors.coralDark }]}>
                {lesson.code} - {lesson.title} {lesson.isDeleted ? '(Đã xóa)' : ''}
              </Text>
              {lesson.activities.map((activity, idx) => (
                <Text key={activity.id} style={[styles.activity, activity.isDeleted && { textDecorationLine: 'line-through', color: Theme.colors.coral }]}>
                  {idx + 1}. [{activity.type}] {activity.prompt} {activity.isDeleted ? '(Đã xóa)' : ''}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#EEE' },
  closeBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: Theme.colors.ink },
  subtitle: { fontSize: 14, color: Theme.colors.muted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: Theme.colors.coral, padding: 20 },
  splitView: { flex: 1, flexDirection: 'row' },
  column: { flex: 1 },
  columnHeader: { padding: 16, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderColor: '#EEE' },
  columnTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.ink },
  columnMeta: { fontSize: 13, color: Theme.colors.muted, marginTop: 4 },
  columnScroll: { flex: 1, padding: 16 },
  divider: { width: 1, backgroundColor: '#EEE' },
  emptyText: { color: Theme.colors.muted, fontStyle: 'italic' },
  footer: { padding: 16, borderTopWidth: 1, borderColor: '#EEE', backgroundColor: '#F8F9FA' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, minHeight: 60, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  tree: { paddingBottom: 40 },
  unit: { marginBottom: 16 },
  unitTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8 },
  lesson: { marginLeft: 16, marginBottom: 12 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: Theme.colors.blueDark, marginBottom: 4 },
  activity: { marginLeft: 16, fontSize: 13, color: Theme.colors.muted, marginBottom: 4 },
});
