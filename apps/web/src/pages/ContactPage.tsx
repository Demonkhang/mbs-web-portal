import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Building2, ShieldCheck, Navigation, 
  MessageSquare, ExternalLink, QrCode, Headphones, CheckCircle2, 
  Radio, ChevronRight
} from 'lucide-react';
import { SITE_INFO } from '../lib/constants';
import { Breadcrumb } from '../components/ui/breadcrumb';

const LOCATIONS = [
  {
    id: 'hq-main',
    type: 'TRỤ SỞ CHÍNH',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    title: 'Ban Quản lý các Khu LHXLCT TP.HCM',
    address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 1234',
    email: 'bql.mbs@tphcm.gov.vn',
    hours: 'Thứ Hai - Thứ Sáu: 07:30 - 17:00',
    note: 'Tiếp nhận hồ sơ DVC & Công văn chính thức',
    mapQuery: '40 Võ Thị Sáu, Tân Định, Quận 1, Hồ Chí Minh',
    highlight: true,
  },
  {
    id: 'hq-sub',
    type: 'TRỤ SỞ PHỤ',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    title: 'Văn phòng Tiếp nhận & Giao dịch Kỳ Đồng',
    address: 'Số 24 Kỳ Đồng, Phường 9, Quận 3, TP. Hồ Chí Minh',
    phone: '(028) 3822 1235',
    email: 'vanphong@mbs.tphcm.gov.vn',
    hours: 'Thứ Hai - Thứ Sáu: 07:30 - 17:00',
    note: 'Tiếp nhận hướng dẫn thủ tục & Giao dịch',
    mapQuery: '24 Kỳ Đồng, Phường 9, Quận 3, Hồ Chí Minh',
  },
  {
    id: 'station-dp',
    type: 'TRẠM HIỆN TRƯỜNG 24/7',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    title: 'Trạm Giám sát Đa Phước (Bình Chánh)',
    address: 'QL50, Xã Đa Phước, Huyện Bình Chánh, TP.HCM',
    phone: '028 3778 1234',
    hours: 'Trực ban tiếp nhận rác 24/7',
    note: 'Kiểm soát cân xe & Quan trắc tự động 24/7',
    mapQuery: 'Khu liên hợp xử lý chất thải Đa Phước Bình Chánh',
  },
  {
    id: 'station-ph',
    type: 'TRẠM HIỆN TRƯỜNG 24/7',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    title: 'Trạm Giám sát Phước Hiệp (Củ Chi)',
    address: 'Ấp 4, Xã Phước Hiệp, Huyện Củ Chi, TP.HCM',
    phone: '028 3792 5678',
    hours: 'Trực ban tiếp nhận rác 24/7',
    note: 'Kiểm soát phân loại rác & Công nghệ tái chế',
    mapQuery: 'Khu liên hợp xử lý chất thải Phước Hiệp Củ Chi',
  },
];

export interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [selectedLocId, setSelectedLocId] = useState<string>('hq-main');
  const activeLoc = LOCATIONS.find((loc) => loc.id === selectedLocId) || LOCATIONS[0];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Liên hệ & Bản đồ' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Page Title */}
        <div className="border-b-2 border-emerald-700 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>CỔNG LIÊN HỆ CHÍNH THỨC CƠ QUAN NHÀ NƯỚC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              THÔNG TIN LIÊN HỆ & VỊ TRÍ CƠ QUAN
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Hệ thống Trụ sở làm việc chính, Trụ sở phụ và các Trạm điều hành giám sát hiện trường rải rác trên địa bàn TP.HCM
            </p>
          </div>
        </div>

        {/* Location Cards Grid (4 Columns) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>Trụ sở chính, Trụ sở phụ & Các Trạm hiện trường</span>
            </h2>
            <span className="text-xs text-slate-500">Bấm chọn vị trí để xem bản đồ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${loc.badgeBg}`}>
                        {loc.type}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đang chọn
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{loc.title}</h3>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-800">{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                        <a href={`tel:${loc.phone.replace(/\s+/g, '')}`} className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline">
                          {loc.phone}
                        </a>
                      </div>
                      {loc.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="font-mono text-slate-700">{loc.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className={loc.hours.includes('24/7') ? 'text-emerald-700 font-bold' : ''}>
                          {loc.hours}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{loc.note}</span>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area: Direct Contact Hub & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Direct Phone & Zalo Contact Hub (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-blue-600" />
                  <span>KÊNH KẾT NỐI TRỰC TIẾP KHÔNG CẦN CHỜ ĐỢI</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase">
                  LIÊN HỆ QUA ĐIỆN THOẠI HOẶC ZALO OFFICIAL
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Ban Quản lý MBS ưu tiên tiếp nhận hỗ trợ, trao đổi công tác và xử lý phản ánh môi trường trực tiếp qua tổng đài hotline và kênh Zalo chính thức.
                </p>
              </div>

              {/* Option 1: Direct Hotline Calls */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-md relative overflow-hidden space-y-4">
                <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                  <Headphones className="w-48 h-48 text-white" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-emerald-700/80 rounded-full text-emerald-100 border border-emerald-500/40">
                    📞 Tổng đài Điện thoại 24/7
                  </span>
                  <span className="text-[11px] text-emerald-200 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Trực ban sẵn sàng
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2">
                    <span className="text-xs text-emerald-200 block font-semibold">Đường dây nóng phản ánh khẩn cấp</span>
                    <a
                      href="tel:1900888868"
                      className="text-2xl font-black font-mono tracking-tight text-yellow-300 block hover:text-white transition-colors"
                    >
                      1900 8888 68
                    </a>
                    <span className="text-[11px] text-slate-300 block">Miễn phí cước cuộc gọi 24/7</span>
                    <a
                      href="tel:1900888868"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs transition-transform active:scale-95 shadow"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>Gọi ngay 1900 8888 68</span>
                    </a>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2">
                    <span className="text-xs text-emerald-200 block font-semibold">Tổng đài Hành chính Trụ sở chính</span>
                    <a
                      href="tel:02838221234"
                      className="text-xl font-bold font-mono tracking-tight text-white block hover:text-yellow-300 transition-colors"
                    >
                      (028) 3822 1234
                    </a>
                    <span className="text-[11px] text-slate-300 block">Số 40 Võ Thị Sáu, Q.1 (Giờ hành chính)</span>
                    <a
                      href="tel:02838221234"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-transform active:scale-95 shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi bàn (028) 3822 1234</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Option 2: Zalo Official Account */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0068FF] text-white flex items-center justify-center font-bold text-sm shadow">
                      Zalo
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none">Zalo Official Account (Zalo OA)</h4>
                      <span className="text-[11px] text-blue-200">Trang thông tin & Tương tác chính thức</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-500/30 text-blue-100 border border-blue-400/40">
                    XÁC THỰC TÍCH XANH
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Quét mã QR hoặc nhấn nút để nhắn tin trực tiếp với Ban Quản lý MBS. Bạn có thể gửi hình ảnh, video phản ánh môi trường, nhận thông báo tiến độ văn bản và hỗ trợ thủ tục 24/7.
                    </p>
                    <ul className="space-y-1 text-xs text-blue-200">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Nhắn tin tương tác trực tiếp với bộ phận trực ban</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Gửi đính kèm hình ảnh hiện trường khẩn cấp</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-inner text-slate-900 space-y-2 text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-lg border-2 border-dashed border-blue-400 flex flex-col items-center justify-center text-blue-600 p-2">
                      <QrCode className="w-12 h-12" />
                      <span className="text-[9px] font-bold mt-1 text-slate-600">Bấm để mở Zalo</span>
                    </div>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-[#0068FF] hover:bg-[#0052cc] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat qua Zalo</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Email & Written Mail channel */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <strong className="text-slate-900 font-bold block">Hòm thư điện tử công vụ (Email):</strong>
                    <a href={`mailto:${SITE_INFO.email}`} className="font-mono text-emerald-700 font-bold hover:underline">
                      {SITE_INFO.email}
                    </a>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  Dành cho Công văn hành chính & Hồ sơ liên tịch
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Map & Directions (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 uppercase">
                  BẢN ĐỒ VỊ TRÍ ĐÃ CHỌN
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeLoc.type}
                </span>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{activeLoc.title}</h4>
                <p className="text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{activeLoc.address}</span>
                </p>
              </div>

              {/* Styled Vector / Map Display */}
              <div className="rounded-xl overflow-hidden border border-slate-300 bg-slate-900 h-64 relative flex items-center justify-center text-center p-6 shadow-inner">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:18px_18px]"></div>

                <div className="relative z-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto ring-4 ring-emerald-400/40 shadow-xl animate-bounce">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white px-3 py-1 bg-slate-900/80 rounded-full inline-block border border-slate-700">
                      {activeLoc.title}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xs mx-auto">
                      {activeLoc.address}
                    </p>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeLoc.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all hover:scale-105"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Mở Google Maps chỉ đường</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Directions & Logistics Notice */}
              <div className="space-y-2 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Navigation className="w-4 h-4 text-emerald-700" />
                  <span>Hướng dẫn di chuyển & Đỗ xe:</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  {selectedLocId === 'hq-main' && (
                    'Trụ sở chính tại 40 Võ Thị Sáu, Phường Tân Định, Quận 1. Quý khách liên hệ công tác vui lòng đăng ký tại cổng bảo vệ chính. Có bố trí bãi đỗ xe ô tô và xe máy dành riêng cho đại biểu & khách làm việc.'
                  )}
                  {selectedLocId === 'hq-sub' && (
                    'Trụ sở phụ tại 24 Kỳ Đồng, Phường 9, Quận 3. Nằm gần giao lộ Kỳ Đồng - Trương Định, thuận tiện tiếp nhận giao dịch hành chính và hỗ trợ tổ chức.'
                  )}
                  {selectedLocId === 'station-dp' && (
                    'Trạm hiện trường Khu xử lý Đa Phước nằm trên QL50, Bình Chánh. Xe vận chuyển rác thải và đối tác làm việc vào cổng Trực ban cân xe kiểm soát 24/7.'
                  )}
                  {selectedLocId === 'station-ph' && (
                    'Trạm hiện trường Khu xử lý Phước Hiệp nằm tại Ấp 4, Phước Hiệp, Củ Chi. Trực ban tiếp nhận và điều phối xe 24/7.'
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs mt-4">
              <span className="font-bold text-emerald-900">Hotline Trực ban 24/7:</span>
              <a href="tel:1900888868" className="text-base font-black text-emerald-800 font-mono hover:underline">
                1900 8888 68
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
