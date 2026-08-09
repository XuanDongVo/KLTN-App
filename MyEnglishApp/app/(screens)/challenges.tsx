import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { challengeService, ChallengeResponse } from '@/services/challengeService';
import { styles } from '@/styles/(tabs)/challenges.styles';
import { Theme } from '@/constants/Theme';
import { parseISO, differenceInDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useModal } from '@/context/ModalContext';

export default function ChallengesScreen() {
    const router = useRouter();
    const { showAlert, showConfirm } = useModal();
    const params = useLocalSearchParams<{ isNewUser?: string }>();
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState<ChallengeResponse | null>(null);
    const [selectedXp, setSelectedXp] = useState(500);
    const [selectedDays, setSelectedDays] = useState(7);

    const xpOptions = [500, 1000, 2000];
    const daysOptions = [1, 7, 14, 30];

    const fetchCurrentChallenge = async () => {
        setLoading(true);
        try {
            const current = await challengeService.getCurrentChallenge();
            setActiveChallenge(current);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCurrentChallenge();
        }, [])
    );

    const handleStartChallenge = async () => {
        try {
            const isVerified = await AsyncStorage.getItem('isVerified');
            
            if (isVerified === 'true') {
                await createNewChallenge();
            } else {
                showConfirm(
                    "Nhận thông báo",
                    "Bạn có muốn xác thực email để nhận thông báo tiến độ từ ứng dụng không?",
                    "Có, xác thực ngay",
                    "Không, cảm ơn",
                    () => createNewChallenge(true),
                    () => createNewChallenge(false)
                );
            }
        } catch (error) {
            console.log(error);
        }
    };

    const createNewChallenge = async (shouldVerify = false) => {
        try {
            setLoading(true);
            const newChallenge = await challengeService.createChallenge(selectedXp, selectedDays);
            setActiveChallenge(newChallenge);
            
            if (shouldVerify) {
                router.replace('/(auth)/verify?returnTo=challenges');
            } else {
                showAlert("Thành công!", "Thử thách của bạn đã bắt đầu!", () => {
                    if (params.isNewUser === '1') {
                        router.replace('/(tabs)');
                    }
                });
            }
        } catch (error: any) {
            showAlert("Lỗi", error.response?.data?.message || "Không thể tạo thử thách.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.greenDark} />
            </SafeAreaView>
        );
    }

    const renderActiveChallenge = () => {
        if (!activeChallenge) return null;

        const progressPercent = Math.min(100, (activeChallenge.currentXp / activeChallenge.targetXp) * 100);
        const endDate = parseISO(activeChallenge.endDate);
        const daysLeft = differenceInDays(endDate, new Date());

        return (
            <View style={styles.card}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Thử thách đang chạy</Text>
                    <MaterialCommunityIcons name="fire" size={24} color={Theme.colors.greenDark} />
                </View>
                
                <Text style={styles.label}>Tiến độ (XP)</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.optionText}>{activeChallenge.currentXp} XP</Text>
                    <Text style={styles.progressValue}>{activeChallenge.targetXp} XP</Text>
                </View>

                <Text style={styles.deadlineText}>
                    {daysLeft > 0 ? `Còn ${daysLeft} ngày để hoàn thành!` : 'Hôm nay là ngày cuối cùng!'}
                </Text>
            </View>
        );
    };

    const renderCreateChallenge = () => {
        if (activeChallenge) return null;

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Tạo thử thách mới</Text>
                <Text style={styles.cardText}>Cam kết một mục tiêu XP để giữ bản thân luôn kỷ luật. Bạn đã sẵn sàng chưa?</Text>

                <Text style={styles.label}>Mục tiêu XP</Text>
                <View style={styles.row}>
                    {xpOptions.map(xp => (
                        <Pressable 
                            key={xp}
                            style={[styles.optionBtn, selectedXp === xp && styles.optionBtnSelected]}
                            onPress={() => setSelectedXp(xp)}
                        >
                            <Text style={[styles.optionText, selectedXp === xp && styles.optionTextSelected]}>{xp} XP</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Thời gian (Ngày)</Text>
                <View style={styles.row}>
                    {daysOptions.map(days => (
                        <Pressable 
                            key={days}
                            style={[styles.optionBtn, selectedDays === days && styles.optionBtnSelected]}
                            onPress={() => setSelectedDays(days)}
                        >
                            <Text style={[styles.optionText, selectedDays === days && styles.optionTextSelected]}>{days} Ngày</Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={styles.submitBtn} onPress={handleStartChallenge}>
                    <Text style={styles.submitBtnText}>Bắt Đầu Thử Thách</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={Theme.colors.ink} />
                </Pressable>
                <MaterialCommunityIcons name="trophy" size={28} color={Theme.colors.greenDark} />
                <Text style={styles.headerTitle}>Thử thách cá nhân</Text>
            </View>
            <ScrollView style={styles.scroll}>
                {renderActiveChallenge()}
                {renderCreateChallenge()}
            </ScrollView>
        </SafeAreaView>
    );
}
