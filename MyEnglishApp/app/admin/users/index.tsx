import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AccountStatus, AdminUserDetail, AdminUserPage, AdminUserSummary } from '@/types/adminOperations';
import { styles } from './index.styles';

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
