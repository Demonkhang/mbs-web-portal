import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';
export const Accordion = ({ items, allowMultiple = false, className }) => {
    const [openIds, setOpenIds] = useState(() => {
        return items.filter(item => item.defaultOpen).map(item => item.id);
    });
    const toggle = (id) => {
        if (allowMultiple) {
            setOpenIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
        }
        else {
            setOpenIds(prev => prev.includes(id) ? [] : [id]);
        }
    };
    return (_jsx("div", { className: cn('divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs', className), children: items.map(item => {
            const isOpen = openIds.includes(item.id);
            return (_jsxs("div", { className: "transition-colors", children: [_jsxs("button", { onClick: () => toggle(item.id), className: "w-full flex items-center justify-between px-5 py-4 text-left font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer", "aria-expanded": isOpen, children: [_jsx("span", { className: "text-sm md:text-base font-semibold text-slate-900 pr-4", children: item.title }), _jsx(ChevronDown, { className: cn('w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200', isOpen && 'transform rotate-180 text-emerald-600') })] }), isOpen && (_jsx("div", { className: "px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50", children: item.content }))] }, item.id));
        }) }));
};
