import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from './utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, onNavigate }) => {
  return (
    <nav className={cn('flex items-center text-xs md:text-sm text-slate-500 py-3', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2 flex-wrap">
        <li className="inline-flex items-center">
          <button
            onClick={() => {
              if (onNavigate) onNavigate('/');
              else if (items[0]?.onClick) items[0].onClick();
              else window.location.href = '/';
            }}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </button>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
              {isLast || (!item.href && !item.onClick) ? (
                <span className="font-semibold text-slate-800 line-clamp-1 max-w-[280px] md:max-w-md">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.href && onNavigate) onNavigate(item.href);
                    else if (item.href) window.location.href = item.href;
                  }}
                  className="text-slate-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
