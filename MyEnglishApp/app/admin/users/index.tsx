import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AccountStatus, AdminUserDetail, AdminUserPage, AdminUserSummary } from '@/types/adminOperations';

export default function AdminUsersScreen() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AccountStatus | undefined>();
  const [data, setData] = useState<AdminUserPage>();
  const [selected, setSelected] = useState<AdminUserDetail>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async (page = 0, nextStatus = status, search = query) => {
    setLoading(true);
    setError('');
    try { setData(await adminOperationsService.getUsers(search.trim(), nextStatus, page)); }
    catch (reason) { setError(messageOf(reason)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const chooseStatus = (next?: AccountStatus) => {
    setStatus(next);
    void load(0, next);
  };

  const openUser = async (user: AdminUserSummary) => {
    setBusy(true);
    try { setSelected(await adminOperationsService.getUser(user.id)); }
    catch (reason) { Alert.alert('Không tải được người học', messageOf(reason)); }
    finally { setBusy(false); }
  };

  const toggleStatus = () => {
    if (!selected) return;
    const next: AccountStatus = selected.user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    Alert.alert(next === 'LOCKED' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?', next === 'LOCKED' ? 'Người học sẽ không thể đăng nhập hoặc tiếp tục dùng JWT hiện tại.' : 'Người học có thể đăng nhập lại bình thường.', [
      { text: 'Hủy', style: 'cancel' },
      { text: next === 'LOCKED' ? 'Khóa' : 'Mở khóa', style: next === 'LOCKED' ? 'destructive' : 'default', onPress: () => void (async () => {
        setBusy(true);
        try {
          setSelected(await adminOperationsService.updateUserStatus(selected.user.id, next));
          await load(data?.page ?? 0);
        } catch (reason) { Alert.alert('Không cập nhật được', messageOf(reason)); }
        finally { setBusy(false); }
      })() },
    ]);
  };

  return <View style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.heading}><View><Text style={styles.eyebrow}>LEARNER DIRECTORY</Text><Text style={styles.title}>Người học</Text><Text style={styles.subtitle}>{data?.totalItems ?? 0} tài khoản learner, không hiển thị dữ liệu mật khẩu.</Text></View></View>
    <View style={styles.toolbar}><View style={styles.search}><MaterialCommunityIcons name="magnify" size={21} color={Theme.colors.muted} /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => void load(0)} placeholder="Tìm username hoặc email" placeholderTextColor="#8998A1" style={styles.searchInput} /><Pressable accessibilityLabel="Tìm kiếm" onPress={() => void load(0)} style={styles.searchButton}><MaterialCommunityIcons name="arrow-right" size={21} color="#FFFFFF" /></Pressable></View><View style={styles.filters}><Filter label="Tất cả" active={!status} onPress={() => chooseStatus()} /><Filter label="Đang hoạt động" active={status === 'ACTIVE'} onPress={() => chooseStatus('ACTIVE')} /><Filter label="Đã khóa" active={status === 'LOCKED'} onPress={() => chooseStatus('LOCKED')} /></View></View>
    {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : <View style={styles.list}>{data?.items.map((user) => <Pressable key={user.id} onPress={() => void openUser(user)} style={styles.userRow}><View style={styles.avatar}><Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text></View><View style={styles.userCopy}><Text style={styles.userName}>{user.username}</Text><Text style={styles.userEmail}>{user.email}</Text><Text style={styles.userMeta}>{user.completedLessons} lesson hoàn thành · Đăng nhập {formatDate(user.lastLoginAt)}</Text></View><StatusBadge status={user.status} /><MaterialCommunityIcons name="chevron-right" size={23} color={Theme.colors.muted} /></Pressable>)}</View>}
    {data && data.totalPages > 1 ? <View style={styles.pagination}><Pressable disabled={data.page === 0 || loading} onPress={() => void load(data.page - 1)} style={[styles.pageButton, data.page === 0 && styles.disabled]}><MaterialCommunityIcons name="chevron-left" size={22} color={Theme.colors.ink} /></Pressable><Text style={styles.pageText}>Trang {data.page + 1}/{data.totalPages}</Text><Pressable disabled={data.page + 1 >= data.totalPages || loading} onPress={() => void load(data.page + 1)} style={[styles.pageButton, data.page + 1 >= data.totalPages && styles.disabled]}><MaterialCommunityIcons name="chevron-right" size={22} color={Theme.colors.ink} /></Pressable></View> : null}
  </ScrollView>
  {selected ? <UserDetailModal detail={selected} busy={busy} onToggleStatus={toggleStatus} onClose={() => setSelected(undefined)} /> : null}
  {busy && !selected ? <View style={styles.busyOverlay}><ActivityIndicator size="large" color="#FFFFFF" /></View> : null}
  </View>;
}

