import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Vote,
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  FolderArchive,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { fetchApi } from '../../services/api-client';
import { formatDate } from '../../lib/utils';
import { AdminScheduleImportModal } from '../../components/admin/AdminScheduleImportModal';
import { AdminScheduleEditModal } from '../../components/admin/AdminScheduleEditModal';
import { ScheduleDetailModal } from '../../components/schedules/ScheduleDetailModal';
import { MOCK_POLLS } from '../../lib/mock-data';

export interface AdminSchedulesPollsPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'schedules' | 'polls' | 'banners';
}

interface WeekGroup {
  key: string;
  year: number;
  weekNumber: number;
  startDate?: string;
  endDate?: string;
  items: any[];
  publicCount: number;
}

export const AdminSchedulesPollsPage: React.FC<AdminSchedulesPollsPageProps> = ({ onNavigate, subTab = 'schedules' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedules' | 'polls' | 'banners'>(subTab);

  // Schedules state
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined);

  // Accordion Expand/Collapse state per week key (e.g. "2026-36")
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<any | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      let url = '/v1/schedules';
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear.toString());
      if (selectedWeek) params.append('week', selectedWeek.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetchApi<{ data: any[] }>(url);
      if (res && res.data) {
        setSchedules(res.data);

        // Auto expand the first/latest week group
        if (res.data.length > 0) {
          const firstItem = res.data[0];
          const firstKey = `${firstItem.year}-${firstItem.weekNumber}`;
          setExpandedWeeks((prev) => ({ ...prev, [firstKey]: true }));
        }
      }
    } catch (err) {
      console.error('Lỗi tải lịch công tác:', err);
      showToast('Lỗi khi tải dữ liệu lịch công tác từ CSDL.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedules') {
      loadSchedules();
    }
  }, [activeTab, selectedYear, selectedWeek]);

  const toggleWeekExpand = (key: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTogglePublic = async (item: any) => {
    try {
      const res = await fetchApi<{ data: any }>(`/v1/schedules/${item.id}/toggle-public`, {
        method: 'PATCH',
      });
      showToast(`Đã đổi chế độ sang ${res?.data?.isPublic ? 'Công khai' : 'Nội bộ'}!`, 'success');
      loadSchedules();
    } catch (err) {
      showToast('Không thể đổi trạng thái công khai.', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện lịch công tác này khỏi CSDL PostgreSQL?')) return;
    try {
      await fetchApi(`/v1/schedules/${id}`, { method: 'DELETE' });
      showToast('Xóa sự kiện lịch công tác thành công!', 'success');
      loadSchedules();
    } catch (err) {
      showToast('Không thể xóa sự kiện lịch công tác.', 'error');
    }
  };

  const handleDeleteEntireWeekGroup = async (year: number, weekNumber: number) => {
    if (!window.confirm(`XÁC NHẬN NGUY HIỂM: Bạn có chắc chắn muốn XÓA TOÀN BỘ TỆP LỊCH của Tuần ${weekNumber}/${year} khỏi CSDL PostgreSQL?`)) return;

    try {
      const res = await fetchApi<{ data: { count: number } }>(`/v1/schedules/week/${year}/${weekNumber}`, {
        method: 'DELETE',
      });
      showToast(`Đã xóa thành công toàn bộ ${res?.data?.count || 0} sự kiện của Tệp Lịch Tuần ${weekNumber}/${year}!`, 'success');
      loadSchedules();
    } catch (err) {
      showToast('Lỗi khi xóa tệp lịch tuần.', 'error');
    }
  };

  // Group schedules by Year & WeekNumber into Tệp Lịch Tuần
  const weekGroupsMap = schedules.reduce((acc: Record<string, WeekGroup>, item: any) => {
    const key = `${item.year}-${item.weekNumber}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        year: item.year,
        weekNumber: item.weekNumber,
        startDate: item.startDate,
        endDate: item.endDate,
        items: [],
        publicCount: 0,
      };
    }
    acc[key].items.push(item);
    if (item.isPublic) acc[key].publicCount++;
    return acc;
  }, {});

  const weekGroups = (Object.values(weekGroupsMap) as WeekGroup[]).sort((a: WeekGroup, b: WeekGroup) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNumber - a.weekNumber;
  });

  const bannersList = [
    { id: 'b1', name: 'Banner Tuyên truyền Chuyển đổi số MBS 2026', pos: 'Trang chủ Header Banner', link: 'https://mbs.tphcm.gov.vn' },
    { id: 'b2', name: 'Logo liên kết UBND Thành phố Hồ Chí Minh', pos: 'Footer Liên kết đơn vị', link: 'https://hochiminhcity.gov.vn' },
    { id: 'b3', name: 'Logo Sở Tài nguyên và Môi trường TP.HCM', pos: 'Footer Liên kết đơn vị', link: 'https://donre.hochiminhcity.gov.vn' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-amber-400" />
            {activeTab === 'schedules' && 'Quản lý Tệp Lịch Tuần Lãnh đạo'}
            {activeTab === 'polls' && 'Quản trị Khảo sát & Thăm dò Dư luận'}
            {activeTab === 'banners' && 'Quản lý Banner & Liên kết Web'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý tập trung từng Tệp Lịch Excel theo Tuần, hỗ trợ xổ xuống (Dropdown) chi tiết & xóa trọn tệp lịch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'schedules' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Lịch Công tác (Tệp Tuần)
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'polls' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Khảo sát dư luận
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'banners' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Banner & Liên kết
            </button>
          </div>

          {activeTab === 'schedules' && (
            <>
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" /> Import Tệp Excel Mới
              </button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setScheduleToEdit(null);
                  setIsEditOpen(true);
                }}
              >
                <Plus className="w-4 h-4" /> Thêm lịch thủ công
              </Button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
              <span className="font-bold text-slate-400">Lọc theo:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold cursor-pointer"
              >
                <option value={2026}>Năm 2026</option>
                <option value={2025}>Năm 2025</option>
              </select>

              <select
                value={selectedWeek || ''}
                onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold cursor-pointer"
              >
                <option value="">-- Tất cả các Tệp Lịch Tuần --</option>
                {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w < 10 ? `0${w}` : w}
                  </option>
                ))}
              </select>

              <button
                onClick={loadSchedules}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Tổng số: <strong className="text-amber-400">{weekGroups.length} Tệp Lịch Tuần</strong> ({schedules.length} bản ghi sự kiện)
            </div>
          </div>

          {/* Grouped Schedule Packages / Accordion Files */}
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              Đang nạp danh sách các Tệp Lịch Tuần từ CSDL PostgreSQL...
            </div>
          ) : weekGroups.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              Chưa có Tệp Lịch Tuần nào cho lựa chọn này. Vui lòng bấm nút <strong>Import Tệp Excel Mới</strong> để nạp lịch công tác.
            </div>
          ) : (
            <div className="space-y-4">
              {weekGroups.map((group) => {
                const isExpanded = !!expandedWeeks[group.key];
                return (
                  <div
                    key={group.key}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all"
                  >
                    {/* Tệp Lịch Header Card */}
                    <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div
                        onClick={() => toggleWeekExpand(group.key)}
                        className="flex items-center gap-3.5 cursor-pointer group flex-1"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                          <FolderArchive className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                              Tệp Lịch Tuần {group.weekNumber < 10 ? `0${group.weekNumber}` : group.weekNumber}/{group.year}
                            </h3>
                            {group.startDate && (
                              <span className="text-xs text-slate-400 font-mono">
                                ({formatDate(group.startDate)} {group.endDate ? `- ${formatDate(group.endDate)}` : ''})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-mono">
                              {group.items.length} sự kiện công tác
                            </span>
                            <span className="bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 text-emerald-400 font-bold">
                              {group.publicCount}/{group.items.length} Công khai
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteEntireWeekGroup(group.year, group.weekNumber)}
                          className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                          title="Xóa toàn bộ tệp lịch tuần này khỏi CSDL PostgreSQL"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa Toàn bộ Tệp Lịch
                        </button>

                        <button
                          onClick={() => {
                            setScheduleToEdit({ weekNumber: group.weekNumber, year: group.year });
                            setIsEditOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Thêm mới 1 sự kiện vào tệp lịch này"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" /> Thêm lịch
                        </button>

                        <button
                          onClick={() => toggleWeekExpand(group.key)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Event Table (Dropdown Content) */}
                    {isExpanded && (
                      <div className="overflow-x-auto border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-3.5">Thứ / Ngày</th>
                              <th className="p-3.5">Giờ</th>
                              <th className="p-3.5">Chủ trì / Lãnh đạo</th>
                              <th className="p-3.5">Nội dung công tác</th>
                              <th className="p-3.5">Địa điểm</th>
                              <th className="p-3.5 text-center">Chế độ</th>
                              <th className="p-3.5 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                            {group.items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-850 transition-colors">
                                <td className="p-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                                  {item.dayOfWeek}<br />
                                  <span className="text-[10px] text-slate-400 font-normal">{formatDate(item.date)}</span>
                                </td>
                                <td className="p-3.5 font-mono font-semibold text-slate-200 whitespace-nowrap">
                                  {item.timeSlot}
                                </td>
                                <td className="p-3.5 font-bold text-white whitespace-nowrap">
                                  {item.leaderName || '-'}
                                </td>
                                <td
                                  onClick={() => {
                                    setSelectedDetail(item);
                                    setIsDetailOpen(true);
                                  }}
                                  className="p-3.5 max-w-xs font-medium cursor-pointer hover:text-amber-400 transition-colors leading-snug"
                                  title="Bấm để xem chi tiết"
                                >
                                  {item.eventTitle}
                                </td>
                                <td className="p-3.5 text-slate-400 max-w-xs">{item.location || '-'}</td>
                                <td className="p-3.5 text-center whitespace-nowrap">
                                  <button
                                    onClick={() => handleTogglePublic(item)}
                                    className="cursor-pointer"
                                    title="Bấm để chuyển đổi Công khai / Nội bộ"
                                  >
                                    {item.isPublic ? (
                                      <Badge variant="success" size="sm">Công khai</Badge>
                                    ) : (
                                      <Badge variant="outline" size="sm">Nội bộ</Badge>
                                    )}
                                  </button>
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedDetail(item);
                                        setIsDetailOpen(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                      title="Xem chi tiết"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setScheduleToEdit(item);
                                        setIsEditOpen(true);
                                      }}
                                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                      title="Sửa sự kiện"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                      title="Xóa sự kiện"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'polls' && (
        <div className="space-y-4">
          {MOCK_POLLS.map((poll) => (
            <div key={poll.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm">Đang diễn ra</Badge>
                <span className="text-xs text-slate-400 font-mono">Tổng số vote: {poll.totalVotes} lượt</span>
              </div>
              <h3 className="text-base font-bold text-white">{poll.question}</h3>

              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                  return (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{opt.text}</span>
                        <span className="text-amber-400 font-mono">{pct}% ({opt.votes} vote)</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">Danh sách Banner & Logo Liên kết</h3>

          <div className="space-y-3">
            {bannersList.map((banner) => (
              <div key={banner.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{banner.name}</h4>
                  <span className="text-xs text-slate-500">{banner.pos} • {banner.link}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-slate-900 border-slate-800 text-slate-300">Sửa</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminScheduleImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadSchedules}
      />

      <AdminScheduleEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={loadSchedules}
        scheduleToEdit={scheduleToEdit}
      />

      <ScheduleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        schedule={selectedDetail}
      />
    </div>
  );
};
