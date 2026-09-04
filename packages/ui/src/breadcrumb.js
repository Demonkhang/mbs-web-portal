import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight, Home } from 'lucide-react';
import { cn } from './utils';
export const Breadcrumb = ({ items, className, onNavigate }) => {
    return (_jsx("nav", { className: cn('flex items-center text-xs md:text-sm text-slate-500 py-3', className), "aria-label": "Breadcrumb", children: _jsxs("ol", { className: "flex items-center space-x-1 md:space-x-2 flex-wrap", children: [_jsx("li", { className: "inline-flex items-center", children: _jsxs("button", { onClick: () => {
                            if (onNavigate)
                                onNavigate('/');
                            else if (items[0]?.onClick)
                                items[0].onClick();
                            else
                                window.location.href = '/';
                        }, className: "inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-medium transition-colors cursor-pointer", children: [_jsx(Home, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Trang ch\u1EE7" })] }) }), items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (_jsxs("li", { className: "inline-flex items-center", children: [_jsx(ChevronRight, { className: "w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" }), isLast || (!item.href && !item.onClick) ? (_jsx("span", { className: "font-semibold text-slate-800 line-clamp-1 max-w-[280px] md:max-w-md", children: item.label })) : (_jsx("button", { onClick: () => {
                                    if (item.onClick)
                                        item.onClick();
                                    else if (item.href && onNavigate)
                                        onNavigate(item.href);
                                    else if (item.href)
                                        window.location.href = item.href;
                                }, className: "text-slate-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer", children: item.label }))] }, index));
                })] }) }));
};
