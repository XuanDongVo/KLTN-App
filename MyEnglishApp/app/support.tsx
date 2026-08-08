import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { styles } from '@/styles/support.styles';

export default function SupportScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={Theme.colors.ink} />
                </Pressable>
                <Text style={styles.headerTitle}>Hỗ trợ & Trợ giúp</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="email-alert" size={24} color={Theme.colors.coral} />
                        <Text style={styles.sectionTitle}>Không nhận được Email?</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        Hệ thống EnglishApp sẽ tự động gửi các báo cáo tiến độ học tập hàng tháng và mã OTP xác minh qua Email của bạn. Nếu bạn không tìm thấy thư, vui lòng làm theo các bước sau:
                    </Text>
                    
                    <View style={styles.step}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                        <Text style={styles.stepText}>Kiểm tra thư mục <Text style={{fontWeight: 'bold'}}>Spam (Thư rác)</Text> hoặc <Text style={{fontWeight: 'bold'}}>Promotions (Quảng cáo)</Text> trong hộp thư của bạn.</Text>
                    </View>
                    
                    <View style={styles.step}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                        <Text style={styles.stepText}>Đánh dấu email của EnglishApp là <Text style={{fontWeight: 'bold'}}>"Không phải thư rác" (Not Spam)</Text> để các email sau này được chuyển thẳng vào Hộp thư đến.</Text>
                    </View>
                    
                    <View style={styles.step}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                        <Text style={styles.stepText}>Kiểm tra lại xem địa chỉ email bạn đã đăng ký có chính xác không trong phần Hồ sơ (Profile).</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="face-agent" size={24} color={Theme.colors.blueDark} />
                        <Text style={styles.sectionTitle}>Liên hệ Quản trị viên</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        Nếu bạn gặp các lỗi kỹ thuật khác trong quá trình học, vui lòng liên hệ trực tiếp với trung tâm qua số Hotline hoặc gửi thư hỗ trợ về địa chỉ <Text style={{color: Theme.colors.blue, fontWeight: 'bold'}}>support@englishapp.com</Text>.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
