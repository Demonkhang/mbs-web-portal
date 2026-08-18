import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Printer, Building2 } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { fetchApi } from '../services/api-client';
import { formatDate } from '../lib/utils';

export interface WorkSchedulePageProps {
  onNavigate: (path: string) => void;
}

export const WorkSchedulePage: React.FC<WorkSchedulePageProps> = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Fetch live weekly schedule from PostgreSQL DB API
    fetchApi<{ data: any[] }>('/v1/utilities/weekly')
      .then((res) => {
        if (res && res.data) {
          setSchedules(res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải lịch công tác:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

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

        {/* Header */}
        <div className="border-b-2 border-emerald-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              LỊCH CÔNG TÁC LÃNH ĐẠO BAN
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lịch họp, đi công tác và làm việc chính thức của Lãnh đạo Ban Quản lý MBS từ CSDL PostgreSQL
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>In lịch công tác</span>
          </button>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Đang tải lịch công tác tuần từ CSDL PostgreSQL...
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Chưa có lịch công tác công khai nào trong tuần này.
          </div>
        ) : (
          <div className="space-y-6">
            {schedules.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-emerald-800 text-white px-5 py-3 flex items-center justify-between">
                  <span className="font-extrabold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    {item.dayOfWeek || 'Lịch làm việc'} ({formatDate(item.date)})
                  </span>
                  <span className="text-xs font-mono bg-emerald-900/60 px-2.5 py-0.5 rounded border border-emerald-700">
                    {item.timeSlot || '08:00'}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.eventTitle}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Chủ trì: <strong className="text-slate-900">{item.leaderName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Địa điểm: <strong className="text-slate-900">{item.location}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Thành phần: <strong>{item.attendees || 'Lãnh đạo & Cán bộ chuyên môn'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
