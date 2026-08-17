import React, { useState, useEffect } from 'react';
import { ArrowUp, PhoneCall, AlertTriangle, Search, FileCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface QuickAccessMenuProps {
  onNavigate: (path: string) => void;
  onOpenReportModal?: () => void;
  onOpenFeedback?: () => void;
}

export const QuickAccessMenu: React.FC<QuickAccessMenuProps> = ({ onNavigate, onOpenReportModal, onOpenFeedback }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-4 bottom-6 z-40 flex flex-col items-end space-y-2.5">
      {/* Hotline Button */}
      <a
        href="tel:1900888868"
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-105 transition-all group"
        title="Gọi đường dây nóng 24/7"
      >
        <PhoneCall className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline text-xs font-bold pr-1">1900 8888 68</span>
      </a>

      {/* Quick Report Petition */}
      <button
        onClick={() => {
          if (onOpenFeedback) onOpenFeedback();
          else if (onOpenReportModal) onOpenReportModal();
          else onNavigate('/phan-anh');
        }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-amber-500 text-slate-950 shadow-xl hover:bg-amber-400 hover:scale-105 transition-all group font-bold text-xs cursor-pointer"
        title="Gửi phản ánh vi phạm môi trường"
      >
        <AlertTriangle className="w-5 h-5 text-slate-950" />
        <span className="hidden sm:inline pr-1">Phản ánh nhanh</span>
      </button>

      {/* Track Application */}
      <button
        onClick={() => onNavigate('/dich-vu-cong#tra-cuu')}
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-emerald-700 text-white shadow-xl hover:bg-emerald-800 hover:scale-105 transition-all group font-bold text-xs cursor-pointer"
        title="Tra cứu hồ sơ hành chính"
      >
        <FileCheck className="w-5 h-5" />
        <span className="hidden sm:inline pr-1">Tra cứu hồ sơ</span>
      </button>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-slate-800/90 text-white shadow-lg flex items-center justify-center hover:bg-slate-900 transition-all hover:scale-110 cursor-pointer animate-in fade-in"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
