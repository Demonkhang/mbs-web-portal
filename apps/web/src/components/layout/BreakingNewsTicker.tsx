import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Play, ChevronRight, BellRing } from 'lucide-react';
import { BREAKING_NEWS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export const BreakingNewsTicker: React.FC<{
  isHighContrast?: boolean;
  onNewsClick?: (text: string) => void;
  onNavigate?: (path: string) => void;
}> = ({
  isHighContrast,
  onNewsClick,
  onNavigate
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className={cn(
      'w-full border-b transition-colors overflow-hidden',
      isHighContrast
        ? 'bg-yellow-950 text-yellow-200 border-yellow-800'
        : 'bg-emerald-50 text-slate-800 border-emerald-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-3">
        {/* Label Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-extrabold uppercase shrink-0 shadow-xs tracking-wider">
          <BellRing className="w-3.5 h-3.5 animate-bounce" />
          <span>TIN MỚI</span>
        </div>

        {/* Ticker text */}
        <div
          className="flex-1 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => {
            if (onNewsClick) onNewsClick(BREAKING_NEWS[currentIndex]);
            else if (onNavigate) onNavigate('/tin-tuc');
          }}
        >
          <div className="relative h-6 flex items-center">
            <p className="text-xs sm:text-sm text-slate-800 font-medium truncate hover:text-emerald-700 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
              {BREAKING_NEWS[currentIndex]}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
            title={isPaused ? 'Tiếp tục chạy' : 'Tạm dừng tin'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length)}
            className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
            title="Tin kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
