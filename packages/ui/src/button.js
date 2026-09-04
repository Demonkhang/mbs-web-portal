import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './utils';
export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variantStyles = {
        primary: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 border border-transparent shadow-xs',
        secondary: 'bg-slate-800 text-white hover:bg-slate-900 border border-transparent shadow-xs',
        outline: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent shadow-xs',
        success: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 border border-transparent shadow-xs',
    };
    const sizeStyles = {
        sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5 h-8',
        md: 'text-sm px-4 py-2 rounded-lg gap-2 h-10',
        lg: 'text-base px-6 py-2.5 rounded-lg gap-2.5 h-12 font-medium',
        icon: 'p-2 rounded-lg h-10 w-10 justify-center',
    };
    return (_jsx("button", { ref: ref, disabled: disabled || isLoading, className: cn('inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1', variantStyles[variant], sizeStyles[size], className), ...props, children: isLoading ? (_jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4 text-current", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { children: "\u0110ang x\u1EED l\u00FD..." })] })) : (children) }));
});
Button.displayName = 'Button';
