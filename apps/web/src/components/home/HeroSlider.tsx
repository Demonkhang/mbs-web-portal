import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Cpu, Flame, Leaf, Newspaper, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn, formatDate } from '../../lib/utils';
import { fetchApi } from '../../services/api-client';

export interface HeroSliderProps {
  onNavigate: (path: string) => void;
}

const defaultSlides = [
  {
    id: 'slide-1',
    title: 'Đẩy mạnh chuyển đổi công nghệ đốt rác phát điện (Waste-to-Energy)',
    subtitle: 'Hướng tới mục tiêu Net Zero và đô thị xanh thông minh của TP. Hồ Chí Minh đến năm 2030',
    tag: 'CÔNG NGHỆ MÔI TRƯỜNG',
    bgImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=80',
    actionText: 'Xem chi tiết dự án',
    actionHref: '/tin-tuc/day-manh-chuyen-doi-cong-nghe-dot-rac-phat-dien-tai-tphcm',
  },
  {
    id: 'slide-2',
    title: 'Vận hành 18 trạm quan trắc môi trường tự động, liên tục 24/7',
    subtitle: 'Minh bạch dữ liệu chỉ số chất lượng không khí (AQI) và nước thải sau xử lý tới toàn thể nhân dân',
    tag: 'CHUYỂN ĐỔI SỐ',
    bgImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1600&q=80',
    actionText: 'Tra cứu chỉ số quan trắc',
    actionHref: '/tin-tuc/trien-khai-he-thong-giam-sat-tu-dong-va-canh-bao-moi-truong',
  },
  {
    id: 'slide-3',
    title: 'Nâng cao chất lượng phục vụ nhân dân và doanh nghiệp qua Dịch vụ công trực tuyến',
    subtitle: '100% thủ tục hành chính thuộc thẩm quyền Ban Quản lý MBS được tiếp nhận và xử lý cấp độ 3, 4',
    tag: 'DỊCH VỤ CÔNG',
    bgImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1600&q=80',
    actionText: 'Nộp hồ sơ trực tuyến',
    actionHref: '/dich-vu-cong',
  }
];

const defaultDirectives = [
  {
    title: 'Chỉ thị số 04/CT-UBND về việc tăng cường kiểm tra, xử lý mùi hôi tại các bãi rác Nam TP.HCM',
    date: '15/02/2026',
    slug: 'trien-khai-he-thong-giam-sat-tu-dong-va-canh-bao-moi-truong',
    badge: 'Khẩn'
  },
  {
    title: 'Kế hoạch triển khai cao điểm bảo đảm vệ sinh môi trường phục vụ sự kiện chính trị TP.HCM',
    date: '14/02/2026',
    slug: 'thong-bao-ke-hoach-tiep-nhan-va-dieu-phoi-rac-thai-dip-le',
    badge: 'Chỉ đạo'
  },
  {
    title: 'Công văn hỏa tốc về bảo đảm an toàn phòng chống cháy nổ tại các trạm xử lý chất thải mùa khô',
    date: '12/02/2026',
    slug: 'kiem-tra-cong-tac-ve-sinh-moi-truong-va-phong-chong-su-co-mua-kho',
    badge: 'Hỏa tốc'
  },
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ onNavigate }) => {
  const [slides, setSlides] = useState<any[]>(defaultSlides);
  const [directives, setDirectives] = useState<any[]>(defaultDirectives);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchApi<{ data: any[] }>('/v1/posts?status=PUBLISHED&limit=10')
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const livePosts = res.data;

          // Map slides from live DB posts
          const liveSlides = livePosts.slice(0, 4).map((p: any) => ({
            id: p.id,
            title: p.title,
            subtitle: p.summary || p.title,
            tag: p.category?.name?.toUpperCase() || 'CỔNG THÔNG TIN MBS',
            bgImage: p.imageUrl || 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=80',
            actionText: 'Xem chi tiết bài viết',
            actionHref: `/tin-tuc/${p.slug || p.id}`,
          }));
          setSlides(liveSlides);

          // Map directives from live DB posts
          const directivePosts = livePosts.filter((p: any) =>
            p.category?.slug === 'chi-dao-dieu-hanh' ||
            p.category?.name?.toLowerCase().includes('chỉ đạo') ||
            p.category?.name?.toLowerCase().includes('thông báo')
          );
          const selectedDirectives = directivePosts.length > 0 ? directivePosts : livePosts;

          const liveDirectives = selectedDirectives.slice(0, 3).map((p: any) => ({
            title: p.title,
            date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : new Date(p.createdAt).toLocaleDateString('vi-VN'),
            slug: p.slug || p.id,
            badge: p.category?.name || 'Chỉ đạo'
          }));
          setDirectives(liveDirectives);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải bài viết realtime từ CSDL PostgreSQL:', err);
      });
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full overflow-hidden bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Slider (8 cols) */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl border border-slate-700/50 group">
            {/* Background Images */}
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={cn(
                  'absolute inset-0 transition-opacity duration-700 ease-in-out',
                  idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                )}
              >
                <img
                  src={slide.bgImage}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                <div className="absolute inset-0 bg-emerald-950/30 mix-blend-multiply"></div>
              </div>
            ))}

            {/* Slider Content */}
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs border border-emerald-400/40">
                {slides[currentSlide].tag}
              </span>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                {slides[currentSlide].title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-2xl leading-relaxed">
                {slides[currentSlide].subtitle}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate(slides[currentSlide].actionHref)}
                  className="gap-2 font-bold shadow-lg"
                >
                  <span>{slides[currentSlide].actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-emerald-700 transition-all flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-emerald-700 transition-all flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Ảnh sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 right-6 z-10 flex space-x-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all cursor-pointer',
                    idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Right Widget: Chỉ đạo điều hành & Thông báo mới (4 cols) */}
          <div className="lg:col-span-4 bg-slate-800/90 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                  <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wider">
                    CHỈ ĐẠO ĐIỀU HÀNH
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('/tin-tuc?cat=chi-dao-dieu-hanh')}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Xem tất cả
                </button>
              </div>

              {/* Directives items list */}
              <div className="divide-y divide-slate-700/60 mt-2">
                {directives.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => onNavigate(`/tin-tuc/${item.slug}`)}
                    className="py-3 group/item cursor-pointer hover:bg-slate-700/30 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded',
                        item.badge === 'Hỏa tốc' ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'
                      )}>
                        {item.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2 group-hover/item:text-amber-300 transition-colors">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Emergency banner */}
            <div className="mt-4 pt-3 border-t border-slate-700">
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-400 block">Đường dây nóng phản ánh</span>
                  <span className="text-base font-black text-white">1900 8888 68</span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onNavigate('/phan-anh')}
                  className="text-xs"
                >
                  Gửi phản ánh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
