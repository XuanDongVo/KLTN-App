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

type DialogState = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
};

const activityTypes: Array<{ value: BackendActivityType; label: string; icon: string }> = [
  { value: 'INTRO', label: 'Từ vựng', icon: 'book-open-page-variant' },
  { value: 'FLASHCARD', label: 'Thẻ từ', icon: 'cards-outline' },
  { value: 'LISTEN_CHOICE', label: 'Nghe chọn', icon: 'volume-high' },
  { value: 'IMAGE_CHOICE', label: 'Ảnh chọn', icon: 'image-outline' },
  { value: 'TRUE_FALSE', label: 'Đúng sai', icon: 'check-decagram-outline' },
  { value: 'MATCH_PAIRS', label: 'Ghép cặp', icon: 'link-variant' },
  { value: 'WORD_ORDER', label: 'Xếp câu', icon: 'format-list-numbered' },
  { value: 'TYPE_ANSWER', label: 'Viết câu', icon: 'form-textbox' },
  { value: 'SPEAK', label: 'Luyện nói', icon: 'microphone-outline' },
];

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

  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>CURRICULUM CMS</Text>
          <Text style={styles.title}>Chương trình học</Text>
          <Text style={styles.subtitle}>{tree ? `${tree.units.length} unit · ${totalLessons} lesson · ${totalActivities} activity` : 'Chưa có dữ liệu'}</Text>
        </View>
        {editable ? <View style={styles.headingActions}>
          <CommandButton icon="shield-check" label="Kiểm tra" onPress={() => void validate()} disabled={busy} />
          <CommandButton icon="publish" label="Xuất bản" primary onPress={() => void publish()} disabled={busy} />
        </View> : null}
      </View>

      <View style={styles.levelTabs}>{levels.map((level) => {
        const active = level.code === selectedLevel;
        const published = level.versions.find((version) => version.status === 'PUBLISHED');
        const draft = level.versions.find((version) => version.status === 'DRAFT');
        return <Pressable key={level.code} onPress={() => void chooseLevel(level.code)} style={[styles.levelTab, active && { borderColor: levelTones[level.code], backgroundColor: `${levelTones[level.code]}12` }]}>
          <View style={[styles.levelDot, { backgroundColor: levelTones[level.code] }]} />
          <Text style={styles.levelName}>{level.displayName}</Text>
          <Text style={styles.levelMeta}>{draft ? 'Có bản nháp' : published?.versionCode ?? 'Chưa xuất bản'}</Text>
        </Pressable>;
      })}</View>

      {error ? <View style={styles.errorBand}><MaterialCommunityIcons name="alert-circle" size={22} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text><Pressable accessibilityLabel="Đóng lỗi" onPress={() => setError('')} style={styles.iconTouch}><MaterialCommunityIcons name="close" size={21} color={Theme.colors.coralDark} /></Pressable></View> : null}

      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : <>
        <View style={styles.versionBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.versionList}>
            {currentLevel?.versions.map((version) => <Pressable key={version.id} onPress={() => void chooseVersion(version.id)} style={[styles.versionChip, version.id === tree?.id && styles.versionChipActive]}>
              <StatusBadge status={version.status} />
              <Text style={styles.versionCode}>{version.versionCode}</Text>
            </Pressable>)}
          </ScrollView>
          {!currentLevel?.versions.some((version) => version.status === 'DRAFT') ? <CommandButton icon="source-branch-plus" label="Tạo bản nháp" onPress={createDraft} disabled={busy || !selectedVersion} /> : null}
        </View>

        {tree ? <>
          <View style={styles.versionHeader}>
            <View style={styles.versionCopy}><View style={styles.versionTitleRow}><Text style={styles.versionTitle}>{tree.title}</Text><StatusBadge status={tree.status} /></View><Text style={styles.versionDescription}>{tree.description || 'Chưa có mô tả.'}</Text></View>
            <View style={styles.versionActions}>
              {editable ? <IconButton icon="pencil" label="Sửa thông tin phiên bản" onPress={() => setEditor({ kind: 'version' })} /> : null}
              {tree.status !== 'PUBLISHED' ? <CommandButton danger icon="trash-can-outline" label={tree.status === 'DRAFT' ? 'Hủy bản nháp' : 'Xóa bản lưu trữ'} onPress={() => void requestVersionDelete()} disabled={busy} /> : null}
            </View>
          </View>

          {report ? <ValidationPanel report={report} onClose={() => setReport(undefined)} /> : null}

          <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Cây nội dung</Text><Text style={styles.sectionMeta}>{tree.units.length} unit trong {tree.versionCode}</Text></View>{editable ? <CommandButton icon="plus" label="Thêm unit" onPress={() => setEditor({ kind: 'unit' })} /> : null}</View>

          <View style={styles.tree}>{tree.units.map((unit, unitIndex) => {
            const unitOpen = expandedUnits.has(unit.id);
            return <View key={unit.id} style={styles.unitSection}>
              <Pressable onPress={() => toggleSet(setExpandedUnits, unit.id)} style={styles.unitHeader}>
                <View style={styles.orderBadge}><Text style={styles.orderText}>{unitIndex + 1}</Text></View>
                <View style={styles.rowCopy}><Text style={styles.unitTitle}>{unit.title}</Text><Text style={styles.rowMeta}>{unit.lessons.length} lesson · {unit.code}</Text></View>
                {editable ? <View style={styles.rowTools}>
                  <IconButton compact icon="arrow-up" label="Đưa unit lên" disabled={unitIndex === 0} onPress={() => { const ids = move(tree.units, unit.id, -1); if (ids) void execute(() => adminCurriculumService.reorderUnits(tree.id, ids)); }} />
                  <IconButton compact icon="arrow-down" label="Đưa unit xuống" disabled={unitIndex === tree.units.length - 1} onPress={() => { const ids = move(tree.units, unit.id, 1); if (ids) void execute(() => adminCurriculumService.reorderUnits(tree.id, ids)); }} />
                  <IconButton compact icon="pencil" label="Sửa unit" onPress={() => setEditor({ kind: 'unit', unit })} />
                  <IconButton compact danger icon="trash-can-outline" label="Xóa unit" onPress={() => remove('unit', () => adminCurriculumService.deleteUnit(unit.id))} />
                </View> : null}
                <MaterialCommunityIcons name={unitOpen ? 'chevron-up' : 'chevron-down'} size={25} color={Theme.colors.muted} />
              </Pressable>
              {unitOpen ? <View style={styles.unitBody}>
                <View style={styles.unitDescriptionRow}><Text style={styles.unitDescription}>{unit.description || 'Chưa có mô tả.'}</Text>{editable ? <CommandButton small icon="plus" label="Thêm lesson" onPress={() => setEditor({ kind: 'lesson', unitId: unit.id })} /> : null}</View>
                {unit.lessons.map((lesson, lessonIndex) => {
                  const lessonOpen = expandedLessons.has(lesson.id);
                  return <View key={lesson.id} style={styles.lessonSection}>
                    <Pressable onPress={() => toggleSet(setExpandedLessons, lesson.id)} style={styles.lessonRow}>
                      <View style={styles.lessonOrder}><Text style={styles.lessonOrderText}>{lessonIndex + 1}</Text></View>
                      <MaterialCommunityIcons name="book-open-page-variant" size={21} color={Theme.colors.blueDark} />
                      <View style={styles.rowCopy}><Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.rowMeta}>{lesson.activities.length} hoạt động · {lesson.estimatedMinutes} phút · {lesson.xpReward} XP</Text></View>
                      {editable ? <View style={styles.rowTools}>
                        <IconButton compact icon="arrow-up" label="Đưa lesson lên" disabled={lessonIndex === 0} onPress={() => { const ids = move(unit.lessons, lesson.id, -1); if (ids) void execute(() => adminCurriculumService.reorderLessons(unit.id, ids)); }} />
                        <IconButton compact icon="arrow-down" label="Đưa lesson xuống" disabled={lessonIndex === unit.lessons.length - 1} onPress={() => { const ids = move(unit.lessons, lesson.id, 1); if (ids) void execute(() => adminCurriculumService.reorderLessons(unit.id, ids)); }} />
                        <IconButton compact icon="pencil" label="Sửa lesson" onPress={() => setEditor({ kind: 'lesson', unitId: unit.id, lesson })} />
                        <IconButton compact danger icon="trash-can-outline" label="Xóa lesson" onPress={() => remove('lesson', () => adminCurriculumService.deleteLesson(lesson.id))} />
                      </View> : null}
                      <MaterialCommunityIcons name={lessonOpen ? 'chevron-up' : 'chevron-down'} size={23} color={Theme.colors.muted} />
                    </Pressable>
                    {lessonOpen ? <View style={styles.activityArea}>
                      <View style={styles.activityAreaHeader}><Text style={styles.objective}>{lesson.objective}</Text>{editable ? <CommandButton small icon="plus" label="Thêm hoạt động" onPress={() => setEditor({ kind: 'activity', lessonId: lesson.id })} /> : null}</View>
                      {lesson.activities.map((activity, activityIndex) => <View key={activity.id} style={styles.activityRow}>
                        <View style={styles.activityIcon}><MaterialCommunityIcons name={activityTypes.find((item) => item.value === activity.type)?.icon as never ?? 'cards'} size={19} color={Theme.colors.violet} /></View>
                        <View style={styles.rowCopy}><Text style={styles.activityTitle}>{activityIndex + 1}. {activity.prompt}</Text><Text style={styles.rowMeta}>{activityTypes.find((item) => item.value === activity.type)?.label} · {activity.stage} · {activity.xpReward} XP</Text></View>
                        <IconButton compact icon="eye-outline" label="Xem hoạt động" onPress={() => setEditor({ kind: 'preview', activity })} />
                        {editable ? <View style={styles.rowTools}>
                          <IconButton compact icon="arrow-up" label="Đưa hoạt động lên" disabled={activityIndex === 0} onPress={() => { const ids = move(lesson.activities, activity.id, -1); if (ids) void execute(() => adminCurriculumService.reorderActivities(lesson.id, ids)); }} />
                          <IconButton compact icon="arrow-down" label="Đưa hoạt động xuống" disabled={activityIndex === lesson.activities.length - 1} onPress={() => { const ids = move(lesson.activities, activity.id, 1); if (ids) void execute(() => adminCurriculumService.reorderActivities(lesson.id, ids)); }} />
                          <IconButton compact icon="pencil" label="Sửa hoạt động" onPress={() => setEditor({ kind: 'activity', lessonId: lesson.id, activity })} />
                          <IconButton compact danger icon="trash-can-outline" label="Xóa hoạt động" onPress={() => remove('hoạt động', () => adminCurriculumService.deleteActivity(activity.id))} />
                        </View> : null}
                      </View>)}
                    </View> : null}
                  </View>;
                })}
              </View> : null}
            </View>;
          })}</View>
        </> : <View style={styles.empty}><MaterialCommunityIcons name="book-plus-outline" size={48} color={Theme.colors.muted} /><Text style={styles.emptyTitle}>Chưa có curriculum</Text></View>}
      </>}
    </ScrollView>

    {editor?.kind === 'version' && tree ? <VersionEditor initial={tree} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => adminCurriculumService.updateVersion(tree.id, body))} /> : null}
    {editor?.kind === 'unit' && tree ? <UnitEditor initial={editor.unit} fallbackMedia={tree.units[0]?.coverImage} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => editor.unit ? adminCurriculumService.updateUnit(editor.unit.id, body) : adminCurriculumService.createUnit(tree.id, body))} /> : null}
    {editor?.kind === 'lesson' ? <LessonEditor initial={editor.lesson} fallbackMedia={tree?.units.find((unit) => unit.id === editor.unitId)?.coverImage} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => editor.lesson ? adminCurriculumService.updateLesson(editor.lesson.id, body) : adminCurriculumService.createLesson(editor.unitId, body))} /> : null}
    {editor?.kind === 'activity' ? <ActivityEditor initial={editor.activity} busy={busy} onClose={() => setEditor(undefined)} onSave={(body) => execute(() => editor.activity ? adminCurriculumService.updateActivity(editor.activity.id, body) : adminCurriculumService.createActivity(editor.lessonId, body))} /> : null}
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
  return <EditorModal title={initial ? 'Sửa lesson' : 'Thêm lesson'} onClose={onClose}><Field label="Mã lesson" placeholder="VD: STARTERS_U06_L01" error={contentCodeError(code)} value={code} onChangeText={setCode} autoCapitalize="characters" /><Field label="Tên lesson" placeholder="VD: Animals in the park" value={title} onChangeText={setTitle} /><Field label="Mục tiêu" placeholder="Trẻ nhận biết và sử dụng được..." value={objective} onChangeText={setObjective} multiline /><View style={styles.twoColumns}><View style={styles.fieldColumn}><Field label="Thời lượng (phút)" placeholder="VD: 12" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" /></View><View style={styles.fieldColumn}><Field label="XP hoàn thành" placeholder="VD: 20" value={xp} onChangeText={setXp} keyboardType="number-pad" /></View></View><AdminImageField value={media} onChange={setMedia} /><ActionButton label={initial ? 'Lưu lesson' : 'Tạo lesson'} icon="content-save" disabled={busy || !valid} onPress={() => onSave({ code: code.trim(), title: title.trim(), objective: objective.trim(), estimatedMinutes: Number(minutes), xpReward: Number(xp), coverImage: media })} /></EditorModal>;
}

