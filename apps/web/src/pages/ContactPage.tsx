import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Building2, ShieldCheck, Navigation, 
  MessageSquare, ExternalLink, QrCode, Headphones, CheckCircle2, 
  Search, Users, RefreshCw, UserCheck, PhoneCall, Sparkles
} from 'lucide-react';
import { SITE_INFO } from '../lib/constants';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { fetchApi } from '../services/api-client';

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
  const [activeMainTab, setActiveMainTab] = useState<'directory' | 'locations'>('directory');
  const [selectedLocId, setSelectedLocId] = useState<string>('hq-main');
  const activeLoc = LOCATIONS.find((loc) => loc.id === selectedLocId) || LOCATIONS[0];

  // Dynamic directory state from CSDL
  const [directoryUnits, setDirectoryUnits] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  useEffect(() => {
    setLoadingDirectory(true);
    Promise.all([
      fetchApi<{ data: any[] }>('/v1/directory/public'),
      fetchApi<{ data: any[] }>('/v1/directory/staff'),
    ])
      .then(([unitsRes, staffRes]) => {
        if (unitsRes && unitsRes.data) {
          setDirectoryUnits(unitsRes.data);
        }
        if (staffRes && staffRes.data) {
          setStaffList(staffRes.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching directory:', err);
      })
      .finally(() => {
        setLoadingDirectory(false);
      });
  }, []);

  // Filter staff members
  const filteredStaff = staffList.filter((staff) => {
    if (selectedUnitId && staff.unitId !== selectedUnitId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = staff.fullName?.toLowerCase().includes(q);
      const posMatch = staff.position?.toLowerCase().includes(q);
      const phoneMatch = staff.phone?.toLowerCase().includes(q);
      const extMatch = staff.extension?.toLowerCase().includes(q);
      const emailMatch = staff.email?.toLowerCase().includes(q);
      const deptMatch = staff.department?.name?.toLowerCase().includes(q);
      const unitMatch = staff.unit?.name?.toLowerCase().includes(q);
      return nameMatch || posMatch || phoneMatch || extMatch || emailMatch || deptMatch || unitMatch;
    }
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Liên hệ & Danh bạ điện tử' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Page Title & Main Navigation Tabs */}
        <div className="border-b-2 border-emerald-700 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>CỔNG LIÊN HỆ CHÍNH THỨC CƠ QUAN NHÀ NƯỚC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              LIÊN HỆ & DANH BẠ ĐIỆN TỬ CÁN BỘ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tra cứu danh bạ điện tử máy lẻ các phòng ban chuyên môn và thông tin các trụ sở làm việc của Ban Quản lý MBS
            </p>
          </div>

          {/* Main View Tab Switcher */}
          <div className="flex bg-slate-200 p-1.5 rounded-2xl shrink-0 border border-slate-300">
            <button
              onClick={() => setActiveMainTab('directory')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === 'directory'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Danh bạ điện tử ({staffList.length})</span>
            </button>
            <button
              onClick={() => setActiveMainTab('locations')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === 'locations'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Trụ sở & Bản đồ vị trí</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ELECTRONIC DIRECTORY (DANH BẠ ĐIỆN TỬ) */}
        {/* ======================================================== */}
        {activeMainTab === 'directory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search and Unit Filter Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    <span>Tra cứu Danh bạ điện tử Cán bộ & Phòng ban</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu được nạp và đồng bộ tự động theo thời gian thực từ Hệ thống Cơ sở dữ liệu PostgreSQL
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm cán bộ, máy lẻ, email..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Filter Quick Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedUnitId('')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    selectedUnitId === ''
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Tất cả đơn vị ({staffList.length})
                </button>
                {directoryUnits.map((unit) => {
                  const count = staffList.filter((s) => s.unitId === unit.id).length;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                        selectedUnitId === unit.id
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {unit.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Directory Content List */}
            {loadingDirectory ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 space-y-3 border border-slate-200 shadow-sm">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Đang tải Danh bạ điện tử từ Cơ sở dữ liệu...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 space-y-2 border border-slate-200 shadow-sm">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Không tìm thấy thông tin cán bộ phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thử tìm kiếm với từ khóa khác hoặc bấm nút "Tất cả đơn vị" để xem toàn bộ danh bạ.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="p-4">Họ và tên Cán bộ</th>
                        <th className="p-4">Chức danh / Vị trí</th>
                        <th className="p-4">Đơn vị & Phòng ban</th>
                        <th className="p-4">Số máy lẻ / Điện thoại</th>
                        <th className="p-4">Thư điện tử công vụ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              {staff.avatarUrl ? (
                                <img
                                  src={staff.avatarUrl}
                                  alt={staff.fullName}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                                  {staff.fullName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{staff.fullName}</div>
                                {staff.duties && (
                                  <div className="text-[11px] text-slate-500 font-normal line-clamp-1 max-w-xs mt-0.5">
                                    {staff.duties}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-emerald-800 font-bold">{staff.position}</td>
                          <td className="p-4 space-y-0.5">
                            <div className="font-medium text-slate-800">{staff.unit?.name || 'Ban Quản lý MBS'}</div>
                            {staff.department && (
                              <div className="text-xs text-slate-500">{staff.department.name}</div>
                            )}
                          </td>
                          <td className="p-4 font-mono">
                            {staff.extension && (
                              <div className="font-bold text-emerald-800">
                                Máy lẻ (Ext): {staff.extension}
                              </div>
                            )}
                            {staff.phone ? (
                              <a
                                href={`tel:${staff.phone.replace(/\s+/g, '')}`}
                                className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{staff.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                          <td className="p-4 font-mono">
                            {staff.email ? (
                              <a
                                href={`mailto:${staff.email}`}
                                className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                              >
                                <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>{staff.email}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LOCATIONS & INTERACTIVE MAP (TRỤ SỞ & BẢN ĐỒ) */}
        {/* ======================================================== */}
        {activeMainTab === 'locations' && (
          <div className="space-y-8 animate-in fade-in duration-300">
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Contact Options & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-base font-black text-slate-900 uppercase border-b border-slate-100 pb-3">
                    KÊNH LIÊN HỆ & PHẢN ÁNH NHANH 24/7
                  </h3>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Tổng đài Trực ban Môi trường</h4>
                          <span className="text-[11px] text-emerald-200">Tiếp nhận thông tin 24/7</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2">
                        <span className="text-xs text-emerald-200 block font-semibold">Đường dây nóng phản ánh khẩn cấp</span>
                        <a href="tel:1900888868" className="text-2xl font-black font-mono tracking-tight text-yellow-300 block hover:text-white transition-colors">
                          1900 8888 68
                        </a>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2">
                        <span className="text-xs text-emerald-200 block font-semibold">Tổng đài Hành chính Trụ sở chính</span>
                        <a href="tel:02838221234" className="text-xl font-bold font-mono tracking-tight text-white block hover:text-yellow-300 transition-colors">
                          (028) 3822 1234
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
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

                  <div className="rounded-xl overflow-hidden border border-slate-300 bg-slate-900 h-64 relative flex items-center justify-center text-center p-6 shadow-inner">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
