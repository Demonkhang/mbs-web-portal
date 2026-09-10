import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Printer, Building2, ChevronLeft, ChevronRight, Eye, Info, FileText } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { fetchApi } from '../services/api-client';
import { formatDate } from '../lib/utils';
import { ScheduleDetailModal } from '../components/schedules/ScheduleDetailModal';

export interface WorkSchedulePageProps {
  onNavigate: (path: string) => void;
}

export const WorkSchedulePage: React.FC<WorkSchedulePageProps> = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchSchedules = (week?: number, year?: number) => {
    setIsLoading(true);
    let url = '/v1/utilities/weekly';
    const params = new URLSearchParams();
    if (week) params.append('week', week.toString());
    if (year) params.append('year', year.toString());
    if (params.toString()) url += `?${params.toString()}`;

    fetchApi<{ data: any[] }>(url)
      .then((res) => {
        if (res && res.data) {
          setSchedules(res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải lịch công tác:', err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSchedules(selectedWeek, selectedYear);
  }, [selectedWeek, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  // Group schedules by dayOfWeek or Date string
  const groupedSchedules: Record<string, any[]> = schedules.reduce((acc: Record<string, any[]>, item: any) => {
    const key = item.dayOfWeek || 'Khác';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Lịch công tác tuần' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Header Bar */}
        <div className="border-b-2 border-emerald-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              LỊCH CÔNG TÁC TUẦN LÃNH ĐẠO BAN
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Lịch họp, công tác hiện trường và làm việc chính thức của Ban Quản lý MBS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>In Lịch công tác</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar / Week Filter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Xem theo tuần:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:border-emerald-600"
            >
              <option value={2026}>Năm 2026</option>
              <option value={2025}>Năm 2025</option>
            </select>

            <select
              value={selectedWeek || ''}
              onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:border-emerald-600"
            >
              <option value="">-- Tất cả lịch tuần hiện tại --</option>
              {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w < 10 ? `0${w}` : w}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mẹo: Click vào bất kỳ cuộc họp/sự kiện nào để xem chi tiết đầy đủ
          </div>
        </div>

        {/* Main Schedule Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Đang tải lịch công tác tuần từ CSDL PostgreSQL...
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Chưa có lịch công tác công khai nào được đăng cho thời gian này.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([dayGroup, dayItems]) => (
              <div key={dayGroup} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Day Section Header */}
                <div className="bg-emerald-800 text-white px-5 py-3 flex items-center justify-between">
                  <span className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    {dayGroup}
                  </span>
                  <span className="text-xs bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700 font-mono">
                    {dayItems.length} công việc
                  </span>
                </div>

                {/* Event items list */}
                <div className="divide-y divide-slate-100">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedDetail(item);
                        setIsDetailOpen(true);
                      }}
                      className="p-5 hover:bg-slate-50 transition-colors cursor-pointer space-y-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                            {item.timeSlot || '08:00'}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                            {item.eventTitle}
                          </h3>
                        </div>
                        <button
                          className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-3.5 h-3.5" /> Chi tiết
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100/60">
                        {item.leaderName && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Chủ trì: <strong className="text-slate-900">{item.leaderName}</strong></span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Địa điểm: <strong className="text-slate-900">{item.location}</strong></span>
                          </div>
                        )}
                        {item.attendees && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>Thành phần: <strong>{item.attendees}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ScheduleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        schedule={selectedDetail}
      />
    </div>
  );
};