function UserDetailModal({ detail, busy, onToggleStatus, onClose }: { detail: AdminUserDetail; busy: boolean; onToggleStatus: () => void; onClose: () => void }) {
  return <Modal transparent animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.modalSafe} edges={['top', 'bottom', 'left', 'right']}><View style={styles.modalBackdrop}><View style={styles.modalPanel}><View style={styles.modalHeader}><View style={styles.modalAvatar}><Text style={styles.avatarText}>{detail.user.username.slice(0, 1).toUpperCase()}</Text></View><View style={styles.modalTitleCopy}><Text style={styles.modalTitle}>{detail.user.username}</Text><Text style={styles.userEmail}>{detail.user.email}</Text></View><Pressable accessibilityLabel="Đóng" onPress={onClose} style={styles.iconButton}><MaterialCommunityIcons name="close" size={25} color={Theme.colors.ink} /></Pressable></View><ScrollView contentContainerStyle={styles.modalContent}>
    <View style={styles.detailStats}><MiniStat label="Lesson" value={detail.user.completedLessons} /><MiniStat label="Tổng sao" value={detail.totalStars} /><MiniStat label="XP" value={detail.user.totalScore} /></View>
    <View style={styles.detailLine}><Text style={styles.detailLabel}>Trạng thái</Text><StatusBadge status={detail.user.status} /></View><View style={styles.detailLine}><Text style={styles.detailLabel}>Ngày tạo</Text><Text style={styles.detailValue}>{formatDate(detail.user.createdAt)}</Text></View><View style={styles.detailLine}><Text style={styles.detailLabel}>Đăng nhập gần nhất</Text><Text style={styles.detailValue}>{formatDate(detail.user.lastLoginAt)}</Text></View>
    <Text style={styles.sectionTitle}>Tiến độ theo cấp độ</Text>{detail.levels.map((level) => { const percent = level.totalLessons ? Math.round(level.completedLessons / level.totalLessons * 100) : 0; return <View key={level.level} style={styles.progressRow}><View style={styles.progressCopy}><Text style={styles.progressTitle}>{level.title}</Text><Text style={styles.userMeta}>{level.completedLessons}/{level.totalLessons} lesson · {level.stars} sao</Text></View><Text style={styles.percent}>{percent}%</Text><View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View></View>; })}
    <Text style={styles.sectionTitle}>Session gần đây</Text>{detail.recentSessions.length ? detail.recentSessions.map((session) => <View key={session.id} style={styles.sessionRow}><View style={styles.sessionIcon}><MaterialCommunityIcons name={session.status === 'COMPLETED' ? 'check' : 'progress-clock'} size={19} color={session.status === 'COMPLETED' ? Theme.colors.greenDark : Theme.colors.blueDark} /></View><View style={styles.userCopy}><Text style={styles.sessionTitle}>{session.lessonTitle}</Text><Text style={styles.userMeta}>{session.correctAttempts}/{session.totalAttempts} đúng · {session.xpEarned} XP · {formatDate(session.startedAt)}</Text></View></View>) : <Text style={styles.emptyText}>Chưa có session học.</Text>}
    <Pressable disabled={busy} onPress={onToggleStatus} style={[styles.statusAction, detail.user.status === 'ACTIVE' ? styles.lockAction : styles.unlockAction, busy && styles.disabled]}><MaterialCommunityIcons name={detail.user.status === 'ACTIVE' ? 'lock-outline' : 'lock-open-outline'} size={20} color={detail.user.status === 'ACTIVE' ? Theme.colors.coralDark : Theme.colors.greenDark} /><Text style={[styles.statusActionText, { color: detail.user.status === 'ACTIVE' ? Theme.colors.coralDark : Theme.colors.greenDark }]}>{detail.user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</Text></Pressable>
  </ScrollView></View></View></SafeAreaView></Modal>;
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }
function StatusBadge({ status }: { status: AccountStatus }) { return <View style={[styles.statusBadge, status === 'ACTIVE' ? styles.activeBadge : styles.lockedBadge]}><Text style={[styles.statusText, { color: status === 'ACTIVE' ? Theme.colors.greenDark : Theme.colors.coralDark }]}>{status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</Text></View>; }
function MiniStat({ label, value }: { label: string; value: number }) { return <View style={styles.miniStat}><Text style={styles.miniValue}>{value}</Text><Text style={styles.miniLabel}>{label}</Text></View>; }
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa có'; }
function messageOf(reason: unknown) { return reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.'; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background }, content: { width: '100%', maxWidth: 1050, alignSelf: 'center', padding: 18, paddingBottom: 50 },
  heading: { flexDirection: 'row', justifyContent: 'space-between' }, eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' }, title: { color: Theme.colors.ink, fontSize: 28, fontWeight: '900', marginTop: 3 }, subtitle: { color: Theme.colors.muted, marginTop: 4 },
  toolbar: { marginTop: 20, gap: 10 }, search: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', paddingLeft: 12 }, searchInput: { flex: 1, color: Theme.colors.ink, fontSize: 15 }, searchButton: { width: 48, height: 48, borderRadius: 7, backgroundColor: Theme.colors.blueDark, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { minHeight: 38, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, justifyContent: 'center', paddingHorizontal: 11, backgroundColor: '#FFFFFF' }, filterActive: { borderColor: Theme.colors.green, backgroundColor: '#EAF9ED' }, filterText: { color: Theme.colors.muted, fontSize: 11, fontWeight: '800' }, filterTextActive: { color: Theme.colors.greenDark, fontWeight: '900' },
  error: { marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', padding: 11 }, errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700' }, loading: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 14, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' }, userRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, padding: 12 }, avatar: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#EAF7FE', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: Theme.colors.blueDark, fontSize: 18, fontWeight: '900' }, userCopy: { flex: 1, minWidth: 0 }, userName: { color: Theme.colors.ink, fontSize: 15, fontWeight: '900' }, userEmail: { color: Theme.colors.muted, fontSize: 11, marginTop: 2 }, userMeta: { color: Theme.colors.muted, fontSize: 10, marginTop: 4 },
  statusBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 5 }, activeBadge: { backgroundColor: '#E7F8EA' }, lockedBadge: { backgroundColor: '#FFF0EF' }, statusText: { fontSize: 8, fontWeight: '900' },
  pagination: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }, pageButton: { width: 44, height: 44, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, pageText: { color: Theme.colors.ink, fontWeight: '800', fontSize: 12 }, disabled: { opacity: 0.4 }, busyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,40,48,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalSafe: { flex: 1, backgroundColor: 'rgba(25,39,47,0.55)' }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' }, modalPanel: { width: '100%', maxWidth: 720, maxHeight: '94%', borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' }, modalHeader: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 15 }, modalAvatar: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF7FE' }, modalTitleCopy: { flex: 1 }, modalTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900' }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, modalContent: { padding: 15, paddingBottom: 30, gap: 10 },
  detailStats: { flexDirection: 'row', gap: 8 }, miniStat: { flex: 1, minHeight: 78, borderRadius: 8, backgroundColor: '#F4F8FA', alignItems: 'center', justifyContent: 'center' }, miniValue: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900' }, miniLabel: { color: Theme.colors.muted, fontSize: 9, fontWeight: '800', marginTop: 2 }, detailLine: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }, detailLabel: { color: Theme.colors.muted, fontSize: 11, fontWeight: '800' }, detailValue: { color: Theme.colors.ink, fontSize: 11, fontWeight: '800' }, sectionTitle: { color: Theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 9 },
  progressRow: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, padding: 10 }, progressCopy: { paddingRight: 50 }, progressTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 12 }, percent: { position: 'absolute', right: 10, top: 11, color: Theme.colors.greenDark, fontWeight: '900', fontSize: 11 }, track: { height: 7, borderRadius: 4, backgroundColor: '#E8EEF1', overflow: 'hidden', marginTop: 9 }, fill: { height: '100%', backgroundColor: Theme.colors.green },
  sessionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: Theme.colors.border }, sessionIcon: { width: 34, height: 34, borderRadius: 7, backgroundColor: '#F1F6F8', alignItems: 'center', justifyContent: 'center' }, sessionTitle: { color: Theme.colors.ink, fontSize: 12, fontWeight: '800' }, emptyText: { color: Theme.colors.muted, paddingVertical: 16, textAlign: 'center' }, statusAction: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 7, marginTop: 8 }, lockAction: { borderColor: '#F4B4AF', backgroundColor: '#FFF3F2' }, unlockAction: { borderColor: '#BDE5C3', backgroundColor: '#F0FBF2' }, statusActionText: { fontWeight: '900' },
});
