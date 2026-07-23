import { ActivityEditor, ActivityPreview } from './AdminActivityEditor';
import { adminStyles, DialogState, EditorModal, Field, IconButton, CommandButton, StatusBadge, ValidationPanel, toggleSet, activityTypes, ConfirmationDialog, VersionDeleteEditor } from './AdminShared';
import { messageOf, isVersionCode, versionCodeError, isContentCode, contentCodeError, isPositiveNumber, isNonNegativeNumber, isValidMedia, defaultMedia } from '@/utils/admin';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackendActivityRenderer } from '@/components/activities/BackendActivityRenderer';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { adminCurriculumService } from '@/services/adminCurriculumService';
import type {
  ActivityRequest,
  ActivityStage,
  AdminActivity,
  AdminCurriculumTree,
  AdminLesson,
  AdminLevelOverview,
  AdminUnit,
  LessonRequest,
  UnitRequest,
  ValidationReport,
  VersionDeleteCheck,
  VersionRequest,
} from '@/types/adminCurriculum';
import type { BackendActivityType, BackendLevelCode, BackendMedia } from '@/types/backendCurriculum';
type EditorState =
  | { kind: 'version' }
  | { kind: 'unit'; unit?: AdminUnit }
  | { kind: 'lesson'; unitId: number; lesson?: AdminLesson }
  | { kind: 'activity'; lessonId: number; activity?: AdminActivity }
  | { kind: 'preview'; activity: AdminActivity }
  | { kind: 'deleteVersion'; check: VersionDeleteCheck }
  | undefined;