function ActivityEditor({ initial, busy, onClose, onSave }: { initial?: AdminActivity; busy: boolean; onClose: () => void; onSave: (body: ActivityRequest) => void }) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [type, setType] = useState<BackendActivityType>(initial?.type ?? 'INTRO');
  const [stage, setStage] = useState<ActivityStage>(initial?.stage ?? 'LEARN');
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [instruction, setInstruction] = useState(initial?.instruction ?? '');
  const [xp, setXp] = useState(initial ? String(initial.xpReward) : '');
  const initialStructured = useMemo(() => activityToStructured(initial), [initial]);
  const [mainText, setMainText] = useState(initialStructured.main);
  const [answerText, setAnswerText] = useState(initialStructured.answer);

  const chooseType = (nextType: BackendActivityType) => {
    setType(nextType);
    if (!initial || nextType !== initial.type) {
      setMainText('');
      setAnswerText('');
    }
  };
  const helper = activityHelper(type);
  return <EditorModal title={initial ? 'Sửa hoạt động' : 'Thêm hoạt động'} onClose={onClose} wide>
    <Field label="Mã hoạt động" placeholder="VD: STARTERS_U06_L01_A01" error={contentCodeError(code)} value={code} onChangeText={setCode} autoCapitalize="characters" />
    <Text style={styles.fieldLabel}>Loại hoạt động</Text>
    <View style={styles.typeGrid}>{activityTypes.map((item) => <Pressable key={item.value} onPress={() => chooseType(item.value)} style={[styles.typeOption, type === item.value && styles.typeOptionActive]}><MaterialCommunityIcons name={item.icon as never} size={20} color={type === item.value ? Theme.colors.violet : Theme.colors.muted} /><Text style={[styles.typeLabel, type === item.value && styles.typeLabelActive]}>{item.label}</Text></Pressable>)}</View>
    <Text style={styles.fieldLabel}>Giai đoạn</Text>
    <View style={styles.segmented}>{(['LEARN', 'PRACTISE', 'CHECK'] as ActivityStage[]).map((value) => <Pressable key={value} onPress={() => setStage(value)} style={[styles.segment, stage === value && styles.segmentActive]}><Text style={[styles.segmentText, stage === value && styles.segmentTextActive]}>{value === 'LEARN' ? 'Học' : value === 'PRACTISE' ? 'Luyện tập' : 'Kiểm tra'}</Text></Pressable>)}</View>
    <Field label="Câu hỏi hoặc nội dung" placeholder="Nhập nội dung trẻ sẽ nhìn thấy" value={prompt} onChangeText={setPrompt} multiline />
    <Field label="Hướng dẫn" placeholder="VD: Nghe và chọn đáp án đúng" value={instruction} onChangeText={setInstruction} multiline />
    <Field label={helper.mainLabel} hint={helper.mainHint} placeholder={helper.mainHint} value={mainText} onChangeText={setMainText} multiline />
    <Field label={helper.answerLabel} hint={helper.answerHint} placeholder={helper.answerHint} value={answerText} onChangeText={setAnswerText} multiline />
    <Field label="XP" placeholder="VD: 2" value={xp} onChangeText={setXp} keyboardType="number-pad" />
    <ActionButton label={initial ? 'Lưu hoạt động' : 'Tạo hoạt động'} icon="content-save" disabled={busy || !isContentCode(code) || !prompt.trim() || !mainText.trim() || !answerText.trim() || !isNonNegativeNumber(xp)} onPress={() => {
      try {
        const structured = structuredToActivity(type, mainText, answerText, initial?.content);
        onSave({ code: code.trim(), type, stage, prompt: prompt.trim(), instruction: instruction.trim(), xpReward: Number(xp), ...structured });
      } catch (reason) {
        Alert.alert('Dữ liệu chưa hợp lệ', messageOf(reason));
      }
    }} />
  </EditorModal>;
}

