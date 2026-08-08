import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View, Linking, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { getAllContributorRequests, reviewContributorRequest, ContributorRequestDto } from '@/services/contributorService';
import { styles } from '@/styles/admin/users/index.styles';
import { useModal } from '@/context/ModalContext';
import { CommandButton } from '@/components/admin/AdminShared';

export default function AdminContributorRequestsScreen() {
  const { showAlert, showConfirm } = useModal();
  const [data, setData] = useState<ContributorRequestDto[]>([]);
  const [filteredData, setFilteredData] = useState<ContributorRequestDto[]>([]);
  const [status, setStatus] = useState<string | undefined>('PENDING');
  const [selected, setSelected] = useState<ContributorRequestDto>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try { 
      const res = await getAllContributorRequests(); 
      setData(res);
      applyFilter(res, status);
    }
    catch (reason) { setError(messageOf(reason)); }
    finally { setLoading(false); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getAllContributorRequests(); 
      setData(res);
      applyFilter(res, status);
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilter = (items: ContributorRequestDto[], filterStatus: string | undefined) => {
    if (!filterStatus) setFilteredData(items);
    else setFilteredData(items.filter(item => item.status === filterStatus));
  };

  useEffect(() => { void load(); }, []);

  const chooseStatus = (next?: string) => {
    setStatus(next);
    applyFilter(data, next);
  };

  const handleReview = async (approve: boolean, feedback: string) => {
    if (!selected) return;
    if (!approve && !feedback.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập nhận xét khi từ chối.');
      return;
    }
    setBusy(true);
    try {
      await reviewContributorRequest(selected.id, approve, feedback);
      setSelected(undefined);
      await load();
    } catch (reason) { 
      showAlert('Lỗi', messageOf(reason)); 
    } finally { 
      setBusy(false); 
    }
  };

  return <View style={styles.screen}><ScrollView 
    contentContainerStyle={styles.content} 
    keyboardShouldPersistTaps="handled"
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.colors.green]} />
    }
  >
    <View style={styles.heading}><View><Text style={styles.eyebrow}>CONTRIBUTOR REQUESTS</Text><Text style={styles.title}>Duyệt Contributor</Text><Text style={styles.subtitle}>{filteredData.length} yêu cầu đang hiển thị.</Text></View></View>
    
    <View style={styles.toolbar}>
      <View style={styles.filters}>
        <Filter label="Tất cả" active={!status} onPress={() => chooseStatus()} />
        <Filter label="Chờ duyệt" active={status === 'PENDING'} onPress={() => chooseStatus('PENDING')} />
        <Filter label="Đã duyệt" active={status === 'APPROVED'} onPress={() => chooseStatus('APPROVED')} />
        <Filter label="Từ chối" active={status === 'REJECTED'} onPress={() => chooseStatus('REJECTED')} />
      </View>
    </View>

    {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : <View style={styles.list}>
      {filteredData.length > 0 ? filteredData.map((req) => (
        <Pressable key={req.id} onPress={() => setSelected(req)} style={styles.userRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{req.username.slice(0, 1).toUpperCase()}</Text></View>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{req.username}</Text>
            <Text style={styles.userEmail}>{req.email}</Text>
            <Text style={styles.userMeta}>Gửi ngày {formatDate(req.createdAt)}</Text>
          </View>
          <StatusBadge status={req.status} />
          <MaterialCommunityIcons name="chevron-right" size={23} color={Theme.colors.muted} />
        </Pressable>
      )) : <Text style={{ padding: 20, textAlign: 'center', color: Theme.colors.muted }}>Không có dữ liệu.</Text>}
    </View>}
  </ScrollView>
  {selected ? <RequestDetailModal request={selected} busy={busy} onReview={handleReview} onClose={() => setSelected(undefined)} /> : null}
  </View>;
}

