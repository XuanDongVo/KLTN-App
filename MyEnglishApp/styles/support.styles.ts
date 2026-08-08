import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.ink },
    content: { padding: 20 },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.ink, marginLeft: 10 },
    paragraph: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 16 },
    step: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
    stepNumber: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#E8F8EA',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10, marginTop: 2
    },
    stepNumberText: { color: Theme.colors.greenDark, fontWeight: 'bold', fontSize: 12 },
    stepText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 }
});