function ActivityPreview({ activity, onClose }: { activity: AdminActivity; onClose: () => void }) {
  return <EditorModal title="Xem thử hoạt động" onClose={onClose} wide>
    <View style={styles.previewFrame}>
      <Text style={styles.previewPrompt}>{activity.prompt}</Text>
      {activity.instruction ? <Text style={styles.previewInstruction}>{activity.instruction}</Text> : null}
      <BackendActivityRenderer key={activity.id} activity={{ id: activity.id, code: activity.code, type: activity.type, stage: activity.stage, order: activity.order, prompt: activity.prompt, instruction: activity.instruction, xpReward: activity.xpReward, content: activity.content }} onSubmit={() => undefined} />
    </View>
  </EditorModal>;
}

function ConfirmationDialog({ dialog, onClose }: { dialog: DialogState; onClose: () => void }) {
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={styles.confirmSafe} edges={['top', 'bottom', 'left', 'right']}>
      <Pressable style={styles.confirmBackdrop} onPress={onClose}>
        <Pressable style={styles.confirmPanel} onPress={(event) => event.stopPropagation()}>
          <View style={[styles.confirmIcon, dialog.danger && styles.confirmIconDanger]}>
            <MaterialCommunityIcons name={dialog.danger ? 'trash-can-outline' : 'information-outline'} size={27} color={dialog.danger ? Theme.colors.coralDark : Theme.colors.blueDark} />
          </View>
          <Text style={styles.confirmTitle}>{dialog.title}</Text>
          <Text style={styles.confirmMessage}>{dialog.message}</Text>
          <View style={styles.confirmActions}>
            {dialog.onConfirm ? <ActionButton label="Hủy" outline onPress={onClose} /> : null}
            <ActionButton
              label={dialog.confirmLabel ?? 'Đã hiểu'}
              color={dialog.danger ? Theme.colors.coral : Theme.colors.green}
              onPress={dialog.onConfirm ?? onClose}
            />
          </View>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  </Modal>;
}

