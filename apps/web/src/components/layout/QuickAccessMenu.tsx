import React, { useState, useEffect } from 'react';
import { ArrowUp, PhoneCall, MessageCircle } from 'lucide-react';

export interface QuickAccessMenuProps {
  onNavigate?: (path: string) => void;
  onOpenReportModal?: () => void;
  onOpenFeedback?: () => void;
}

export const QuickAccessMenu: React.FC<QuickAccessMenuProps> = () => {
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
      {/* Hotline / Liên hệ ngay Button */}
      <a
        href="tel:1900888868"
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-105 transition-all group font-bold text-xs"
        title="Liên hệ ngay / Đường dây nóng 24/7"
      >
        <PhoneCall className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline pr-1">1900 8888 68</span>
      </a>

      {/* Zalo Contact Button */}
      <a
        href="https://zalo.me"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-[#0068FF] text-white shadow-xl hover:bg-blue-600 hover:scale-105 transition-all group font-bold text-xs"
        title="Liên hệ qua Zalo OA"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline pr-1">Zalo</span>
      </a>

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
