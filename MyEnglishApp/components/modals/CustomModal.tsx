import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info'| 'warning';
  showCancel?: boolean; 
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type,
  showCancel = false,
  cancelText = "Hủy",
  confirmText = "Đồng ý",
  onConfirm 
}) => {
  
  const getThemeColor = () => {
    switch (type) {
      case 'success': return '#4ade80'; 
      case 'error': return '#ef4444'; 
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#4ade80';
    }
  };

  const themeColor = getThemeColor();
  const handleConfirm = onConfirm ? onConfirm : onClose;
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: 'white', padding: 25, borderRadius: 20, width: '80%', maxWidth: 350, elevation: 5 }}>
          
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: themeColor }}>
            {title}
          </Text>
          
          <Text style={{ fontSize: 16, marginBottom: 25, textAlign: 'center', color: '#4b5563', lineHeight: 22 }}>
            {message}
          </Text>
          
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            
            {showCancel && (
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                onPress={onClose}
              >
                <Text style={{ color: '#4b5563', fontWeight: 'bold', fontSize: 16 }}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{ flex: 1, backgroundColor: themeColor, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{confirmText}</Text>
            </TouchableOpacity>
            
          </View>

        </View>
      </View>
    </Modal>
  );
};