function VersionDeleteEditor({ check, busy, onClose, onDelete }: { check: VersionDeleteCheck; busy: boolean; onClose: () => void; onDelete: () => void }) {
  const [confirmation, setConfirmation] = useState('');
  const matches = confirmation.trim() === check.versionCode;
  return <EditorModal title={check.status === 'DRAFT' ? 'Hủy bản nháp' : 'Xóa bản lưu trữ'} onClose={onClose}>
    <View style={styles.deleteWarning}>
      <MaterialCommunityIcons name="alert-outline" size={24} color={Theme.colors.coralDark} />
      <View style={styles.rowCopy}>
        <Text style={styles.deleteWarningTitle}>Dữ liệu sẽ bị xóa vĩnh viễn</Text>
        <Text style={styles.deleteWarningText}>{check.message}</Text>
      </View>
    </View>
    <Field label={`Nhập chính xác “${check.versionCode}” để xác nhận`} placeholder={check.versionCode} value={confirmation} onChangeText={setConfirmation} />
    <ActionButton label={check.status === 'DRAFT' ? 'Xóa bản nháp' : 'Xóa bản lưu trữ'} icon="trash-can-outline" disabled={busy || !matches} onPress={onDelete} />
  </EditorModal>;
}

function EditorModal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return <Modal transparent animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalPanel, wide && styles.modalWide]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable accessibilityLabel="Đóng" onPress={onClose} style={styles.iconTouch}>
              <MaterialCommunityIcons name="close" size={25} color={Theme.colors.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </SafeAreaView>
  </Modal>;
}

