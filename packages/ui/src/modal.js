import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'lg', className }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const maxWidthStyles = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        full: 'max-w-[95vw] md:max-w-6xl',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { className: cn('relative w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-8', maxWidthStyles[maxWidth], className), children: [title && (_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70", children: [_jsx("div", { className: "text-lg font-bold text-slate-900", children: title }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer", title: "\u0110\u00F3ng", children: _jsx(X, { className: "w-5 h-5" }) })] })), !title && (_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-20 cursor-pointer", title: "\u0110\u00F3ng", children: _jsx(X, { className: "w-5 h-5" }) })), _jsx("div", { className: "p-6", children: children })] })] }));
};