function RequestDetailModal({ request, busy, onReview, onClose }: { request: ContributorRequestDto; busy: boolean; onReview: (approve: boolean, feedback: string) => void; onClose: () => void }) {
  const [feedback, setFeedback] = useState(request.adminFeedback || '');

  return <Modal transparent animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.modalSafe} edges={['top', 'bottom', 'left', 'right']}><View style={styles.modalBackdrop}><View style={styles.modalPanel}><View style={styles.modalHeader}><View style={styles.modalAvatar}><Text style={styles.avatarText}>{request.username.slice(0, 1).toUpperCase()}</Text></View><View style={styles.modalTitleCopy}><Text style={styles.modalTitle}>{request.username}</Text><Text style={styles.userEmail}>{request.email}</Text></View><Pressable accessibilityLabel="Đóng" onPress={onClose} style={styles.iconButton}><MaterialCommunityIcons name="close" size={25} color={Theme.colors.ink} /></Pressable></View><ScrollView contentContainerStyle={styles.modalContent}>
    
    <View style={styles.detailLine}><Text style={styles.detailLabel}>Trạng thái</Text><StatusBadge status={request.status} /></View>
    <View style={styles.detailLine}><Text style={styles.detailLabel}>Ngày gửi</Text><Text style={styles.detailValue}>{formatDate(request.createdAt)}</Text></View>
    
    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Thông tin đăng ký</Text>
    <View style={{ backgroundColor: '#F9FAFB', padding: 15, borderRadius: 8, marginBottom: 20 }}>
      {request.certificateUrl ? (
        <View style={{ marginBottom: 15, alignItems: 'center' }}>
          <Image 
            source={{ uri: request.certificateUrl }} 
            style={{ width: '100%', height: 200, borderRadius: 8, backgroundColor: '#E1E5E9' }} 
            resizeMode="contain" 
          />
        </View>
      ) : null}
      
      <Text style={{ fontWeight: '700', marginBottom: 5 }}>Link chứng chỉ:</Text>
      <Pressable onPress={() => Linking.openURL(request.certificateUrl)}>
        <Text style={{ color: Theme.colors.blue, textDecorationLine: 'underline', marginBottom: 15 }}>{request.certificateUrl}</Text>
      </Pressable>
      <Text style={{ fontWeight: '700', marginBottom: 5 }}>Ghi chú của người dùng:</Text>
      <Text style={{ color: Theme.colors.ink }}>{request.note || 'Không có ghi chú'}</Text>
    </View>

    <Text style={styles.sectionTitle}>Phản hồi từ Admin</Text>
    {request.status === 'PENDING' ? (
      <>
        <TextInput
          style={{ borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top', marginBottom: 20 }}
          placeholder="Nhập lý do từ chối hoặc nhận xét (bắt buộc nếu từ chối)"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
          <CommandButton icon="close-circle-outline" label="Từ chối" danger onPress={() => onReview(false, feedback)} disabled={busy} />
          <CommandButton icon="check-circle-outline" label="Chấp nhận" primary onPress={() => onReview(true, feedback)} disabled={busy} />
        </View>
      </>
    ) : (
      <View style={{ backgroundColor: '#F9FAFB', padding: 15, borderRadius: 8 }}>
        <Text style={{ color: Theme.colors.ink }}>{request.adminFeedback || 'Không có nhận xét.'}</Text>
      </View>
    )}

  </ScrollView></View></View></SafeAreaView></Modal>;
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }

function StatusBadge({ status }: { status: string }) { 
  let color = Theme.colors.ink;
  let label = status;
  if (status === 'PENDING') { color = Theme.colors.blueDark; label = 'CHỜ DUYỆT'; }
  if (status === 'APPROVED') { color = Theme.colors.greenDark; label = 'ĐÃ DUYỆT'; }
  if (status === 'REJECTED') { color = Theme.colors.coralDark; label = 'TỪ CHỐI'; }

  return <View style={[styles.statusBadge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}><Text style={[styles.statusText, { color }]}>{label}</Text></View>; 
}

function formatDate(value?: string) { return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có'; }
function messageOf(reason: unknown) { return reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.'; }
