import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { BackendActivityType } from '@/types/backendCurriculum';
import { ValidationReport, VersionDeleteCheck } from '@/types/adminCurriculum';
import { styles } from './AdminShared.styles';

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

export function StatusBadge({ status }: { status: 'DRAFT' | 'PENDING' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED' }) {
  const label = status === 'DRAFT' ? 'BẢN NHÁP' : status === 'PUBLISHED' ? 'ĐÃ XUẤT BẢN' : status === 'PENDING' ? 'CHỜ DUYỆT' : status === 'REJECTED' ? 'BỊ TỪ CHỐI' : 'LƯU TRỮ';
  const bgStyle = status === 'DRAFT' ? styles.statusDraft : status === 'PUBLISHED' ? styles.statusPublished : status === 'PENDING' ? { backgroundColor: `${Theme.colors.blueDark}1A`, borderColor: Theme.colors.blueDark } : status === 'REJECTED' ? { backgroundColor: `${Theme.colors.coralDark}1A`, borderColor: Theme.colors.coralDark } : styles.statusArchived;
  const textStyle = status === 'DRAFT' ? styles.statusDraftText : status === 'PUBLISHED' ? styles.statusPublishedText : status === 'PENDING' ? { color: Theme.colors.blueDark } : status === 'REJECTED' ? { color: Theme.colors.coralDark } : styles.statusArchivedText;
  
  return <View style={[styles.statusBadge, bgStyle]}><Text style={[styles.statusText, textStyle]}>{label}</Text></View>;
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
