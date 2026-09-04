import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './utils';
export const Tabs = ({ tabs, activeTab, onChange, variant = 'underline', className }) => {
    return (_jsx("div", { className: cn('flex items-center overflow-x-auto scrollbar-none border-b border-slate-200', className), children: _jsx("div", { className: "flex space-x-1 md:space-x-2", children: tabs.map(tab => {
                const isActive = tab.id === activeTab;
                if (variant === 'pills') {
                    return (_jsxs("button", { onClick: () => onChange(tab.id), className: cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer', isActive
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'), children: [tab.icon, _jsx("span", { children: tab.label }), tab.count !== undefined && (_jsx("span", { className: cn('text-xs px-2 py-0.5 rounded-full font-semibold', isActive ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'), children: tab.count }))] }, tab.id));
                }
                // Default underline
                return (_jsxs("button", { onClick: () => onChange(tab.id), className: cn('inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap cursor-pointer', isActive
                        ? 'border-emerald-600 text-emerald-700 font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'), children: [tab.icon, _jsx("span", { children: tab.label }), tab.count !== undefined && (_jsx("span", { className: cn('text-xs px-2 py-0.5 rounded-full font-medium', isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'), children: tab.count }))] }, tab.id));
            }) }) }));
};
