import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';

export type ModalType = 'alert' | 'confirm';

export interface ModalOptions {
    title: string;
    message: string;
    type: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface AppModalProps {
    visible: boolean;
    options: ModalOptions | null;
    onClose: () => void;
}

export function AppModal({ visible, options, onClose }: AppModalProps) {
    if (!options) return null;

    const handleConfirm = () => {
        onClose();
        if (options.onConfirm) options.onConfirm();
    };

    const handleCancel = () => {
        onClose();
        if (options.onCancel) options.onCancel();
    };

    const iconName = options.type === 'alert' ? 'information' : 'help-circle';
    const iconColor = options.type === 'alert' ? Theme.colors.blue : Theme.colors.coral;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={iconName} size={40} color={iconColor} />
                    </View>
                    <Text style={styles.title}>{options.title}</Text>
                    <Text style={styles.message}>{options.message}</Text>
                    
                    <View style={styles.buttonRow}>
                        {options.type === 'confirm' && (
                            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                                <Text style={styles.cancelText}>{options.cancelText || 'Hủy'}</Text>
                            </Pressable>
                        )}
                        <Pressable style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                            <Text style={styles.confirmText}>{options.confirmText || 'Đồng ý'}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    dialog: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20, // Bo tròn mềm mại
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8
    },
    iconContainer: {
        marginBottom: 16,
        backgroundColor: '#F5F7FA',
        padding: 12,
        borderRadius: 40
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: Theme.colors.ink,
        marginBottom: 8,
        textAlign: 'center'
    },
    message: {
        fontSize: 15,
        color: Theme.colors.muted,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%'
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmButton: {
        backgroundColor: Theme.colors.greenDark
    },
    cancelButton: {
        backgroundColor: '#F0F4F8'
    },
    confirmText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700'
    },
    cancelText: {
        color: Theme.colors.muted,
        fontSize: 15,
        fontWeight: '700'
    }
});
