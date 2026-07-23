import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { BackendActivityType } from '@/types/backendCurriculum';
import { ValidationReport, VersionDeleteCheck } from '@/types/adminCurriculum';

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

export function ValidationPanel({ report, onClose }: { report: ValidationReport; onClose: () => void }) {
  return <View style={[styles.validation, report.valid ? styles.validationSuccess : styles.validationError]}><View style={styles.validationHeader}><MaterialCommunityIcons name={report.valid ? 'check-decagram' : 'alert-decagram'} size={24} color={report.valid ? Theme.colors.greenDark : Theme.colors.coralDark} /><Text style={styles.validationTitle}>{report.valid ? 'Bản nháp hợp lệ' : `${report.issues.length} lỗi cần sửa`}</Text><Pressable accessibilityLabel="Đóng kết quả" onPress={onClose} style={styles.iconTouch}><MaterialCommunityIcons name="close" size={20} color={Theme.colors.muted} /></Pressable></View>{report.issues.slice(0, 12).map((issue, index) => <View key={`${issue.path}-${index}`} style={styles.issueRow}><Text style={styles.issuePath}>{issue.path}</Text><Text style={styles.issueMessage}>{issue.message}</Text></View>)}</View>;
}

export function StatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }) {
  const label = status === 'DRAFT' ? 'BẢN NHÁP' : status === 'PUBLISHED' ? 'ĐÃ XUẤT BẢN' : 'LƯU TRỮ';
  return <View style={[styles.statusBadge, status === 'DRAFT' ? styles.statusDraft : status === 'PUBLISHED' ? styles.statusPublished : styles.statusArchived]}><Text style={[styles.statusText, status === 'DRAFT' ? styles.statusDraftText : status === 'PUBLISHED' ? styles.statusPublishedText : styles.statusArchivedText]}>{label}</Text></View>;
}

function CommandButton({ icon, label, onPress, disabled, primary, danger, small }: { icon: string; label: string; onPress: () => void; disabled?: boolean; primary?: boolean; danger?: boolean; small?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.command, small && styles.commandSmall, primary && styles.commandPrimary, danger && styles.commandDanger, disabled && styles.disabled]}><MaterialCommunityIcons name={icon as never} size={small ? 17 : 19} color={primary ? '#FFFFFF' : danger ? Theme.colors.coralDark : Theme.colors.ink} /><Text style={[styles.commandText, primary && styles.commandTextPrimary, danger && styles.commandTextDanger]}>{label}</Text></Pressable>;
}

function IconButton({ icon, label, onPress, disabled, danger, compact }: { icon: string; label: string; onPress: () => void; disabled?: boolean; danger?: boolean; compact?: boolean }) {
  return <Pressable accessibilityLabel={label} disabled={disabled} onPress={(event) => { event.stopPropagation(); onPress(); }} style={[styles.iconButton, compact && styles.iconButtonCompact, disabled && styles.disabled]}><MaterialCommunityIcons name={icon as never} size={compact ? 18 : 21} color={danger ? Theme.colors.coralDark : Theme.colors.muted} /></Pressable>;
}

export function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) {
  setter((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
}

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

export { EditorModal, Field, CommandButton, IconButton, styles as adminStyles };


export type DialogState = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
};

export const activityTypes: Array<{ value: BackendActivityType; label: string; icon: string }> = [
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



export function ConfirmationDialog({ dialog, onClose }: { dialog: DialogState; onClose: () => void }) {
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
            {dialog.onConfirm ? <CommandButton label="Hủy" icon="close" onPress={onClose} /> : null}
            <CommandButton
              label={dialog.confirmLabel ?? 'Đã hiểu'}
              danger={dialog.danger} primary={!dialog.danger} icon="check"
              onPress={dialog.onConfirm ?? onClose}
            />
          </View>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  </Modal>;
}

export function VersionDeleteEditor({ check, busy, onClose, onDelete }: { check: VersionDeleteCheck; busy: boolean; onClose: () => void; onDelete: () => void }) {
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
    <CommandButton label={check.status === 'DRAFT' ? 'Xóa bản nháp' : 'Xóa bản lưu trữ'} icon="trash-can-outline" disabled={busy || !matches} onPress={onDelete} />
  </EditorModal>;
}