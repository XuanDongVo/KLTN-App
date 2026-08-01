import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Theme.colors.ink,
        marginLeft: 15,
    },
    scroll: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.ink,
        marginBottom: 10,
    },
    cardText: {
        fontSize: 15,
        color: Theme.colors.muted,
        marginBottom: 20,
        lineHeight: 22,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.ink,
        marginBottom: 10,
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    optionBtn: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionBtnSelected: {
        backgroundColor: '#E8F8EA',
        borderColor: Theme.colors.greenDark,
    },
    optionText: {
        fontSize: 15,
        fontWeight: '600',
        color: Theme.colors.muted,
    },
    optionTextSelected: {
        color: Theme.colors.greenDark,
    },
    submitBtn: {
        backgroundColor: Theme.colors.greenDark,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.ink,
    },
    progressValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.greenDark,
    },
    progressBarBg: {
        height: 12,
        backgroundColor: Theme.colors.border,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 15,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.greenDark,
        borderRadius: 6,
    },
    deadlineText: {
        fontSize: 14,
        color: Theme.colors.blue,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 10,
    }
});
