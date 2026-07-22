import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { exploreStyles as styles } from '@/styles/exploreStyles';

import { Theme } from '@/constants/Theme';
import { getPhotoMissionLogs, PhotoMissionLog } from '@/services/photoMissionService';

const photoMissionImage = require('@/assets/images/lessons/greetings.png'); // Placeholder

export default function ExploreScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<PhotoMissionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await getPhotoMissionLogs();
      setLogs(data);
    } catch {
      // Ignore errors
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khám phá</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Nhiệm vụ AI</Text>
        <Pressable 
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/(learner)/photo-mission')}
        >
          <View style={styles.cardImageContainer}>
            <Image source={photoMissionImage} style={styles.cardImage} resizeMode="contain" />
            <View style={styles.badge}>
              <MaterialCommunityIcons name="star-shooting" size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>MỚI</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nhiệm vụ chụp ảnh</Text>
            <Text style={styles.cardDescription}>
              Khám phá thế giới xung quanh! Chụp ảnh các đồ vật để AI giúp bé học từ vựng tiếng Anh.
            </Text>
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Bắt đầu ngay</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={Theme.colors.greenDark} />
            </View>
          </View>
        </Pressable>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Bộ sưu tập của bé</Text>
        {loadingLogs ? (
          <ActivityIndicator size="large" color={Theme.colors.violet} style={{ marginTop: 20 }} />
        ) : logs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="image-outline" size={40} color={Theme.colors.border} />
            <Text style={styles.emptyStateText}>Bé chưa lưu thẻ bài nào.</Text>
            <Text style={styles.emptyStateSubtext}>Hãy làm nhiệm vụ chụp ảnh và lưu lại nhé!</Text>
          </View>
        ) : (
          <View style={styles.logList}>
            {logs.map(log => (
              <View key={log.id} style={styles.logCard}>
                <Image source={{ uri: log.imageUrl }} style={styles.logImage} />
                <View style={styles.logCardContent}>
                  <Text style={styles.logCaption}>{log.caption}</Text>
                  
                  <View style={styles.vocabRow}>
                    {log.discoveredVocabularies?.map(word => (
                      <View key={word} style={styles.vocabBadge}>
                        <Text style={styles.vocabBadgeText}>{word}</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable 
                    style={styles.listenBtn} 
                    onPress={() => Speech.speak(log.caption, { language: 'en-US', rate: 0.75 })}
                  >
                    <MaterialCommunityIcons name="volume-high" size={20} color={Theme.colors.blueDark} />
                    <Text style={styles.listenBtnText}>Nghe</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


