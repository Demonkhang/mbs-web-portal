import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from './utils';
const ToastContext = createContext(undefined);
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const showToast = (title, message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, title, message, type }]);
    };
    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };
    return (_jsxs(ToastContext.Provider, { value: { showToast }, children: [children, _jsx("div", { className: "fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none", children: toasts.map(toast => (_jsx(ToastItem, { toast: toast, onDismiss: () => removeToast(toast.id) }, toast.id))) })] }));
};
const ToastItem = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 4500);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    const icons = {
        success: _jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-600 shrink-0 mt-0.5" }),
        error: _jsx(AlertCircle, { className: "w-5 h-5 text-rose-600 shrink-0 mt-0.5" }),
        danger: _jsx(AlertCircle, { className: "w-5 h-5 text-rose-600 shrink-0 mt-0.5" }),
        warning: _jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600 shrink-0 mt-0.5" }),
        info: _jsx(Info, { className: "w-5 h-5 text-sky-600 shrink-0 mt-0.5" }),
    };
    const borderColors = {
        success: 'border-emerald-500',
        error: 'border-rose-500',
        danger: 'border-rose-500',
        warning: 'border-amber-500',
        info: 'border-sky-500',
    };
    return (_jsxs("div", { className: cn('pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl shadow-xl border-l-4 border transition-all animate-in slide-in-from-right duration-300', borderColors[toast.type]), children: [icons[toast.type], _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h5", { className: "text-sm font-semibold text-slate-900 leading-tight", children: toast.title }), toast.message && _jsx("p", { className: "text-xs text-slate-600 mt-1 leading-relaxed", children: toast.message })] }), _jsx("button", { onClick: onDismiss, className: "text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer", children: _jsx(X, { className: "w-4 h-4" }) })] }));
};
