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
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { fetchApi } from '../../services/api-client';

export interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'overview' | 'reports';
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate, subTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>(subTab);
  const [reportDepartment, setReportDepartment] = useState('all');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const stats = [
    {
      label: 'Lượt xem bài viết',
      value: analyticsData?.totalViewsToday ? String(analyticsData.totalViewsToday) : '0',
      change: 'Tổng lượt xem',
      isUp: true,
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: 'Tổng số bài viết',
      value: analyticsData?.totalPosts !== undefined ? String(analyticsData.totalPosts) : '0',
      change: 'Đã xuất bản & nháp',
      isUp: true,
      icon: <TrendingUp className="w-5 h-5 text-teal-400" />,
    },
    {
      label: 'Văn bản Pháp quy',
      value: analyticsData?.totalDocuments !== undefined ? String(analyticsData.totalDocuments) : '0',
      change: 'Kho văn bản DB',
      isUp: true,
      icon: <Users className="w-5 h-5 text-sky-400" />,
    },
    {
      label: 'Hồ sơ DVC đang xử lý',
      value: analyticsData?.pendingSubmissionsCount !== undefined ? String(analyticsData.pendingSubmissionsCount) : '0',
      change: `${analyticsData?.totalSubmissions || 0} tổng hồ sơ`,
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

  const topViewedPosts = analyticsData?.topPosts || [];
  const reportData = analyticsData?.departmentReports || [];

  const filteredReportData = reportDepartment === 'all'
    ? reportData
    : reportData.filter((r: any) => r.dept.toLowerCase().includes(reportDepartment.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            {activeTab === 'overview' ? 'Tổng quan Báo cáo & Thống kê' : 'Báo cáo Nghiệp vụ Chi tiết'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trung tâm điều hành thông tin và phân tích chỉ số hoạt động Cổng thông tin điện tử MBS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              )}
            >
              Dashboard Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={cn(
                'px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              )}
            >
              Báo cáo Nghiệp vụ
            </button>
          </div>

          {activeTab === 'reports' && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-slate-900 border-slate-700 text-white hover:bg-slate-800">
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Xuất Excel / PDF
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'overview' ? (
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
                {topViewedPosts.map((post, i) => (
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
      ) : (
        /* Analytics Reports Detailed Subtab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Thống kê Giải quyết Thủ tục Hành chính theo Phòng ban</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kỳ báo cáo: Tháng 02/2026 (Tỷ lệ đúng hạn toàn hệ thống đạt 98.2%)</p>
            </div>

            <select
              value={reportDepartment}
              onChange={(e) => setReportDepartment(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả phòng ban chuyên môn</option>
              <option value="qlmt">Phòng Quản lý Môi trường</option>
              <option value="ktcn">Phòng Kỹ thuật & Công nghệ</option>
              <option value="vp">Văn phòng Ban</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Phòng ban / Đơn vị thụ lý</th>
                  <th className="p-4 text-center">Tổng số hồ sơ</th>
                  <th className="p-4 text-center">Đã hoàn tất đúng hạn</th>
                  <th className="p-4 text-center">Đang thụ lý</th>
                  <th className="p-4 text-right">Tỷ lệ đúng hạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredReportData.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-850 transition-colors">
                    <td className="p-4 font-bold text-white">{row.dept}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-300">{row.total}</td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-400">{row.completed}</td>
                    <td className="p-4 text-center font-mono font-bold text-amber-400">{row.processing}</td>
                    <td className="p-4 text-right font-mono font-black text-emerald-400">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
