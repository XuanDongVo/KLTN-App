import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import { Theme } from '@/constants/Theme';
import { request, ServerResponse } from '@/services/apiClient';
import { styles } from '@/styles/(learner)/history.styles';

interface HistoryRecord {
  id: string;
  activityType: string;
  stats: any;
  timestamp: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    setLoading(true);
    request<HistoryRecord[]>(`/api/learner/history?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .then((res) => {
        if (res) setHistory(res);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const { chartData, maxXp } = useMemo(() => {
    // Generate dates between start and end
    const dates: string[] = [];
    let current = new Date(startDate);
    
    const getLocalDateString = (d: Date) => {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    while (current <= endDate) {
      dates.push(getLocalDateString(current));
      current.setDate(current.getDate() + 1);
    }
    
    // Aggregate xp by date
    const xpByDate: Record<string, number> = {};
    dates.forEach(d => xpByDate[d] = 0);
    
    history.forEach(item => {
      const dateStr = item.timestamp.split('T')[0];
      if (xpByDate[dateStr] !== undefined) {
        xpByDate[dateStr] += (item.stats?.xpEarned || 0);
      }
    });

    const data = dates.map(d => ({
      date: d,
      dayName: new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short' }),
      xp: xpByDate[d],
    }));

    const max = Math.max(...data.map(d => d.xp), 50); // Min 50 for visual scale
    return { chartData: data, maxXp: max };
  }, [history, startDate, endDate]);

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      selectedDate.setHours(0, 0, 0, 0);
      setStartDate(selectedDate);
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      selectedDate.setHours(23, 59, 59, 999);
      setEndDate(selectedDate);
    }
  };

  const renderHistoryItem = (item: HistoryRecord) => {
    const isGoal = item.activityType === 'DAILY_GOAL_REACHED';
    const isReview = item.activityType === 'REVIEW';
    const time = new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(item.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    return (
      <View key={item.id} style={styles.historyItem}>
        <View style={[styles.historyIcon, { backgroundColor: isGoal ? '#FFF5CE' : isReview ? '#E6E6FA' : '#E8F5E9' }]}>
          <MaterialCommunityIcons 
            name={isGoal ? 'fire' : isReview ? 'refresh' : 'check-decagram'} 
            size={24} 
            color={isGoal ? Theme.colors.coral : isReview ? Theme.colors.violet : Theme.colors.greenDark} 
          />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>
            {isGoal ? 'Đạt mục tiêu ngày' : isReview ? 'Ôn tập từ vựng' : 'Hoàn thành bài học'}
          </Text>
          <Text style={styles.historyTime}>{time} - {date}</Text>
          {item.stats?.stars !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
               <Text style={styles.historyDetail}>⭐ {item.stats.stars} sao</Text>
               <Text style={styles.historyDetail}>🎯 {item.stats.score}%</Text>
            </View>
          )}
        </View>
        <View style={styles.historyXp}>
          <Text style={styles.historyXpText}>+{item.stats?.xpEarned || 0} XP</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={Theme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Thống kê & Lịch sử</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Filters */}
        <View style={styles.dateFilter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>Từ ngày</Text>
            <Pressable style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
              <MaterialCommunityIcons name="calendar" size={20} color={Theme.colors.muted} />
              <Text style={styles.dateText}>{startDate.toLocaleDateString('vi-VN')}</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
             <Text style={styles.dateLabel}>Đến ngày</Text>
            <Pressable style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
              <MaterialCommunityIcons name="calendar" size={20} color={Theme.colors.muted} />
              <Text style={styles.dateText}>{endDate.toLocaleDateString('vi-VN')}</Text>
            </Pressable>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartChange} />
        )}
        {showEndPicker && (
          <DateTimePicker value={endDate} mode="date" display="default" onChange={onEndChange} />
        )}

        {/* Chart */}
        <View style={styles.chartContainer}>
          {loading ? (
             <ActivityIndicator size="large" color={Theme.colors.green} style={{ padding: 40 }}/>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chart}>
                {chartData.map((d, i) => {
                  const height = (d.xp / maxXp) * 150; // max height 150px
                  return (
                    <View key={i} style={styles.barContainer}>
                      <Text style={styles.barLabel}>{d.xp > 0 ? d.xp : ''}</Text>
                      <View style={[styles.bar, { height: Math.max(height, 4) }]} />
                      <Text style={styles.dayLabel}>{d.dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* History List */}
        <Text style={styles.sectionTitle}>Lịch sử hoạt động</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.green} />
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>Không có hoạt động nào trong thời gian này.</Text>
        ) : (
          <View style={styles.historyList}>
            {history.map(renderHistoryItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