function Field({ label, hint, error, multiline, ...props }: { label: string; hint?: string; error?: string; multiline?: boolean; placeholder?: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'number-pad'; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text>{hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}<TextInput {...props} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, error && styles.inputError, multiline && styles.multiline]} placeholderTextColor="#8A98A1" />{error ? <Text style={styles.fieldError}>{error}</Text> : null}</View>;
}

function ValidationPanel({ report, onClose }: { report: ValidationReport; onClose: () => void }) {
  return <View style={[styles.validation, report.valid ? styles.validationSuccess : styles.validationError]}><View style={styles.validationHeader}><MaterialCommunityIcons name={report.valid ? 'check-decagram' : 'alert-decagram'} size={24} color={report.valid ? Theme.colors.greenDark : Theme.colors.coralDark} /><Text style={styles.validationTitle}>{report.valid ? 'Bản nháp hợp lệ' : `${report.issues.length} lỗi cần sửa`}</Text><Pressable accessibilityLabel="Đóng kết quả" onPress={onClose} style={styles.iconTouch}><MaterialCommunityIcons name="close" size={20} color={Theme.colors.muted} /></Pressable></View>{report.issues.slice(0, 12).map((issue, index) => <View key={`${issue.path}-${index}`} style={styles.issueRow}><Text style={styles.issuePath}>{issue.path}</Text><Text style={styles.issueMessage}>{issue.message}</Text></View>)}</View>;
}

function StatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }) {
  const label = status === 'DRAFT' ? 'BẢN NHÁP' : status === 'PUBLISHED' ? 'ĐÃ XUẤT BẢN' : 'LƯU TRỮ';
  return <View style={[styles.statusBadge, status === 'DRAFT' ? styles.statusDraft : status === 'PUBLISHED' ? styles.statusPublished : styles.statusArchived]}><Text style={[styles.statusText, status === 'DRAFT' ? styles.statusDraftText : status === 'PUBLISHED' ? styles.statusPublishedText : styles.statusArchivedText]}>{label}</Text></View>;
}

function CommandButton({ icon, label, onPress, disabled, primary, danger, small }: { icon: string; label: string; onPress: () => void; disabled?: boolean; primary?: boolean; danger?: boolean; small?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.command, small && styles.commandSmall, primary && styles.commandPrimary, danger && styles.commandDanger, disabled && styles.disabled]}><MaterialCommunityIcons name={icon as never} size={small ? 17 : 19} color={primary ? '#FFFFFF' : danger ? Theme.colors.coralDark : Theme.colors.ink} /><Text style={[styles.commandText, primary && styles.commandTextPrimary, danger && styles.commandTextDanger]}>{label}</Text></Pressable>;
}

function IconButton({ icon, label, onPress, disabled, danger, compact }: { icon: string; label: string; onPress: () => void; disabled?: boolean; danger?: boolean; compact?: boolean }) {
  return <Pressable accessibilityLabel={label} disabled={disabled} onPress={(event) => { event.stopPropagation(); onPress(); }} style={[styles.iconButton, compact && styles.iconButtonCompact, disabled && styles.disabled]}><MaterialCommunityIcons name={icon as never} size={compact ? 18 : 21} color={danger ? Theme.colors.coralDark : Theme.colors.muted} /></Pressable>;
}

