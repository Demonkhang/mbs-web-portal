import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './utils';
export const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
    if (totalPages <= 1)
        return null;
    const getPages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++)
                pages.push(i);
        }
        else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            }
            else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            }
            else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };
    return (_jsxs("div", { className: cn('flex items-center justify-center space-x-1 sm:space-x-2 py-4', className), children: [_jsx("button", { onClick: () => onPageChange(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors", title: "Trang tr\u01B0\u1EDBc", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), getPages().map((page, idx) => {
                if (page === '...') {
                    return (_jsx("span", { className: "px-2 text-slate-400 select-none", children: "..." }, `ellipsis-${idx}`));
                }
                const isCurrent = page === currentPage;
                return (_jsx("button", { onClick: () => onPageChange(page), className: cn('w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer', isCurrent
                        ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'), children: page }, `page-${page}`));
            }), _jsx("button", { onClick: () => onPageChange(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors", title: "Trang ti\u1EBFp", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }));
};
