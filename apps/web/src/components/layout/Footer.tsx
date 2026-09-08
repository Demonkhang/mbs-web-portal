import React from 'react';
import { MapPin, Phone, Mail, Globe, Clock, Shield, Award, ExternalLink, ChevronRight, Share2 } from 'lucide-react';
import { SITE_INFO, USEFUL_LINKS } from '../../lib/constants';
import { cn, formatNumber } from '../../lib/utils';

export interface FooterProps {
  onNavigate: (path: string) => void;
  isHighContrast?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isHighContrast }) => {
  return (
    <footer className={cn(
      'w-full text-slate-300 border-t transition-colors mt-12',
      isHighContrast ? 'bg-black text-yellow-300 border-yellow-500' : 'bg-slate-900 border-slate-800'
    )}>
      {/* Useful Government Links Bar */}
      <div className="border-b border-slate-800 bg-slate-950/70 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Liên kết cổng thông tin hữu ích:
            </span>
            <div className="flex items-center gap-4 flex-wrap text-xs">
              {USEFUL_LINKS.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group"
                >
                  <span>{link.logo}</span>
                  <span className="group-hover:underline underline-offset-2">{link.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Agency Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-700 border border-amber-300 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                MBS
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-400 font-bold block">UBND TP. HỒ CHÍ MINH</span>
                <h4 className="text-sm font-bold text-white leading-tight">BAN QUẢN LÝ MBS</h4>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cơ quan chuyên trách quản lý, điều phối và giám sát toàn diện hoạt động xử lý chất thải rắn sinh hoạt, công nghệ xử lý môi trường tại các khu liên hợp trên địa bàn TP.HCM.
            </p>
            {/* National Certification Seal */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã công bố trên Cổng TTĐT Chính phủ</span>
            </div>
          </div>

          {/* Col 2: Addresses & Contact */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-1 border-b border-slate-800">
              Trụ sở & Chi nhánh
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Trụ sở chính:</strong> {SITE_INFO.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Trụ sở phụ:</strong> {SITE_INFO.subAddress}</span>
              </li>
              {/* <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Khu XL Đa Phước:</strong> Xã Đa Phước, Bình Chánh, TP.HCM</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Khu XL Phước Hiệp:</strong> Xã Phước Hiệp, Củ Chi, TP.HCM</span>
              </li> */}
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{SITE_INFO.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-1 border-b border-slate-800">
              Chuyên mục chính
            </h5>
            <ul className="space-y-1.5 text-xs">
              {[
                { label: 'Tin tức sự kiện', href: '/tin-tuc' },
                { label: 'Kho Văn bản pháp quy', href: '/van-ban' },
                { label: 'Sơ đồ tổ chức & Danh bạ', href: '/so-do-to-chuc' },
                { label: 'Lịch công tác tuần', href: '/lich-cong-tac' },
              ].map(item => (
                <li key={item.label}>
                  <button
                    onClick={() => onNavigate(item.href)}
                    className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Traffic Stats & Hotlines */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-1 border-b border-slate-800">
              Liên hệ & Thống kê
            </h5>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl">
                <span className="text-[10px] text-red-400 font-bold uppercase block">Đường dây nóng hỗ trợ 24/7</span>
                <a href="tel:1900888868" className="text-lg font-black text-red-400 hover:underline">
                  1900 8888 68
                </a>
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Hôm nay:</span>
                  <strong className="text-emerald-400">{formatNumber(SITE_INFO.stats.todayVisitors)}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Đang trực tuyến:</span>
                  <strong className="text-amber-400">{formatNumber(SITE_INFO.stats.onlineNow)}</strong>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700">
                  <span>Tổng lượt truy cập:</span>
                  <strong className="text-white">{formatNumber(SITE_INFO.stats.totalVisitors)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Disclaimer */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Cổng thông tin điện tử Ban Quản lý MBS - Giữ toàn quyền.
          </span>
          <div className="flex items-center gap-3">
            <span>Trưởng Ban Biên tập: Giám đốc Ban Quản lý MBS</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">Giấy phép số 48/GP-TTĐT do Sở TT&TT TP.HCM cấp</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
