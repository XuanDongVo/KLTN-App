import React, { createContext, useContext, useState } from 'react';
import { AppModal, ModalOptions } from '@/components/ui/AppModal';

interface ModalContextType {
    showAlert: (title: string, message: string, onConfirm?: () => void) => void;
    showConfirm: (title: string, message: string, confirmText: string, cancelText: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<ModalOptions | null>(null);

    const showAlert = (title: string, message: string, onConfirm?: () => void) => {
        setOptions({ type: 'alert', title, message, onConfirm });
        setVisible(true);
    };

    const showConfirm = (title: string, message: string, confirmText: string, cancelText: string, onConfirm: () => void, onCancel?: () => void) => {
        setOptions({ type: 'confirm', title, message, confirmText, cancelText, onConfirm, onCancel });
        setVisible(true);
    };

    const handleClose = () => {
        setVisible(false);
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <AppModal visible={visible} options={options} onClose={handleClose} />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
