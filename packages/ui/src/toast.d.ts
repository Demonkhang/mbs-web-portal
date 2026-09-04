import React from 'react';
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'danger';
export interface Toast {
    id: string;
    title: string;
    message?: string;
    type: ToastType;
}
interface ToastContextType {
    showToast: (title: string, message?: string, type?: ToastType) => void;
}
export declare const useToast: () => ToastContextType;
export declare const ToastProvider: React.FC<{
    children: React.ReactNode;
}>;
export {};
