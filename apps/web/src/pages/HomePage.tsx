import React, { useState, useEffect } from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { ActionCards } from '../components/home/ActionCards';
import { FeaturedNews } from '../components/home/FeaturedNews';
import { EnvironmentalMonitoring } from '../components/home/EnvironmentalMonitoring';
import { Image, Video, Play, ExternalLink, ArrowRight, ShieldCheck, PhoneCall, Building2, FileCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SITE_INFO } from '../lib/constants';
import { MOCK_FACILITIES } from '../lib/mock-data';
import { fetchApi } from '../services/api-client';

export interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenFeedback: () => void;
}

const defaultGalleries = [
  {
    title: 'Hệ thống tiếp nhận và cân xe tự động tại Khu LHXLCT Đa Phước',
    img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    count: '12 ảnh',
    date: '16/02/2026',
  },
  {
    title: 'Trạm quan trắc không khí tự động và hệ thống phun xịt khử mùi vi sinh',
    img: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=600&q=80',
    count: '8 ảnh',
    date: '14/02/2026',
  },
  {
    title: 'Nhà máy phân loại tái chế và sản xuất phân compost tại Phước Hiệp',
    img: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
    count: '15 ảnh',
    date: '10/02/2026',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenFeedback }) => {
  const [photoGalleries, setPhotoGalleries] = useState<any[]>(defaultGalleries);

  useEffect(() => {
    fetchApi<{ data: { items: any[] } | any[] }>('/v1/media?limit=6')
      .then((res) => {
        const rawList = (res?.data as any)?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.slice(0, 3).map((item: any, idx: number) => ({
            title: item.title || item.originalName || defaultGalleries[idx % 3].title,
            img: item.url || item.relativeUrl || defaultGalleries[idx % 3].img,
            count: item.category ? `${item.category}` : 'Tư liệu',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '2026',
          }));
          setPhotoGalleries(mapped);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải dữ liệu media từ PostgreSQL DB:', err);
      });
  }, []);

  return (
    <div className="space-y-0">
      {/* 1. Top Hero Slider & Executive Directives */}
      <HeroSlider onNavigate={onNavigate} />

      {/* 2. Four Main Action Cards (DVC, Phản ánh, Văn bản, Tra cứu) */}
      <ActionCards onNavigate={onNavigate} onOpenFeedback={onOpenFeedback} />

      {/* 3. Featured News & Recent Documents */}
      <FeaturedNews onNavigate={onNavigate} />

      {/* 4. Realtime 24/7 Environmental Monitoring Center */}
      <EnvironmentalMonitoring onNavigate={onNavigate} />

      {/* 5. Key Facilities Showcase */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b-2 border-emerald-700 pb-3 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-emerald-700 rounded-xs"></div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                CÁC KHU LIÊN HỢP XỬ LÝ CHẤT THẢI TRỌNG ĐIỂM
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/gioi-thieu')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Tìm hiểu quy hoạch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="gov">{facility.status}</Badge>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {facility.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{facility.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200/80 text-xs">
                      <div>
                        <span className="text-slate-400 block">Diện tích quy hoạch:</span>
                        <strong className="text-slate-800 font-bold">{facility.area}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Công suất tiếp nhận:</span>
                        <strong className="text-emerald-700 font-bold">{facility.capacity}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">Công nghệ áp dụng:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {facility.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('/gioi-thieu')}
                    className="w-full justify-center text-xs font-bold text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                  >
                    Xem hồ sơ kỹ thuật & quy hoạch chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Media Gallery Preview - Dynamically fetched from PostgreSQL CSDL */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-8">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black uppercase text-amber-400 tracking-wider">
                HÌNH ẢNH & PHÓNG SỰ TRUYỀN HÌNH
              </h3>
              <p className="text-xs text-slate-400">
                Ghi nhận chân thực hoạt động tiếp nhận, xử lý chất thải và công nghệ bảo vệ môi trường TP.HCM
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/thu-vien-anh')}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold hover:bg-amber-400 hover:text-slate-950 text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Xem toàn bộ thư viện</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photoGalleries.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('/thu-vien-anh')}
                className="group cursor-pointer bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-amber-400 transition-all shadow-lg hover:shadow-2xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Image className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.count}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Public Commitment & Quick Support Banner */}
      <section className="py-10 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                ĐỒNG HÀNH VÌ MÔI TRƯỜNG THÀNH PHỐ XANH - SẠCH - ĐẸP
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-tight">
                Ban Quản lý MBS cam kết công khai, minh bạch mọi thông tin môi trường
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Mọi phản ánh, thắc mắc về công tác tiếp nhận rác và chất lượng môi trường xung quanh khu xử lý sẽ được tiếp nhận và phản hồi nhanh chóng theo đúng quy định.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate('/lien-he')}
                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-extrabold hover:bg-emerald-50 hover:scale-105 shadow-md transition-all text-xs sm:text-sm cursor-pointer border border-white flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Liên hệ cơ quan</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
