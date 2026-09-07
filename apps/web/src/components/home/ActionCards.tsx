import React from 'react';
import { Newspaper, Image as ImageIcon, BookOpen, Calendar, ArrowRight, ShieldCheck, HelpCircle, PhoneCall } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ActionCardsProps {
  onNavigate: (path: string) => void;
  onOpenFeedback: () => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({ onNavigate, onOpenFeedback }) => {
  const cards = [
    {
      id: 'tin-tuc-su-kien',
      title: 'Tin tức & Hoạt động',
      subtitle: 'Tin tức hoạt động chỉ đạo, sự kiện nổi bật của Ban Quản lý',
      badge: 'Mới nhất',
      icon: <Newspaper className="w-8 h-8 text-emerald-700" />,
      actionText: 'Xem tin tức',
      accentColor: 'from-emerald-600 to-teal-700',
      bgHover: 'group-hover:border-emerald-500',
      onClick: () => onNavigate('/tin-tuc'),
    },
    {
      id: 'thu-vien-kho-anh',
      title: 'Thư viện Kho ảnh',
      subtitle: 'Hình ảnh tư liệu hoạt động, hạ tầng & thiết bị môi trường',
      badge: 'Bộ sưu tập',
      icon: <ImageIcon className="w-8 h-8 text-amber-600" />,
      actionText: 'Khám phá kho ảnh',
      accentColor: 'from-amber-500 to-orange-600',
      bgHover: 'group-hover:border-amber-500',
      onClick: () => onNavigate('/thu-vien-anh'),
    },
    {
      id: 'tra-cuu-van-ban',
      title: 'Kho văn bản pháp quy',
      subtitle: 'Hệ thống nghị định, thông tư, quyết định chuyên ngành',
      badge: 'Cập nhật 2026',
      icon: <BookOpen className="w-8 h-8 text-blue-700" />,
      actionText: 'Tra cứu văn bản',
      accentColor: 'from-blue-600 to-indigo-700',
      bgHover: 'group-hover:border-blue-500',
      onClick: () => onNavigate('/van-ban'),
    },
    {
      id: 'lich-cong-tac',
      title: 'Lịch công tác',
      subtitle: 'Xem lịch họp, chương trình làm việc tuần của Ban Quản lý',
      badge: 'Lịch tuần',
      icon: <Calendar className="w-8 h-8 text-rose-700" />,
      actionText: 'Xem lịch công tác',
      accentColor: 'from-rose-600 to-red-700',
      bgHover: 'group-hover:border-rose-500',
      onClick: () => onNavigate('/lich-cong-tac'),
    },
  ];

  return (
    <section className="relative -mt-6 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className={cn(
              'group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden',
              card.bgHover
            )}
          >
            {/* Top decorative gradient bar */}
            <div className={cn('absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r', card.accentColor)}></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {card.icon}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {card.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {card.subtitle}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>{card.actionText}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
