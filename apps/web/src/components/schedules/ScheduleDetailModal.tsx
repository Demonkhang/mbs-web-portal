import React from 'react';
import { X, Calendar, Clock, Users, MapPin, Building2, FileText, CheckCircle2, EyeOff } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: any | null;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({ isOpen, onClose, schedule }) => {
  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="bg-emerald-900/40 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Chi tiết Lịch công tác Lãnh đạo
              </span>
              <h3 className="text-sm font-bold text-white font-mono">
                {schedule.dayOfWeek || 'Lịch công tác'} ({schedule.date ? formatDate(schedule.date) : ''})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Status & Time */}
          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white font-mono">{schedule.timeSlot || '08:00 - 11:30'}</span>
              {schedule.isAllDay && (
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30">
                  Cả ngày
                </span>
              )}
            </div>
            <div>
              {schedule.isPublic ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hiển thị Công khai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-700">
                  <EyeOff className="w-3.5 h-3.5" /> Lịch Nội bộ
                </span>
              )}
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nội dung công tác</label>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-sm font-semibold text-white leading-relaxed">
              {schedule.eventTitle}
            </div>
          </div>

          {/* Grid Info: Leader, Attendees, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Chủ trì / Lãnh đạo</span>
              </div>
              <p className="text-white font-bold">{schedule.leaderName || 'Đang cập nhật'}</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Địa điểm</span>
              </div>
              <p className="text-white font-medium">{schedule.location || 'Tại phòng họp Ban'}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Thành phần tham dự</span>
            </div>
            <p className="text-slate-200">{schedule.attendees || 'Các Ban/Phòng liên quan'}</p>
          </div>

          {schedule.notes && (
            <div className="p-3.5 bg-amber-950/20 rounded-xl border border-amber-800/40 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>Ghi chú</span>
              </div>
              <p className="text-amber-200/90">{schedule.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
