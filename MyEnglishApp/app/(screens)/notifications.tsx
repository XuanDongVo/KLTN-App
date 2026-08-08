import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function NotificationScreen() {
  const router = useRouter();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotifications();

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userEmail']);
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const handlePress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.dataJson) {
      try {
        const data = JSON.parse(notification.dataJson);
        switch (data.type) {
          case 'CONTRIBUTOR_APPROVED':
            Alert.alert(
              'Cập nhật quyền',
              'Bạn cần đăng xuất và đăng nhập lại để sử dụng các tính năng của Contributor.',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: logout }
              ]
            );
            break;
          case 'CURRICULUM_UPDATED':
            router.push(`/?levelCode=${data.levelCode}&highlightUnitCode=${data.unitCode}`);
            break;
          case 'CURRICULUM_REVIEW_RESULT':
            router.push('/contributor/curriculum');
            break;
          case 'CURRICULUM_REVIEW':
            router.push('/admin/curriculum');
            break;
          case 'CONTRIBUTOR_APPLICATION':
            router.push('/admin/requests');
            break;
        }
      } catch (e) {
        console.error('Error parsing notification data', e);
      }
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Pressable 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]} 
      onPress={() => handlePress(item)}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={!item.isRead ? 'bell-badge' : 'bell-outline'} 
          size={24} 
          color={!item.isRead ? Theme.colors.coralDark : Theme.colors.muted} 
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <Pressable onPress={markAllAsRead} style={styles.readAllButton}>
          <MaterialCommunityIcons name="check-all" size={24} color={Theme.colors.blue} />
        </Pressable>
      </View>
      
      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={() => fetchNotifications(true)}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-sleep" size={48} color={Theme.colors.muted} />
            <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.ink,
  },
  readAllButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  unreadCard: {
    backgroundColor: `${Theme.colors.blue}08`,
    borderColor: `${Theme.colors.blue}40`,
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.ink,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
    color: Theme.colors.blue,
  },
  message: {
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Theme.colors.muted,
  },
});
