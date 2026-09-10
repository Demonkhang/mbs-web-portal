import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Inbox,
  Image as ImageIcon,
  Users,
  Calendar,
  Search,
  Bell,
  UserCheck,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  LogOut,
  Sliders,
  FolderTree,
  Sparkles,
  BarChart3,
  HelpCircle,
  MapPin,
  History,
  ShieldAlert,
  ArrowLeft,
  ShieldCheck,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchApi } from '../../services/api-client';
import { isRouteAllowed, ROLE_DEFINITIONS, UserRole } from '../../lib/permission.utils';

import { NotificationBellDropdown } from '../shared/NotificationBellDropdown';

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

  // Dynamic Logged In User Profile from DB API
  const [currentUser, setCurrentUser] = useState<{
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    permissions?: string[];
  }>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mbs_admin_user') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.fullName || parsed.username)) {
          return {
            fullName: parsed.fullName || parsed.username,
            email: parsed.email || 'canbo@mbs.hochiminhcity.gov.vn',
            role: (parsed.role as UserRole) || 'SUPER_ADMIN',
            avatarUrl: parsed.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            permissions: parsed.permissions || [],
          };
        }
      } catch {}
    }
    return {
      fullName: 'Lưu Chử Khang',
      email: 'khang.tt@mbs.hochiminhcity.gov.vn',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      permissions: [],
    };
  });

  const [badgeCounts, setBadgeCounts] = useState<{
    pendingPosts: number;
    pendingSubmissions: number;
    pendingFeedbacks: number;
  }>({ pendingPosts: 0, pendingSubmissions: 0, pendingFeedbacks: 0 });

  const loadCurrentUser = () => {
    fetchApi<any>('/v1/users/me')
      .then((res) => {
        const u = res?.data?.user || res?.data || res;
        if (u && (u.fullName || u.username)) {
          const updated = {
            fullName: u.fullName || u.username,
            email: u.email || 'canbo@mbs.hochiminhcity.gov.vn',
            role: (u.role as UserRole) || 'SUPER_ADMIN',
            avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            permissions: u.permissions || [],
          };
          setCurrentUser(updated);
          localStorage.setItem('mbs_admin_user', JSON.stringify(updated));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Load logged-in user profile from Backend API GET /api/v1/users/me
    loadCurrentUser();

    // Listen for live matrix updates
    const handlePermissionsUpdated = () => {
      loadCurrentUser();
    };
    window.addEventListener('mbs_permissions_updated', handlePermissionsUpdated);

    // Fetch real-time badge counts from PostgreSQL DB via GET /api/v1/analytics/overview
    fetchApi<any>('/v1/analytics/overview')
      .then((res) => {
        const d = res?.data || res || {};
        setBadgeCounts({
          pendingPosts: d.pendingPostsCount || 0,
          pendingSubmissions: d.pendingSubmissionsCount || d.pendingSubmissions || 0,
          pendingFeedbacks: d.pendingFeedbacksCount || 0,
        });
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('mbs_permissions_updated', handlePermissionsUpdated);
    };
  }, []);

  const roleMeta = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.SUPER_ADMIN;

  // Full Menu Sections Restructured into Standard 4 Groups
  const fullMenuSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Dashboard Thống kê', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Báo cáo Nghiệp vụ', path: '/admin/analytics/reports', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      title: 'QUẢN TRỊ HỆ THỐNG & CÁN BỘ',
      items: [
        { label: 'Quản lý Cán bộ & Tài khoản', path: '/admin/users', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Ma trận Phân quyền (RBAC)', path: '/admin/roles', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Sao lưu & Phục hồi Dữ liệu', path: '/admin/backup', icon: <Database className="w-4 h-4" /> },
        { label: 'Nhật ký & Audit Logs', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'QUẢN LÝ TIN BÀI & TRUYỀN THÔNG',
      items: [
        { label: 'Quản lý Bài viết', path: '/admin/posts', icon: <FileText className="w-4 h-4" /> },
        {
          label: 'Hàng đợi Phê duyệt',
          path: '/admin/approvals',
          icon: <FileCheck className="w-4 h-4" />,
          badge: badgeCounts.pendingPosts > 0 ? String(badgeCounts.pendingPosts) : undefined,
        },
        { label: 'Chuyên mục & Trang tĩnh', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
        { label: 'Thư viện Đa phương tiện', path: '/admin/media', icon: <ImageIcon className="w-4 h-4" /> },
      ],
    },
    {
      title: 'VĂN BẢN PHÁP QUY & CHỈ ĐẠO',
      items: [
        { label: 'Kho Văn bản Quy phạm', path: '/admin/documents', icon: <FileCheck className="w-4 h-4" /> },
        {
          label: 'Hồ sơ Dịch vụ công',
          path: '/admin/submissions',
          icon: <Inbox className="w-4 h-4" />,
          badge: badgeCounts.pendingSubmissions > 0 ? String(badgeCounts.pendingSubmissions) : undefined,
        },
        {
          label: 'Phản ánh Môi trường & Ý kiến',
          path: '/admin/inquiries/feedback',
          icon: <MapPin className="w-4 h-4" />,
          badge: badgeCounts.pendingFeedbacks > 0 ? String(badgeCounts.pendingFeedbacks) : undefined,
        },
        { label: 'Lịch công tác & Khảo sát', path: '/admin/schedules', icon: <Calendar className="w-4 h-4" /> },
      ],
    },
  ];

  // Filter Sidebar items strictly based on user role permission & permissions array!
  const menuSections = fullMenuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isRouteAllowed(currentUser.role, item.path, currentUser.permissions)),
    }))
    .filter((section) => section.items.length > 0);

  // Check if current route is allowed for this role
  const isAllowed = isRouteAllowed(currentUser.role, currentPath, currentUser.permissions);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sleek Dark Streamlined Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl z-30">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xs font-black text-white tracking-wide leading-none">MBS PORTAL</h1>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mt-1">Admin CMS v2.5</span>
              </div>
            </div>
          </div>

          {/* Navigation Links Scroll Container */}
          <div className="p-2.5 space-y-4 overflow-y-auto max-h-[calc(100vh-130px)] scrollbar-thin scrollbar-thumb-slate-800">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-2.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400/80">
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
                          'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group',
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold shadow-md shadow-emerald-950/50'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn('transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400')}>
                            {item.icon}
                          </span>
                          <span className="truncate text-[11px]">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={cn(
                            'px-1.5 py-0.5 text-[9px] font-bold rounded-full',
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

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-emerald-500/40 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white truncate block">{currentUser.fullName}</span>
                <span className={cn('text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider block mt-0.5 w-fit', roleMeta.badgeClass)}>
                  {roleMeta.code}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onLogout) onLogout();
                else onNavigate('/admin/login');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Cổng Thông Tin Public</span>
            </button>
          </div>

          {/* User Profile Header Right */}
          <div className="flex items-center gap-3">
            <NotificationBellDropdown onNavigate={onNavigate} />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-md object-cover"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{currentUser.fullName}</span>
                <span className="text-[10px] text-slate-400 block">{roleMeta.title}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Render Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {!isAllowed ? (
            /* 403 Forbidden Screen for unauthorized paths */
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 shadow-xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">403 FORBIDDEN - KHÔNG ĐỦ QUYỀN HẠN</h2>
              <p className="text-xs text-slate-400 max-w-md">
                Tài khoản của bạn đang có vai trò <strong>{roleMeta.title} ({currentUser.role})</strong> không được cấp quyền truy cập vào đường dẫn <code>{currentPath}</code>.
              </p>
              <button
                onClick={() => onNavigate('/admin/dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại Trang Bảng điều khiển (Dashboard)
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
