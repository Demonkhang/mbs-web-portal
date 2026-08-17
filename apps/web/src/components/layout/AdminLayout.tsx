import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Inbox,
  Image as ImageIcon,
  Users,
  Calendar,
  ShieldAlert,
  Search,
  Bell,
  UserCheck,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  LogOut,
  Sliders,
  FolderTree,
  FileCode,
  Sparkles,
  BarChart3,
  CheckSquare,
  HelpCircle,
  BookOpen,
  MapPin,
  Vote,
  Layers,
  History,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, onLogout, children }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const menuSections = [
    {
      title: 'TỔNG QUAN & BÁO CÁO',
      items: [
        { label: 'Dashboard Thống kê', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Báo cáo Nghiệp vụ', path: '/admin/analytics/reports', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      title: 'QUẢN LÝ NỘI DUNG (CMS)',
      items: [
        { label: 'Danh sách Bài viết', path: '/admin/posts', icon: <FileText className="w-4 h-4" /> },
        { label: 'Hàng đợi Phê duyệt', path: '/admin/posts/approvals', icon: <CheckSquare className="w-4 h-4" />, badge: '3' },
        { label: 'Chuyên mục Tin', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
        { label: 'Quản lý Trang tĩnh', path: '/admin/pages', icon: <FileCode className="w-4 h-4" /> },
      ],
    },
    {
      title: 'VĂN BẢN PHÁP QUY',
      items: [
        { label: 'Kho Văn bản Quy phạm', path: '/admin/documents', icon: <FileCheck className="w-4 h-4" /> },
        { label: 'Thêm mới Văn bản', path: '/admin/documents/new', icon: <PlusCircle className="w-4 h-4" /> },
      ],
    },
    {
      title: 'DỊCH VỤ CÔNG & PHẢN ÁNH',
      items: [
        { label: 'Hồ sơ Dịch vụ công', path: '/admin/submissions', icon: <Inbox className="w-4 h-4" />, badge: '12' },
        { label: 'Phản ánh Môi trường', path: '/admin/inquiries/feedback', icon: <MapPin className="w-4 h-4" />, badge: '2' },
        { label: 'Hỏi - Đáp / FAQ', path: '/admin/inquiries/faq', icon: <HelpCircle className="w-4 h-4" /> },
        { label: 'Thiết lập Form Động', path: '/admin/forms/builder', icon: <Sliders className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ĐA PHƯƠNG TIỆN & ẤN PHẨM',
      items: [
        { label: 'Kho Đa phương tiện', path: '/admin/media', icon: <ImageIcon className="w-4 h-4" /> },
        { label: 'Ấn phẩm E-Magazine', path: '/admin/e-magazine', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
    {
      title: 'TỔ CHỨC & DÂN BẠ',
      items: [
        { label: 'Sơ đồ Tổ chức', path: '/admin/organization', icon: <FolderTree className="w-4 h-4" /> },
        { label: 'Danh bạ Cán bộ', path: '/admin/staff', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: 'TIỆN ÍCH & LỊCH',
      items: [
        { label: 'Lịch Công tác Tuần', path: '/admin/schedules', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Khảo sát & Thăm dò', path: '/admin/polls', icon: <Vote className="w-4 h-4" /> },
        { label: 'Banner & Liên kết', path: '/admin/banners', icon: <Layers className="w-4 h-4" /> },
      ],
    },
    {
      title: 'HỆ THỐNG & AN NINH',
      items: [
        { label: 'Người dùng & Phân quyền', path: '/admin/users', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Nhật ký Audit Log', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
        { label: 'Cấu hình & Sao lưu', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sleek Dark Sidebar Navigation */}
      <aside className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl z-30">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-wide leading-none">MBS PORTAL</h1>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-1">Admin CMS v2.5</span>
              </div>
            </div>
          </div>

          {/* Navigation Links Scroll Container */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-800">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90">
                  {section.title}
                </h3>
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/admin/dashboard');
                    return (
                      <button
                        key={item.path}
                        onClick={() => onNavigate(item.path)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group',
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold shadow-md shadow-emerald-950/50'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn('transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400')}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={cn(
                            'px-2 py-0.5 text-[10px] font-bold rounded-full',
                            isActive ? 'bg-white/20 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Quick Switcher & Public Portal Return */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700/60 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Website Public</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Global Search Bar */}
          <div className="relative w-72 sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm nhanh bài viết, văn bản, hồ sơ DVC..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Create Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 cursor-pointer transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tạo mới</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isQuickCreateOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <button onClick={() => { onNavigate('/admin/posts/new'); setIsQuickCreateOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Soạn bài viết mới
                  </button>
                  <button onClick={() => { onNavigate('/admin/documents/new'); setIsQuickCreateOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                    <FileCheck className="w-3.5 h-3.5 text-teal-400" /> Thêm văn bản mới
                  </button>
                  <button onClick={() => { onNavigate('/admin/polls'); setIsQuickCreateOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                    <Vote className="w-3.5 h-3.5 text-amber-400" /> Tạo khảo sát mới
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 relative cursor-pointer transition-colors"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-white">Thông báo mới nhất</h4>
                    <span className="text-[10px] text-emerald-400 font-semibold cursor-pointer">Đánh dấu đã đọc</span>
                  </div>
                  <div className="space-y-3 py-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800">
                      <p className="font-semibold text-slate-200">Hồ sơ DVC mới #MBS-2026-A92B4</p>
                      <span className="text-[10px] text-slate-400">5 phút trước • Cấp phép tiếp nhận chất thải</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800">
                      <p className="font-semibold text-amber-300">Phản ánh mùi hôi tại trạm trung chuyển</p>
                      <span className="text-[10px] text-slate-400">12 phút trước • Từ người dân Bình Chánh</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80"
                  alt="Admin Avatar"
                  className="w-7 h-7 rounded-lg object-cover ring-2 ring-emerald-500/50"
                />
                <div className="text-left hidden md:block">
                  <span className="text-xs font-bold text-white block leading-none">TS. Nguyễn Văn Hùng</span>
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase block mt-0.5">SuperAdmin</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="font-bold text-white">TS. Nguyễn Văn Hùng</p>
                    <p className="text-[10px] text-slate-400">admin@mbs.hochiminhcity.gov.vn</p>
                  </div>
                  <button onClick={() => { onNavigate('/admin/settings'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Cài đặt hệ thống
                  </button>
                  <button onClick={() => { onNavigate('/admin/audit-logs'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Nhật ký thao tác
                  </button>
                  <div className="my-1 border-t border-slate-800"></div>
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      else onNavigate('/admin/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/60 text-rose-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route View Content */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
