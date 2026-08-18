import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Play, ChevronRight, BellRing } from 'lucide-react';
import { fetchApi } from '../../services/api-client';
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
  const [newsList, setNewsList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch real articles from PostgreSQL DB API
  useEffect(() => {
    fetchApi<{ data: any[] }>('/v1/posts?status=PUBLISHED&limit=10')
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setNewsList(res.data);
        } else {
          // Fallback if no posts in DB yet
          setNewsList([
            { id: '1', title: 'UBND TP.HCM ban hành Quyết định phê duyệt Đề án giảm thiểu rác thải nhựa và phân loại rác tại nguồn.', slug: '' },
            { id: '2', title: 'MBS triển khai dự án ứng dụng công nghệ Đốt rác phát điện hiện đại tại Khu LHXLCT Đa Phước.', slug: '' }
          ]);
        }
      })
      .catch(() => {
        setNewsList([
          { id: '1', title: 'Ban Quản lý các Khu liên hợp xử lý chất thải (MBS) đẩy mạnh công tác bảo vệ môi trường.', slug: '' }
        ]);
      });
  }, []);

  useEffect(() => {
    if (isPaused || newsList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, newsList]);

  const currentItem = newsList[currentIndex] || { title: 'Đang tải tin tức mới nhất từ CSDL PostgreSQL...' };

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
            if (currentItem.slug && onNavigate) {
              onNavigate(`/tin-tuc/${currentItem.slug}`);
            } else if (onNewsClick) {
              onNewsClick(currentItem.title);
            } else if (onNavigate) {
              onNavigate('/tin-tuc');
            }
          }}
        >
          <div className="relative h-6 flex items-center">
            <p className="text-xs sm:text-sm text-slate-800 font-medium truncate hover:text-emerald-700 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
              {currentItem.title}
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
            onClick={() => setCurrentIndex((prev) => (prev + 1) % (newsList.length || 1))}
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
