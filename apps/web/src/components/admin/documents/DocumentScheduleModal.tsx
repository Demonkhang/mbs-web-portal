import React from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';
import { Button } from '../../ui/button';

export interface DocumentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalScheduleDate: string;
  onModalScheduleDateChange: (val: string) => void;
  modalScheduleTime: string;
  onModalScheduleTimeChange: (val: string) => void;
  onConfirm: () => void;
  onPreset: (daysOffset: number, timeStr: string) => void;
}

export const DocumentScheduleModal: React.FC<DocumentScheduleModalProps> = ({
  isOpen,
  onClose,
  modalScheduleDate,
  onModalScheduleDateChange,
  modalScheduleTime,
  onModalScheduleTimeChange,
  onConfirm,
  onPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden space-y-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <Calendar className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Cài đặt hẹn giờ xuất bản</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date & Time Selectors */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn ngày xuất bản *</label>
            <input
              type="date"
              value={modalScheduleDate}
              onChange={(e) => onModalScheduleDateChange(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn giờ xuất bản *</label>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {['08:00', '09:00', '14:00', '16:30'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onModalScheduleTimeChange(t)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    modalScheduleTime === t
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="time"
              value={modalScheduleTime}
              onChange={(e) => onModalScheduleTimeChange(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          {/* Presets */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">Lựa chọn nhanh:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => onPreset(1, '08:00')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors cursor-pointer"
              >
                Sáng mai (08:00)
              </button>
              <button
                type="button"
                onClick={() => onPreset(3, '09:00')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-medium transition-colors cursor-pointer"
              >
                Sau 3 ngày (09:00)
              </button>
              <button
                type="button"
                onClick={() => onPreset(7, '09:00')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-medium transition-colors cursor-pointer"
              >
                Sau 1 tuần
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm} className="gap-1.5 font-bold">
            <Check className="w-4 h-4" />
            <span>Xác nhận hẹn giờ</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