function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) {
  setter((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
}

function defaultMedia(): BackendMedia {
  return { path: '', width: 0, height: 0, alt: '' };
}

function activityToStructured(activity?: AdminActivity, typeOverride?: BackendActivityType) {
  const type = activity?.type ?? typeOverride ?? 'INTRO';
  if (!activity) return { main: '', answer: '' };
  const content = activity?.content ?? {};
  const answer = activity?.answer ?? {};
  if (type === 'INTRO') return { main: arrayObjects(content.items).map((item) => [stringOf(item.word), stringOf(item.meaning), stringOf(item.example)].filter(Boolean).join(' | ')).join('\n') || 'hello | xin chào | Hello!', answer: 'Hoàn thành' };
  if (type === 'FLASHCARD') return { main: `${stringOf(content.term)} | ${stringOf(content.meaning)}`.trim() || 'hello | xin chào', answer: 'Hoàn thành' };
  if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') return { main: arrayObjects(content.options).map((item) => `${stringOf(item.id)} | ${stringOf(item.label)}`).join('\n') || 'a | Đáp án A\nb | Đáp án B\nc | Đáp án C', answer: stringOf(answer.value) || 'a' };
  if (type === 'TRUE_FALSE') return { main: stringOf(content.statement) || 'Nội dung cần xác định đúng hoặc sai', answer: stringOf(answer.value) || 'true' };
  if (type === 'MATCH_PAIRS') {
    const pairs = recordOf(answer.pairs);
    return { main: Object.entries(pairs).map(([left, right]) => `${left} | ${stringOf(right)}`).join('\n') || 'hello | xin chào\ngoodbye | tạm biệt\nname | tên', answer: 'Ghép đúng tất cả các cặp' };
  }
  if (type === 'WORD_ORDER') return { main: arrayStrings(answer.order).join(' ') || 'My name is Ben.', answer: arrayStrings(answer.order).join(' ') || 'My name is Ben.' };
  if (type === 'TYPE_ANSWER') return { main: stringOf(content.placeholder) || 'Nhập câu trả lời', answer: arrayStrings(answer.accepted).join('\n') || 'My name is Ben.\nMy name is Ben' };
  if (type === 'SPEAK') return { main: stringOf(content.modelText) || 'Hello, my name is Ben.', answer: 'Hoàn thành' };
  return { main: '', answer: '' };
}

function structuredToActivity(type: BackendActivityType, main: string, answerText: string, previous?: Record<string, unknown>): Pick<ActivityRequest, 'content' | 'answer'> {
  const base = { ...(previous ?? {}) };
  if (type === 'INTRO') {
    const items = parsePipeLines(main, 2).map(([word, meaning, example]) => ({ word, meaning, ...(example ? { example } : {}) }));
    return { content: { ...base, items }, answer: { mode: 'completion' } };
  }
  if (type === 'FLASHCARD') {
    const [term, meaning] = parsePipeLines(main, 2)[0];
    return { content: { ...base, term, meaning, speechText: term }, answer: { mode: 'completion' } };
  }
  if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') {
    const options = parsePipeLines(main, 2).map(([id, label]) => ({ id, label }));
    const content = { ...base, options, ...(type === 'LISTEN_CHOICE' ? { speechText: options.find((item) => item.id === answerText.trim())?.label ?? answerText.trim() } : {}) };
    return { content, answer: { value: answerText.trim() } };
  }
  if (type === 'TRUE_FALSE') return { content: { ...base, statement: main.trim() }, answer: { value: answerText.trim().toLowerCase() } };
  if (type === 'MATCH_PAIRS') {
    const lines = parsePipeLines(main, 2);
    return { content: { ...base, left: lines.map(([left]) => left), right: lines.map(([, right]) => right).reverse(), leftLabel: 'Tiếng Anh', rightLabel: 'Nghĩa tiếng Việt' }, answer: { pairs: Object.fromEntries(lines.map(([left, right]) => [left, right])) } };
  }
  if (type === 'WORD_ORDER') {
    const order = answerText.trim().split(/\s+/);
    return { content: { ...base, tokens: [...order.slice(Math.ceil(order.length / 2)), ...order.slice(0, Math.ceil(order.length / 2))] }, answer: { order } };
  }
  if (type === 'TYPE_ANSWER') return { content: { ...base, placeholder: main.trim(), maxLength: 120 }, answer: { accepted: answerText.split('\n').map((line) => line.trim()).filter(Boolean) } };
  if (type === 'SPEAK') return { content: { ...base, modelText: main.trim() }, answer: { mode: 'completion' } };
  throw new Error('Loại hoạt động chưa được hỗ trợ.');
}

function activityHelper(type: BackendActivityType) {
  if (type === 'INTRO') return { mainLabel: 'Danh sách từ vựng', mainHint: 'Mỗi dòng: từ tiếng Anh | nghĩa tiếng Việt | câu ví dụ', answerLabel: 'Cách hoàn thành', answerHint: 'Hoạt động hoàn thành sau khi trẻ xem hết từ.' };
  if (type === 'FLASHCARD') return { mainLabel: 'Nội dung thẻ', mainHint: 'Từ tiếng Anh | nghĩa tiếng Việt', answerLabel: 'Cách hoàn thành', answerHint: 'Hoạt động hoàn thành sau khi trẻ xem thẻ.' };
  if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') return { mainLabel: 'Các lựa chọn', mainHint: 'Mỗi dòng: mã đáp án | nội dung hiển thị', answerLabel: 'Mã đáp án đúng', answerHint: 'Nhập đúng mã ở cột đầu.' };
  if (type === 'TRUE_FALSE') return { mainLabel: 'Nội dung nhận định', mainHint: 'Một câu để trẻ xác định đúng hoặc sai.', answerLabel: 'Đáp án', answerHint: 'Nhập true hoặc false.' };
  if (type === 'MATCH_PAIRS') return { mainLabel: 'Các cặp', mainHint: 'Mỗi dòng: tiếng Anh | nghĩa tiếng Việt', answerLabel: 'Cách hoàn thành', answerHint: 'Trẻ phải ghép đúng tất cả các cặp.' };
  if (type === 'WORD_ORDER') return { mainLabel: 'Câu mẫu', mainHint: 'Nhập câu hoàn chỉnh.', answerLabel: 'Câu đúng', answerHint: 'Nhập câu hoàn chỉnh theo đúng thứ tự.' };
  if (type === 'TYPE_ANSWER') return { mainLabel: 'Gợi ý trong ô nhập', mainHint: 'Ví dụ: My name ...', answerLabel: 'Các đáp án được chấp nhận', answerHint: 'Mỗi dòng là một đáp án.' };
  return { mainLabel: 'Câu mẫu để nói', mainHint: 'Trẻ sẽ nghe và nói theo câu này.', answerLabel: 'Cách hoàn thành', answerHint: 'Hoạt động hoàn thành sau khi trẻ thu âm.' };
}

function isVersionCode(value: string): boolean {
  const code = value.trim();
  return /^[A-Z0-9][A-Z0-9._-]{2,79}$/.test(code) && !code.startsWith('NEW_') && !code.includes('DRAFT');
}

function versionCodeError(value: string): string | undefined {
  const code = value.trim();
  if (!code) return 'Mã phiên bản là bắt buộc.';
  if (code.includes('DRAFT')) return 'Đây là mã tạm của bản nháp. Hãy đổi thành mã phát hành, ví dụ STARTERS_2026.6.';
  if (code.startsWith('NEW_')) return 'Không được dùng mã bắt đầu bằng NEW_.';
  if (!isVersionCode(code)) return 'Chỉ dùng chữ in hoa, số, dấu chấm, gạch ngang hoặc gạch dưới.';
  return undefined;
}

function isContentCode(value: string): boolean {
  const code = value.trim();
  return /^[A-Z0-9][A-Z0-9_-]{2,99}$/.test(code) && !code.startsWith('NEW_');
}

function contentCodeError(value: string): string | undefined {
  const code = value.trim();
  if (!code) return 'Mã là bắt buộc.';
  if (code.startsWith('NEW_')) return 'Mã NEW_* là dữ liệu mẫu cũ. Hãy đổi sang mã thật trước khi lưu.';
  if (!isContentCode(code)) return 'Chỉ dùng chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.';
  return undefined;
}

function isPositiveNumber(value: string): boolean {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number > 0;
}

function isNonNegativeNumber(value: string): boolean {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number >= 0;
}

function isValidMedia(media: BackendMedia): boolean {
  return Boolean(media.path.trim() && media.alt.trim() && media.width > 0 && media.height > 0);
}

function parsePipeLines(value: string, minimumParts: number): string[][] {
  const lines = value.split('\n').map((line) => line.split('|').map((part) => part.trim())).filter((parts) => parts.some(Boolean));
  if (!lines.length || lines.some((parts) => parts.length < minimumParts || parts.slice(0, minimumParts).some((part) => !part))) throw new Error('Hãy nhập đúng định dạng từng dòng.');
  return lines;
}

function arrayObjects(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}
function arrayStrings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
function recordOf(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function stringOf(value: unknown): string { return typeof value === 'string' ? value : ''; }
function messageOf(reason: unknown): string { return reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.'; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 18, paddingBottom: 54 },
  heading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 },
  headingCopy: { flex: 1, minWidth: 240 },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 28, fontWeight: '900', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, marginTop: 4 },
  headingActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelTabs: { flexDirection: 'row', gap: 8, marginTop: 20 },
  levelTab: { flex: 1, minWidth: 0, minHeight: 76, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', padding: 10, justifyContent: 'center' },
  levelDot: { width: 20, height: 5, borderRadius: 3, marginBottom: 6 },
  levelName: { color: Theme.colors.ink, fontSize: 14, fontWeight: '900' },
  levelMeta: { color: Theme.colors.muted, fontSize: 10, marginTop: 3 },
  errorBand: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', padding: 11 },
  errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700' },
  loading: { minHeight: 360, alignItems: 'center', justifyContent: 'center' },
  versionBar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  versionList: { gap: 8, flexGrow: 1, minWidth: 220 },
  versionChip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', paddingHorizontal: 10 },
  versionChipActive: { borderColor: Theme.colors.blue, backgroundColor: '#EEF8FE' },
  versionCode: { color: Theme.colors.ink, fontSize: 11, fontWeight: '900' },
  versionHeader: { minHeight: 86, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Theme.colors.border, paddingVertical: 12 },
  versionCopy: { flex: 1 },
  versionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  versionTitle: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900' },
  versionDescription: { color: Theme.colors.muted, lineHeight: 19, marginTop: 4 },
  versionActions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
  sectionHeading: { minHeight: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: Theme.colors.muted, fontSize: 11, marginTop: 2 },
  tree: { gap: 10 },
  unitSection: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  unitHeader: { minHeight: 76, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: 11, backgroundColor: '#F8FBFC' },
  orderBadge: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7F8EA' },
  orderText: { color: Theme.colors.greenDark, fontSize: 17, fontWeight: '900' },
  rowCopy: { flex: 1, minWidth: 0 },
  unitTitle: { color: Theme.colors.ink, fontSize: 17, fontWeight: '900' },
  rowMeta: { color: Theme.colors.muted, fontSize: 10, marginTop: 3 },
  rowTools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', maxWidth: 144 },
  unitBody: { borderTopWidth: 1, borderTopColor: Theme.colors.border },
  unitDescriptionRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13 },
  unitDescription: { flex: 1, color: Theme.colors.muted, lineHeight: 18 },
  lessonSection: { borderTopWidth: 1, borderTopColor: Theme.colors.border },
  lessonRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 9, padding: 10 },
  lessonOrder: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF7FE' },
  lessonOrderText: { color: Theme.colors.blueDark, fontWeight: '900', fontSize: 11 },
  lessonTitle: { color: Theme.colors.ink, fontWeight: '900' },
  activityArea: { backgroundColor: '#F8FAFB', paddingBottom: 8 },
  activityAreaHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  objective: { flex: 1, color: Theme.colors.muted, fontSize: 12, lineHeight: 17 },
  activityRow: { minHeight: 62, marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingVertical: 7 },
  activityIcon: { width: 34, height: 34, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0EDFF' },
  activityTitle: { color: Theme.colors.ink, fontWeight: '800', fontSize: 12 },
  command: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderBottomWidth: 3, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', paddingHorizontal: 12 },
  commandSmall: { minHeight: 38, borderBottomWidth: 2, paddingHorizontal: 9 },
  commandPrimary: { borderColor: Theme.colors.greenDark, backgroundColor: Theme.colors.green },
  commandDanger: { borderColor: '#F1B8B4', backgroundColor: '#FFF4F3' },
  commandText: { color: Theme.colors.ink, fontSize: 12, fontWeight: '900' },
  commandTextPrimary: { color: '#FFFFFF' },
  commandTextDanger: { color: Theme.colors.coralDark },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  iconButtonCompact: { width: 34, height: 34 },
  iconTouch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.32 },
  statusBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  statusDraft: { backgroundColor: '#FFF5CE' },
  statusPublished: { backgroundColor: '#E6F8E9' },
  statusArchived: { backgroundColor: '#EDF2F5' },
  statusText: { fontSize: 8, fontWeight: '900' },
  statusDraftText: { color: Theme.colors.yellowDark },
  statusPublishedText: { color: Theme.colors.greenDark },
  statusArchivedText: { color: Theme.colors.muted },
  validation: { marginTop: 12, borderWidth: 1, borderRadius: 8, padding: 12 },
  validationSuccess: { borderColor: '#BFE8C5', backgroundColor: '#F0FBF2' },
  validationError: { borderColor: '#FFD0CD', backgroundColor: '#FFF5F4' },
  validationHeader: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8 },
  validationTitle: { flex: 1, color: Theme.colors.ink, fontWeight: '900' },
  issueRow: { borderTopWidth: 1, borderTopColor: 'rgba(113,128,140,0.18)', paddingVertical: 7 },
  issuePath: { color: Theme.colors.coralDark, fontSize: 10, fontWeight: '900' },
  issueMessage: { color: Theme.colors.ink, fontSize: 12, marginTop: 2 },
  empty: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 10 },
  modalSafe: { flex: 1, backgroundColor: 'rgba(25,39,47,0.55)' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  modalPanel: { width: '100%', maxWidth: 680, maxHeight: '92%', borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  modalWide: { maxWidth: 850 },
  modalHeader: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 16 },
  modalTitle: { flex: 1, color: Theme.colors.ink, fontSize: 19, fontWeight: '900' },
  modalContent: { padding: 16, paddingBottom: 28, gap: 14 },
  confirmSafe: { flex: 1, backgroundColor: 'rgba(25,39,47,0.55)' },
  confirmBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  confirmPanel: { width: '100%', maxWidth: 440, borderRadius: 8, backgroundColor: '#FFFFFF', padding: 20, alignItems: 'center' },
  confirmIcon: { width: 52, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF7FE' },
  confirmIconDanger: { backgroundColor: '#FFF0EF' },
  confirmTitle: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 13 },
  confirmMessage: { color: Theme.colors.muted, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  confirmActions: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 9, marginTop: 18 },
  field: { gap: 5 },
  fieldLabel: { color: Theme.colors.ink, fontSize: 12, fontWeight: '900' },
  fieldHint: { color: Theme.colors.muted, fontSize: 10, lineHeight: 15 },
  fieldError: { color: Theme.colors.coralDark, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', paddingHorizontal: 12, color: Theme.colors.ink, fontSize: 15 },
  inputError: { borderColor: Theme.colors.coralDark, backgroundColor: '#FFF9F8' },
  multiline: { minHeight: 92, paddingTop: 12 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  fieldColumn: { flex: 1 },
  mediaFields: { gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 13 },
  groupTitle: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 13 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  typeOption: { width: '31%', minWidth: 105, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', padding: 7 },
  typeOptionActive: { borderColor: Theme.colors.violet, backgroundColor: '#F2EFFF' },
  typeLabel: { color: Theme.colors.muted, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  typeLabelActive: { color: Theme.colors.violet, fontWeight: '900' },
  segmented: { minHeight: 44, flexDirection: 'row', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, overflow: 'hidden' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  segmentActive: { backgroundColor: '#EAF7FE' },
  segmentText: { color: Theme.colors.muted, fontSize: 11, fontWeight: '800' },
  segmentTextActive: { color: Theme.colors.blueDark, fontWeight: '900' },
  previewFrame: { gap: 12, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: Theme.colors.background, padding: 15 },
  previewPrompt: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  previewInstruction: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 19 },
  deleteWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF4F3', padding: 12 },
  deleteWarningTitle: { color: Theme.colors.coralDark, fontWeight: '900' },
  deleteWarningText: { color: Theme.colors.ink, lineHeight: 19, marginTop: 3 },
});
