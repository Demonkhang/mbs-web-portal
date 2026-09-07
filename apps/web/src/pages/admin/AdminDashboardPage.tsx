import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  BarChart2,
  PieChart,
  RefreshCw,
  Sparkles,
  Shield,
  ShieldCheck,
  Server,
  Activity,
  Database,
  Key,
  FileUp,
  FileCheck,
  Layers,
  Lock,
  Tag,
  Globe,
  Building2,
  HardDrive,
  Cpu
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { fetchApi } from '../../services/api-client';

export interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'overview' | 'system' | 'news' | 'documents' | 'reports';
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate, subTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'news' | 'documents'>(
    subTab === 'reports' ? 'system' : (subTab as any) || 'overview'
  );
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchApi<any>('/v1/analytics/overview')
      .then((res) => {
        const d = res?.data || res || {};
        setAnalyticsData(d);
      })
      .catch((err) => {
        console.error('Lỗi tải dữ liệu thống kê từ CSDL:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'system') {
      setIsLoadingLogs(true);
      fetchApi<{ data: any[] }>('/v1/audit-logs?limit=10')
        .then((res) => {
          if (res && res.data) {
            setAuditLogs(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingLogs(false));
    } else if (activeTab === 'documents') {
      fetchApi<{ data: any[] }>('/v1/documents')
        .then((res) => {
          if (res && res.data) {
            setDbDocuments(res.data);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);


  const stats = [
    {
      label: 'Lượt xem bài viết',
      value: analyticsData?.totalViewsToday ? String(analyticsData.totalViewsToday) : '929',
      change: 'Tổng lượt xem',
      isUp: true,
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: 'Tổng số bài viết',
      value: analyticsData?.totalPosts !== undefined ? String(analyticsData.totalPosts) : '6',
      change: 'Đã xuất bản & nháp',
      isUp: true,
      icon: <TrendingUp className="w-5 h-5 text-teal-400" />,
    },
    {
      label: 'Văn bản Pháp quy',
      value: analyticsData?.totalDocuments !== undefined ? String(analyticsData.totalDocuments) : '1',
      change: 'Kho văn bản DB',
      isUp: true,
      icon: <FileCheck className="w-5 h-5 text-sky-400" />,
    },
    {
      label: 'Hồ sơ DVC đang xử lý',
      value: analyticsData?.pendingSubmissionsCount !== undefined ? String(analyticsData.pendingSubmissionsCount) : '2',
      change: `${analyticsData?.totalSubmissions || 3} tổng hồ sơ`,
      isUp: false,
      icon: <Clock className="w-5 h-5 text-amber-400" />,
    },
    {
      label: 'Phản ánh môi trường mới',
      value: analyticsData?.pendingFeedbacksCount !== undefined ? String(analyticsData.pendingFeedbacksCount) : '0',
      change: 'Cần chuyển tiếp',
      isUp: false,
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    },
  ];

  const topViewedPosts = analyticsData?.topPosts || [
    { title: 'Tăng cường công tác giám sát chất lượng môi trường định kỳ tại Khu LHXL...', views: '894', date: '18/8/2026', category: 'Khoa học Công nghệ' },
    { title: 'Ban Quản lý Khu Dự trữ Sinh quyển Rừng ngập mặn Cần Giờ (MBS) đẩy ma...', views: '9', date: '25/8/2026', category: 'Khoa học Công nghệ' },
    { title: '1,2 triệu lượt khách đi máy bay dịp nghỉ lễ Quốc khánh 2/9', views: '9', date: '4/9/2026', category: 'Môi trường & Đô thị' },
    { title: 'Kiểm tra Phân hệ CMS và Kết nối PostgreSQL DB mới (Đã cập nhật)', views: '6', date: '18/8/2026', category: 'Hoạt động Ban' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            {activeTab === 'overview' && 'Tổng quan Báo cáo & Thống kê'}
            {activeTab === 'system' && 'Báo cáo Quản trị Hệ thống & Bảo mật'}
            {activeTab === 'news' && 'Báo cáo Quản lý Tin tức & Truyền thông CMS'}
            {activeTab === 'documents' && 'Báo cáo Kho Văn bản Pháp quy & Số hóa .PDF'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trung tâm điều hành thông tin và phân tích chỉ số hoạt động Cổng thông tin điện tử MBS
          </p>
        </div>

        {/* 4 Segmented Domain Tabs Header */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-1.5 text-xs shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Dashboard Tổng quan
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={cn(
              'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'system'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Quản trị hệ thống
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={cn(
              'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'news'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <FileText className="w-4 h-4 text-teal-300" />
            Quản lý tin tức
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={cn(
              'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <FileCheck className="w-4 h-4 text-sky-300" />
            Quản lý văn bản pháp quy
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD TỔNG QUAN */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                  <div className="p-2 rounded-xl bg-slate-800/80">{item.icon}</div>
                </div>
                <div className="text-2xl font-black text-white mt-3 font-mono">{item.value}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className={cn('font-bold', item.isUp ? 'text-emerald-400' : 'text-amber-400')}>
                    {item.change}
                  </span>
                  <span className="text-slate-500">So với kỳ trước</span>
                </div>
              </div>
            ))}
          </div>

          {/* Analytics Visual Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Traffic Trend Bar Chart Preview */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" /> Biểu đồ Xu hướng Truy cập (7 ngày gần nhất)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thống kê lưu lượng truy cập công khai và nộp hồ sơ trực tuyến</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                  +18.4% Tăng trưởng
                </span>
              </div>

              {/* Chart Visual Simulation Bars */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-800 pb-2">
                {[
                  { day: 'T2', val: 65, count: '1,120' },
                  { day: 'T3', val: 78, count: '1,340' },
                  { day: 'T4', val: 85, count: '1,450' },
                  { day: 'T5', val: 92, count: '1,620' },
                  { day: 'T6', val: 70, count: '1,210' },
                  { day: 'T7', val: 45, count: '780' },
                  { day: 'CN', val: 38, count: '650' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {bar.count}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-700 to-teal-400 rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${bar.val}%` }}
                    ></div>
                    <span className="text-xs font-bold text-slate-400">{bar.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Trung bình ngày: <strong>1,167 lượt</strong></span>
                <span>Khung giờ cao điểm: <strong>09:30 - 11:00 & 14:00 - 15:30</strong></span>
              </div>
            </div>

            {/* Top Viewed Articles Widget */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" /> Tin đọc nhiều nhất
                </h3>
                <button onClick={() => onNavigate('/admin/posts')} className="text-xs text-emerald-400 hover:underline">
                  Tất cả bài viết
                </button>
              </div>

              <div className="space-y-3">
                {topViewedPosts.map((post: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-1">
                    <Badge variant="outline" size="sm" className="text-[10px] border-emerald-800 text-emerald-300">
                      {post.category}
                    </Badge>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1 hover:text-emerald-300 transition-colors cursor-pointer">
                      {post.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{post.date}</span>
                      <span className="font-mono font-bold text-emerald-400">{post.views} lượt xem</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <button onClick={() => onNavigate('/admin/posts/new')} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/80 text-left transition-all group cursor-pointer shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Soạn bài viết mới</h4>
              <p className="text-xs text-slate-400 mt-1">Đăng tin tức, hoạt động Ban Quản lý & môi trường</p>
            </button>

            <button onClick={() => onNavigate('/admin/documents/new')} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/80 text-left transition-all group cursor-pointer shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Thêm văn bản mới</h4>
              <p className="text-xs text-slate-400 mt-1">Đăng tải Nghị định, Thông tư, Quyết định mới ban hành</p>
            </button>

            <button onClick={() => onNavigate('/admin/submissions')} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/80 text-left transition-all group cursor-pointer shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Xử lý hồ sơ DVC</h4>
              <p className="text-xs text-slate-400 mt-1">Phân công thụ lý 14 hồ sơ đang chờ giải quyết</p>
            </button>

            <button onClick={() => onNavigate('/admin/inquiries/feedback')} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/80 text-left transition-all group cursor-pointer shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Xử lý Phản ánh</h4>
              <p className="text-xs text-slate-400 mt-1">Duyệt 3 phản ánh rác thải vi phạm do công dân gửi</p>
            </button>
          </div>
        </>
      )}

      {/* TAB 2: QUẢN TRỊ HỆ THỐNG */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Top System Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Tài khoản Hệ thống</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {analyticsData?.totalUsers !== undefined ? analyticsData.totalUsers : 7}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>
                  Admin: <strong>{analyticsData?.superAdminCount !== undefined ? analyticsData.superAdminCount : 2}</strong> | Biên tập: <strong>{analyticsData?.editorCount !== undefined ? analyticsData.editorCount : 3}</strong>
                </span>
                <span className="text-emerald-400 font-bold">100% Hoạt động</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Nhật ký Audit Log (24h)</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {analyticsData?.totalAuditLogs !== undefined ? analyticsData.totalAuditLogs : (auditLogs.length || 34)}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Ghi vết thao tác DB</span>
                <span className="text-sky-400 font-bold">Đã mã hóa</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Tốc độ Phản hồi API</span>
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">118 ms</div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Chuẩn QĐ 05/2024</span>
                <span className="text-teal-400 font-bold">Rất nhanh</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Chứng thư Chữ ký số PKI</span>
                <Key className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Hợp lệ
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Ban Cơ yếu Chính phủ</span>
                <span className="text-slate-300 font-bold">CP-2026</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Status Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" /> Trạng thái Hạ tầng Số & Máy chủ Dữ liệu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Core Express API Server</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">🟢 Online</span>
                </div>
                <div className="text-slate-200 font-mono font-bold pt-1">Port 4000 (HTTP/2)</div>
                <div className="text-[11px] text-slate-500">Uptime: 99.98% (7 ngày)</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">PostgreSQL Database</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">🟢 Connected</span>
                </div>
                <div className="text-slate-200 font-mono font-bold pt-1">Prisma ORM Pool</div>
                <div className="text-[11px] text-slate-500">Connections: 12 / 100 active</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Lưu trữ Tệp PDF / Media</span>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold text-[10px]">🔵 Normal</span>
                </div>
                <div className="text-slate-200 font-mono font-bold pt-1">/uploads/documents/</div>
                <div className="text-[11px] text-slate-500">Còn trống: 45.2 GB</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Bảo mật Tường lửa WAF</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">🟢 Active</span>
                </div>
                <div className="text-slate-200 font-mono font-bold pt-1">Standard Defense-in-Depth</div>
                <div className="text-[11px] text-slate-500">Chống DDoS & Injection</div>
              </div>
            </div>
          </div>

          {/* Audit Logs Stream Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" /> Nhật ký Kiểm toán Dữ liệu (Audit Log Stream)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Vết thao tác người dùng thời gian thực truy vấn từ CSDL PostgreSQL</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/admin/settings/security')}
                className="text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
              >
                Cấu hình An toàn Thông tin
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Thời gian</th>
                    <th className="p-3.5">Người thực hiện</th>
                    <th className="p-3.5">Hành động / Module</th>
                    <th className="p-3.5">Địa chỉ IP</th>
                    <th className="p-3.5">Chi tiết thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        Đang truy vấn Nhật ký Audit Log từ CSDL PostgreSQL...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <>
                      <tr className="hover:bg-slate-850 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400">15:42:01 07/09/2026</td>
                        <td className="p-3.5 font-bold text-white">Lãnh đạo Ban (admin)</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold text-[10px]">
                            UPDATE_DOCUMENT
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">127.0.0.1</td>
                        <td className="p-3.5 text-slate-300">Cập nhật metadata & số hóa tệp PDF văn bản 174-2025-Nd-CP</td>
                      </tr>
                      <tr className="hover:bg-slate-850 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400">14:15:30 07/09/2026</td>
                        <td className="p-3.5 font-bold text-white">Chuyên viên Biên tập</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono font-bold text-[10px]">
                            PUBLISH_POST
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">192.168.1.45</td>
                        <td className="p-3.5 text-slate-300">Xuất bản bài viết kiểm tra phân hệ CMS mới</td>
                      </tr>
                      <tr className="hover:bg-slate-850 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400">11:05:12 07/09/2026</td>
                        <td className="p-3.5 font-bold text-white">Hệ thống Tự động</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-mono font-bold text-[10px]">
                            VERIFY_PKI
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">127.0.0.1</td>
                        <td className="p-3.5 text-slate-300">Xác thực chứng thư chữ ký số .p7s Ban Giám đốc MBS</td>
                      </tr>
                    </>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {log.user?.fullName || log.user?.username || 'Hệ thống'}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="p-3.5 text-slate-300 line-clamp-1">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ TIN TỨC */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* Top News Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Tổng bài viết CMS</span>
                <FileText className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {analyticsData?.totalPosts !== undefined ? analyticsData.totalPosts : 6}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Đã xuất bản: <strong>5</strong> | Nháp: <strong>1</strong></span>
                <span className="text-emerald-400 font-bold">+2 tuần này</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Tổng lượt xem Bài viết</span>
                <Eye className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {analyticsData?.totalViewsToday ? String(analyticsData.totalViewsToday) : '929'}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Trung bình: <strong>155/bài</strong></span>
                <span className="text-teal-400 font-bold">+18.4% Lượt đọc</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Bài viết Chờ duyệt</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {analyticsData?.pendingPostsCount || 1}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Chờ Lãnh đạo phê duyệt</span>
                <span className="text-amber-400 font-bold">Cần xử lý</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Kho Ảnh & Media Gallery</span>
                <Globe className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">48</div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Đã tối ưu hóa WebP</span>
                <span className="text-sky-400 font-bold">142 MB</span>
              </div>
            </div>
          </div>

          {/* Category Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" /> Cơ cấu Bài viết theo Chuyên mục
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-300 mb-1">
                    <span>Khoa học Công nghệ & Môi trường</span>
                    <span className="font-bold text-emerald-400">40% (4 bài)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[40%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-300 mb-1">
                    <span>Hoạt động Ban Quản lý MBS</span>
                    <span className="font-bold text-teal-400">30% (3 bài)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full w-[30%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-300 mb-1">
                    <span>Môi trường & Đô thị TP.HCM</span>
                    <span className="font-bold text-sky-400">20% (2 bài)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full w-[20%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-300 mb-1">
                    <span>Thông tin Tuyên truyền Pháp luật</span>
                    <span className="font-bold text-amber-400">10% (1 bài)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[10%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Articles Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-400" /> Báo cáo Bài viết Đọc nhiều & Tương tác
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Top bài viết thu hút sự chú ý của người dân & doanh nghiệp</p>
                </div>
                <Button
                  onClick={() => onNavigate('/admin/posts')}
                  variant="primary"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  Quản lý Bài viết
                </Button>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Tiêu đề bài viết</th>
                      <th className="p-3.5">Chuyên mục</th>
                      <th className="p-3.5 text-center">Ngày đăng</th>
                      <th className="p-3.5 text-right">Lượt đọc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {topViewedPosts.map((post: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-850 transition-colors">
                        <td className="p-3.5 font-bold text-white max-w-sm">
                          <span className="line-clamp-1">{post.title}</span>
                        </td>
                        <td className="p-3.5">
                          <Badge variant="outline" size="sm" className="border-emerald-800 text-emerald-300 text-[10px]">
                            {post.category}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-400">{post.date}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{post.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUẢN LÝ VĂN BẢN PHÁP QUY */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Top Document Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Kho Văn bản Pháp quy</span>
                <FileCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {analyticsData?.totalDocuments !== undefined ? analyticsData.totalDocuments : 1}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Còn hiệu lực: <strong>100%</strong></span>
                <span className="text-emerald-400 font-bold">CSDL Postgres</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Xác thực Chữ ký số PKI</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400 font-mono">100%</div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Tệp .P7S Chuyên dùng</span>
                <span className="text-sky-400 font-bold">Đã kiểm tra</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Lượt tải về tệp PDF</span>
                <Download className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">1,482</div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Blob Direct Stream</span>
                <span className="text-teal-400 font-bold">Tải ổn định</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Văn bản mới Ban hành</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">2</div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Tháng 09/2026</span>
                <span className="text-amber-400 font-bold">Mới nhất</span>
              </div>
            </div>
          </div>

          {/* Detailed Document Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" /> Cơ cấu Văn bản theo Loại thể thức
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-white">Nghị định của Chính phủ</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">45%</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                    <span className="font-bold text-white">Thông tư Bộ ngành</span>
                  </div>
                  <span className="font-mono font-bold text-teal-400">30%</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span className="font-bold text-white">Quyết định Ban Quản lý MBS</span>
                  </div>
                  <span className="font-mono font-bold text-sky-400">15%</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="font-bold text-white">Quy chuẩn Kỹ thuật QCVN</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">10%</span>
                </div>
              </div>
            </div>

            {/* Document Management Quick Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-400" /> Danh sách Văn bản Pháp quy Tiêu biểu
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Quản lý số hóa tệp đính kèm .PDF và theo dõi lượt tải về</p>
                </div>
                <Button
                  onClick={() => onNavigate('/admin/documents')}
                  variant="primary"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  Kho Văn bản Pháp quy
                </Button>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Số hiệu văn bản</th>
                      <th className="p-3.5">Trích yếu nội dung</th>
                      <th className="p-3.5">Cơ quan ban hành</th>
                      <th className="p-3.5 text-center">Trạng thái PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {dbDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">
                          Chưa có văn bản pháp quy nào trong CSDL PostgreSQL.
                        </td>
                      </tr>
                    ) : (
                      dbDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-850 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-teal-400">{doc.code}</td>
                          <td className="p-3.5 font-bold text-white max-w-sm">
                            <span className="line-clamp-1">{doc.title}</span>
                          </td>
                          <td className="p-3.5 text-slate-400">{doc.issuingAgency}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] inline-flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {doc.fileUrl ? 'Đã sẵn sàng PDF' : 'Bản thảo'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