const levelTones: Record<BackendLevelCode, string> = {
  PRE_A1_STARTERS: Theme.colors.green,
  A1_MOVERS: Theme.colors.blue,
  A2_FLYERS: Theme.colors.violet,
};
export function AdminCurriculumWorkspace() {
  const [levels, setLevels] = useState<AdminLevelOverview[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<BackendLevelCode>('PRE_A1_STARTERS');
  const [tree, setTree] = useState<AdminCurriculumTree>();
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [editor, setEditor] = useState<EditorState>();
  const [dialog, setDialog] = useState<DialogState>();
  const [report, setReport] = useState<ValidationReport>();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentLevel = levels.find((level) => level.code === selectedLevel);
  const selectedVersion = tree
    ? currentLevel?.versions.find((version) => version.id === tree.id)
    : undefined;
  const editable = tree?.status === 'DRAFT';
  const load = async (levelCode = selectedLevel, preferredVersionId?: number) => {
    setLoading(true);
    setError('');
    try {
      const nextLevels = await adminCurriculumService.getLevels();
      setLevels(nextLevels);
      const level = nextLevels.find((item) => item.code === levelCode) ?? nextLevels[0];
      if (!level) throw new Error('Chưa có cấp độ curriculum.');
      setSelectedLevel(level.code);
      const chosen = level.versions.find((version) => version.id === preferredVersionId)
        ?? level.versions.find((version) => version.status === 'DRAFT')
        ?? level.versions.find((version) => version.status === 'PUBLISHED')
        ?? level.versions[0];
      if (!chosen) {
        setTree(undefined);
        return;
      }
      const nextTree = await adminCurriculumService.getVersion(chosen.id);
      setTree(nextTree);
      setExpandedUnits(new Set(nextTree.units.slice(0, 1).map((unit) => unit.id)));
      setExpandedLessons(new Set());
      setReport(undefined);
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load('PRE_A1_STARTERS'); }, []);
  const chooseLevel = async (code: BackendLevelCode) => {
    if (code === selectedLevel) return;
    await load(code);
  };
  const chooseVersion = async (versionId: number) => {
    setLoading(true);
    setError('');
    try {
      const nextTree = await adminCurriculumService.getVersion(versionId);
      setTree(nextTree);
      setExpandedUnits(new Set(nextTree.units.slice(0, 1).map((unit) => unit.id)));
      setExpandedLessons(new Set());
      setReport(undefined);
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setLoading(false);
    }
  };
  const createDraft = () => setDialog({
    title: 'Tạo bản nháp mới?',
    message: 'Toàn bộ nội dung đang xuất bản sẽ được sao chép sang một bản nháp có thể chỉnh sửa.',
    confirmLabel: 'Tạo bản nháp',
    onConfirm: () => {
      setDialog(undefined);
      void execute(async () => {
        const next = await adminCurriculumService.createDraft(selectedLevel);
        await load(selectedLevel, next.id);
      });
    },
  });
  const execute = async (action: () => Promise<void | AdminCurriculumTree>) => {
    setBusy(true);
    setError('');
    try {
      const result = await action();
      if (result) setTree(result);
      setEditor(undefined);
      setReport(undefined);
    } catch (reason) {
      const message = messageOf(reason);
      setError(message);
      setDialog({ title: 'Không thể thực hiện', message });
    } finally {
      setBusy(false);
    }
  };
  const validate = async () => {
    if (!tree) return undefined;
    setBusy(true);
    setError('');
    try {
      const nextReport = await adminCurriculumService.validate(tree.id);
      setReport(nextReport);
      return nextReport;
    } catch (reason) {
      const message = messageOf(reason);
      setError(message);
      setDialog({ title: 'Không thể kiểm tra', message });
      return undefined;
    } finally {
      setBusy(false);
    }
  };
  const publish = async () => {
    if (!tree) return;
    const nextReport = await validate();
    if (!nextReport) return;
    if (!nextReport.valid) {
      setDialog({ title: 'Chưa thể xuất bản', message: `Bản nháp còn ${nextReport.issues.length} lỗi. Hãy xem danh sách kiểm tra và sửa đủ nội dung trước khi xuất bản.` });
      return;
    }
    setDialog({
      title: 'Xuất bản curriculum?',
      message: 'Phiên bản đang chạy sẽ được lưu trữ và trẻ sẽ chuyển sang phiên bản mới.',
      confirmLabel: 'Xuất bản',
      onConfirm: () => {
        setDialog(undefined);
        void execute(async () => {
          const next = await adminCurriculumService.publish(tree.id);
          await load(next.levelCode, next.id);
        });
      },
    });
  };
  const requestVersionDelete = async () => {
    if (!tree) return;
    setBusy(true);
    setError('');
    try {
      const check = await adminCurriculumService.checkVersionDelete(tree.id);
      if (!check.canDelete) {
        setDialog({
          title: 'Không thể xóa phiên bản',
          message: `${check.message}\n\nDữ liệu liên quan: ${check.sessions} phiên học, ${check.progressRows} tiến độ, ${check.attempts} lượt trả lời.`,
        });
        return;
      }
      setEditor({ kind: 'deleteVersion', check });
    } catch (reason) {
      const message = messageOf(reason);
      setError(message);
      setDialog({ title: 'Không thể kiểm tra quyền xóa', message });
    } finally {
      setBusy(false);
    }
  };
  const remove = (label: string, action: () => Promise<AdminCurriculumTree>) => setDialog({
    title: `Xóa ${label}?`,
    message: 'Thao tác này chỉ áp dụng cho bản nháp và không thể hoàn tác.',
    confirmLabel: 'Xóa',
    danger: true,
    onConfirm: () => {
      setDialog(undefined);
      void execute(action);
    },
  });
  const move = <T extends { id: number }>(items: T[], id: number, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return undefined;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    return reordered.map((item) => item.id);
  };
  const totalLessons = tree?.units.reduce((sum, unit) => sum + unit.lessons.length, 0) ?? 0;
  const totalActivities = tree?.units.reduce((sum, unit) => sum + unit.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.activities.length, 0), 0) ?? 0;
  return <View style={adminStyles.screen}>
    <ScrollView contentContainerStyle={adminStyles.content} showsVerticalScrollIndicator={false}>
      <View style={adminStyles.heading}>
        <View style={adminStyles.headingCopy}>
          <Text style={adminStyles.eyebrow}>CURRICULUM CMS</Text>
          <Text style={adminStyles.title}>Chương trình học</Text>
          <Text style={adminStyles.subtitle}>{tree ? `${tree.units.length} unit · ${totalLessons} lesson · ${totalActivities} activity` : 'Chưa có dữ liệu'}</Text>
        </View>
        {editable ? <View style={adminStyles.headingActions}>
          <CommandButton icon="shield-check" label="Kiểm tra" onPress={() => void validate()} disabled={busy} />
          <CommandButton icon="publish" label="Xuất bản" primary onPress={() => void publish()} disabled={busy} />
        </View> : null}
      </View>
      <View style={adminStyles.levelTabs}>{levels.map((level) => {
        const active = level.code === selectedLevel;
        const published = level.versions.find((version) => version.status === 'PUBLISHED');
        const draft = level.versions.find((version) => version.status === 'DRAFT');
        return <Pressable key={level.code} onPress={() => void chooseLevel(level.code)} style={[adminStyles.levelTab, active && { borderColor: levelTones[level.code], backgroundColor: `${levelTones[level.code]}12` }]}>
          <View style={[adminStyles.levelDot, { backgroundColor: levelTones[level.code] }]} />
          <Text style={adminStyles.levelName}>{level.displayName}</Text>
          <Text style={adminStyles.levelMeta}>{draft ? 'Có bản nháp' : published?.versionCode ?? 'Chưa xuất bản'}</Text>
        </Pressable>;
      })}</View>
      {error ? <View style={adminStyles.errorBand}><MaterialCommunityIcons name="alert-circle" size={22} color={Theme.colors.coralDark} /><Text style={adminStyles.errorText}>{error}</Text><Pressable accessibilityLabel="Đóng lỗi" onPress={() => setError('')} style={adminStyles.iconTouch}><MaterialCommunityIcons name="close" size={21} color={Theme.colors.coralDark} /></Pressable></View> : null}
      {loading ? <View style={adminStyles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : <>
        <View style={adminStyles.versionBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={adminStyles.versionList}>
            {currentLevel?.versions.map((version) => <Pressable key={version.id} onPress={() => void chooseVersion(version.id)} style={[adminStyles.versionChip, version.id === tree?.id && adminStyles.versionChipActive]}>
              <StatusBadge status={version.status} />
              <Text style={adminStyles.versionCode}>{version.versionCode}</Text>
            </Pressable>)}
          </ScrollView>
          {!currentLevel?.versions.some((version) => version.status === 'DRAFT') ? <CommandButton icon="source-branch-plus" label="Tạo bản nháp" onPress={createDraft} disabled={busy || !selectedVersion} /> : null}
        </View>
        {tree ? <>
          <View style={adminStyles.versionHeader}>
            <View style={adminStyles.versionCopy}><View style={adminStyles.versionTitleRow}><Text style={adminStyles.versionTitle}>{tree.title}</Text><StatusBadge status={tree.status} /></View><Text style={adminStyles.versionDescription}>{tree.description || 'Chưa có mô tả.'}</Text></View>
            <View style={adminStyles.versionActions}>
              {editable ? <IconButton icon="pencil" label="Sửa thông tin phiên bản" onPress={() => setEditor({ kind: 'version' })} /> : null}
              {tree.status !== 'PUBLISHED' ? <CommandButton danger icon="trash-can-outline" label={tree.status === 'DRAFT' ? 'Hủy bản nháp' : 'Xóa bản lưu trữ'} onPress={() => void requestVersionDelete()} disabled={busy} /> : null}
            </View>
          </View>
          {report ? <ValidationPanel report={report} onClose={() => setReport(undefined)} /> : null}
          <View style={adminStyles.sectionHeading}><View><Text style={adminStyles.sectionTitle}>Cây nội dung</Text><Text style={adminStyles.sectionMeta}>{tree.units.length} unit trong {tree.versionCode}</Text></View>{editable ? <CommandButton icon="plus" label="Thêm unit" onPress={() => setEditor({ kind: 'unit' })} /> : null}</View>
          <View style={adminStyles.tree}>{tree.units.map((unit, unitIndex) => {
            const unitOpen = expandedUnits.has(unit.id);
            return <View key={unit.id} style={adminStyles.unitSection}>
              <Pressable onPress={() => toggleSet(setExpandedUnits, unit.id)} style={adminStyles.unitHeader}>
                <View style={adminStyles.orderBadge}><Text style={adminStyles.orderText}>{unitIndex + 1}</Text></View>
                <View style={adminStyles.rowCopy}><Text style={adminStyles.unitTitle}>{unit.title}</Text><Text style={adminStyles.rowMeta}>{unit.lessons.length} lesson · {unit.code}</Text></View>
                {editable ? <View style={adminStyles.rowTools}>
                  <IconButton compact icon="arrow-up" label="Đưa unit lên" disabled={unitIndex === 0} onPress={() => { const ids = move(tree.units, unit.id, -1); if (ids) void execute(() => adminCurriculumService.reorderUnits(tree.id, ids)); }} />
                  <IconButton compact icon="arrow-down" label="Đưa unit xuống" disabled={unitIndex === tree.units.length - 1} onPress={() => { const ids = move(tree.units, unit.id, 1); if (ids) void execute(() => adminCurriculumService.reorderUnits(tree.id, ids)); }} />
                  <IconButton compact icon="pencil" label="Sửa unit" onPress={() => setEditor({ kind: 'unit', unit })} />
                  <IconButton compact danger icon="trash-can-outline" label="Xóa unit" onPress={() => remove('unit', async () => {
                    const nextTree = await adminCurriculumService.deleteUnit(unit.id);
                    const remaining = tree.units.filter((u) => u.id !== unit.id).map((u) => u.id);
                    if (remaining.length > 0) return adminCurriculumService.reorderUnits(tree.id, remaining);
                    return nextTree;
                  })} />
                </View> : null}
                <MaterialCommunityIcons name={unitOpen ? 'chevron-up' : 'chevron-down'} size={25} color={Theme.colors.muted} />
              </Pressable>
              {unitOpen ? <View style={adminStyles.unitBody}>
                <View style={adminStyles.unitDescriptionRow}><Text style={adminStyles.unitDescription}>{unit.description || 'Chưa có mô tả.'}</Text>{editable ? <CommandButton small icon="plus" label="Thêm lesson" onPress={() => setEditor({ kind: 'lesson', unitId: unit.id })} /> : null}</View>
                {unit.lessons.map((lesson, lessonIndex) => {
                  const lessonOpen = expandedLessons.has(lesson.id);
                  return <View key={lesson.id} style={adminStyles.lessonSection}>
                    <Pressable onPress={() => toggleSet(setExpandedLessons, lesson.id)} style={adminStyles.lessonRow}>
                      <View style={adminStyles.lessonOrder}><Text style={adminStyles.lessonOrderText}>{lessonIndex + 1}</Text></View>
                      <MaterialCommunityIcons name="book-open-page-variant" size={21} color={Theme.colors.blueDark} />
                      <View style={adminStyles.rowCopy}><Text style={adminStyles.lessonTitle}>{lesson.title}</Text><Text style={adminStyles.rowMeta}>{lesson.activities.length} hoạt động · {lesson.estimatedMinutes} phút · {lesson.xpReward} XP</Text></View>
                      {editable ? <View style={adminStyles.rowTools}>
                        <IconButton compact icon="arrow-up" label="Đưa lesson lên" disabled={lessonIndex === 0} onPress={() => { const ids = move(unit.lessons, lesson.id, -1); if (ids) void execute(() => adminCurriculumService.reorderLessons(unit.id, ids)); }} />
                        <IconButton compact icon="arrow-down" label="Đưa lesson xuống" disabled={lessonIndex === unit.lessons.length - 1} onPress={() => { const ids = move(unit.lessons, lesson.id, 1); if (ids) void execute(() => adminCurriculumService.reorderLessons(unit.id, ids)); }} />
                        <IconButton compact icon="pencil" label="Sửa lesson" onPress={() => setEditor({ kind: 'lesson', unitId: unit.id, lesson })} />
                        <IconButton compact danger icon="trash-can-outline" label="Xóa lesson" onPress={() => remove('lesson', async () => {
                          const nextTree = await adminCurriculumService.deleteLesson(lesson.id);
                          const remaining = unit.lessons.filter((l) => l.id !== lesson.id).map((l) => l.id);
                          if (remaining.length > 0) return adminCurriculumService.reorderLessons(unit.id, remaining);
                          return nextTree;
                        })} />
                      </View> : null}
                      <MaterialCommunityIcons name={lessonOpen ? 'chevron-up' : 'chevron-down'} size={23} color={Theme.colors.muted} />
                    </Pressable>
                    {lessonOpen ? <View style={adminStyles.activityArea}>
                      <View style={adminStyles.activityAreaHeader}><Text style={adminStyles.objective}>{lesson.objective}</Text>{editable ? <CommandButton small icon="plus" label="Thêm hoạt động" onPress={() => setEditor({ kind: 'activity', lessonId: lesson.id })} /> : null}</View>
                      {lesson.activities.map((activity, activityIndex) => <View key={activity.id} style={adminStyles.activityRow}>
                        <View style={adminStyles.activityIcon}><MaterialCommunityIcons name={activityTypes.find((item) => item.value === activity.type)?.icon as never ?? 'cards'} size={19} color={Theme.colors.violet} /></View>
                        <View style={adminStyles.rowCopy}><Text style={adminStyles.activityTitle}>{activityIndex + 1}. {activity.prompt}</Text><Text style={adminStyles.rowMeta}>{activityTypes.find((item) => item.value === activity.type)?.label} · {activity.stage} · {activity.xpReward} XP</Text></View>
                        <IconButton compact icon="eye-outline" label="Xem hoạt động" onPress={() => setEditor({ kind: 'preview', activity })} />
                        {editable ? <View style={adminStyles.rowTools}>
                          <IconButton compact icon="arrow-up" label="Đưa hoạt động lên" disabled={activityIndex === 0} onPress={() => { const ids = move(lesson.activities, activity.id, -1); if (ids) void execute(() => adminCurriculumService.reorderActivities(lesson.id, ids)); }} />
                          <IconButton compact icon="arrow-down" label="Đưa hoạt động xuống" disabled={activityIndex === lesson.activities.length - 1} onPress={() => { const ids = move(lesson.activities, activity.id, 1); if (ids) void execute(() => adminCurriculumService.reorderActivities(lesson.id, ids)); }} />
                          <IconButton compact icon="pencil" label="Sửa hoạt động" onPress={() => setEditor({ kind: 'activity', lessonId: lesson.id, activity })} />
                          <IconButton compact danger icon="trash-can-outline" label="Xóa hoạt động" onPress={() => remove('hoạt động', async () => {
                            const nextTree = await adminCurriculumService.deleteActivity(activity.id);
                            const remaining = lesson.activities.filter((a) => a.id !== activity.id).map((a) => a.id);
                            if (remaining.length > 0) return adminCurriculumService.reorderActivities(lesson.id, remaining);
                            return nextTree;
                          })} />
                        </View> : null}
                      </View>)}
                    </View> : null}
                  </View>;
                })}
              </View> : null}
            </View>;
          })}</View>
        </> : <View style={adminStyles.empty}><MaterialCommunityIcons name="book-plus-outline" size={48} color={Theme.colors.muted} /><Text style={adminStyles.emptyTitle}>Chưa có curriculum</Text></View>}
      </>}
    </ScrollView>
    {editor?.kind === 'version' && tree ? <VersionEditor initial={tree} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => adminCurriculumService.updateVersion(tree.id, body))} /> : null}
    {editor?.kind === 'unit' && tree ? <UnitEditor initial={editor.unit} fallbackMedia={tree.units[0]?.coverImage} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => editor.unit ? adminCurriculumService.updateUnit(editor.unit.id, body) : adminCurriculumService.createUnit(tree.id, body))} /> : null}
    {editor?.kind === 'lesson' ? <LessonEditor initial={editor.lesson} fallbackMedia={tree?.units.find((unit) => unit.id === editor.unitId)?.coverImage} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => editor.lesson ? adminCurriculumService.updateLesson(editor.lesson.id, body) : adminCurriculumService.createLesson(editor.unitId, body))} /> : null}
    {editor?.kind === 'activity' && tree?.units.flatMap(u => u.lessons).find(l => l.id === editor.lessonId) ? <ActivityEditor lesson={tree.units.flatMap(u => u.lessons).find(l => l.id === editor.lessonId)!} initial={editor.activity} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => editor.activity ? adminCurriculumService.updateActivity(editor.activity.id, body) : adminCurriculumService.createActivity(editor.lessonId, body))} /> : null}
    {editor?.kind === 'preview' ? <ActivityPreview activity={editor.activity} onClose={() => setEditor(undefined)} /> : null}
    {editor?.kind === 'deleteVersion' && tree ? <VersionDeleteEditor check={editor.check} busy={busy} onClose={() => setEditor(undefined)} onDelete={() => execute(async () => {
      await adminCurriculumService.deleteVersion(tree.id);
      await load(selectedLevel);
    })} /> : null}
    {dialog ? <ConfirmationDialog dialog={dialog} onClose={() => setDialog(undefined)} /> : null}
  </View>;
}
function VersionEditor({ initial, busy, onClose, onSave }: { initial: AdminCurriculumTree; busy: boolean; onClose: () => void; onSave: (body: VersionRequest) => void }) {
  const [versionCode, setVersionCode] = useState(initial.versionCode);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? '');
  const validCode = isVersionCode(versionCode);
  return <EditorModal title="Thông tin phiên bản" onClose={onClose}><Field label="Mã phiên bản" placeholder="VD: STARTERS_2026.6" hint="Đổi mã DRAFT thành mã phát hành trước khi lưu hoặc xuất bản." error={versionCodeError(versionCode)} value={versionCode} onChangeText={setVersionCode} autoCapitalize="characters" /><Field label="Tên chương trình" placeholder="VD: Pre-A1 Starters" value={title} onChangeText={setTitle} /><Field label="Mô tả" value={description} onChangeText={setDescription} multiline /><ActionButton label="Lưu thay đổi" icon="content-save" disabled={busy || !validCode || !title.trim()} onPress={() => onSave({ versionCode: versionCode.trim(), title: title.trim(), description: description.trim() })} /></EditorModal>;
}
function UnitEditor({ initial, fallbackMedia, busy, onClose, onSave }: { initial?: AdminUnit; fallbackMedia?: BackendMedia; busy: boolean; onClose: () => void; onSave: (body: UnitRequest) => void }) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [media, setMedia] = useState<BackendMedia>(initial?.coverImage ?? (initial ? fallbackMedia : undefined) ?? defaultMedia());
  const valid = isContentCode(code) && Boolean(title.trim()) && isValidMedia(media);
  return <EditorModal title={initial ? 'Sửa unit' : 'Thêm unit'} onClose={onClose}><Field label="Mã unit" placeholder="VD: STARTERS_U06" error={contentCodeError(code)} value={code} onChangeText={setCode} autoCapitalize="characters" /><Field label="Tên unit" placeholder="VD: Thiên nhiên quanh em" value={title} onChangeText={setTitle} /><Field label="Mô tả" placeholder="Mục tiêu và chủ đề chính của unit" value={description} onChangeText={setDescription} multiline /><AdminImageField value={media} onChange={setMedia} /><ActionButton label={initial ? 'Lưu unit' : 'Tạo unit'} icon="content-save" disabled={busy || !valid} onPress={() => onSave({ code: code.trim(), title: title.trim(), description: description.trim(), coverImage: media })} /></EditorModal>;
}
function LessonEditor({ initial, fallbackMedia, busy, onClose, onSave }: { initial?: AdminLesson; fallbackMedia?: BackendMedia; busy: boolean; onClose: () => void; onSave: (body: LessonRequest) => void }) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [objective, setObjective] = useState(initial?.objective ?? '');
  const [minutes, setMinutes] = useState(initial ? String(initial.estimatedMinutes) : '');
  const [xp, setXp] = useState(initial ? String(initial.xpReward) : '');
  const [media, setMedia] = useState<BackendMedia>(initial?.coverImage ?? (initial ? fallbackMedia : undefined) ?? defaultMedia());
  const valid = isContentCode(code) && Boolean(title.trim()) && Boolean(objective.trim()) && isPositiveNumber(minutes) && isNonNegativeNumber(xp) && isValidMedia(media);
  return <EditorModal title={initial ? 'Sửa lesson' : 'Thêm lesson'} onClose={onClose}><Field label="Mã lesson" placeholder="VD: STARTERS_U06_L01" error={contentCodeError(code)} value={code} onChangeText={setCode} autoCapitalize="characters" /><Field label="Tên lesson" placeholder="VD: Animals in the park" value={title} onChangeText={setTitle} /><Field label="Mục tiêu" placeholder="Trẻ nhận biết và sử dụng được..." value={objective} onChangeText={setObjective} multiline /><View style={adminStyles.twoColumns}><View style={adminStyles.fieldColumn}><Field label="Thời lượng (phút)" placeholder="VD: 12" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" /></View><View style={adminStyles.fieldColumn}><Field label="XP hoàn thành" placeholder="VD: 20" value={xp} onChangeText={setXp} keyboardType="number-pad" /></View></View><AdminImageField value={media} onChange={setMedia} /><ActionButton label={initial ? 'Lưu lesson' : 'Tạo lesson'} icon="content-save" disabled={busy || !valid} onPress={() => onSave({ code: code.trim(), title: title.trim(), objective: objective.trim(), estimatedMinutes: Number(minutes), xpReward: Number(xp), coverImage: media })} /></EditorModal>;
}
