import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Building2, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchApi } from '../../services/api-client';
import { useToast } from '../ui/toast';

export interface AdminScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduleToEdit?: any | null;
}

export const AdminScheduleEditModal: React.FC<AdminScheduleEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  scheduleToEdit,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    dayOfWeek: 'Thứ 2',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 - 11:30',
    isAllDay: false,
    eventTitle: '',
    leaderName: '',
    attendees: '',
    location: '',
    notes: '',
    isPublic: true,
  });

  useEffect(() => {
    if (scheduleToEdit) {
      setFormState({
        dayOfWeek: scheduleToEdit.dayOfWeek || 'Thứ 2',
        date: scheduleToEdit.date ? new Date(scheduleToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        timeSlot: scheduleToEdit.timeSlot || '08:00 - 11:30',
        isAllDay: !!scheduleToEdit.isAllDay,
        eventTitle: scheduleToEdit.eventTitle || '',
        leaderName: scheduleToEdit.leaderName || '',
        attendees: scheduleToEdit.attendees || '',
        location: scheduleToEdit.location || '',
        notes: scheduleToEdit.notes || '',
        isPublic: scheduleToEdit.isPublic !== undefined ? scheduleToEdit.isPublic : true,
      });
    } else {
      setFormState({
        dayOfWeek: 'Thứ 2',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '08:00 - 11:30',
        isAllDay: false,
        eventTitle: '',
        leaderName: '',
        attendees: '',
        location: '',
        notes: '',
        isPublic: true,
      });
    }
  }, [scheduleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.eventTitle.trim()) {
      showToast('Vui lòng nhập Nội dung công tác!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (scheduleToEdit && scheduleToEdit.id) {
        await fetchApi(`/v1/schedules/${scheduleToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formState),
        });
        showToast('Cập nhật sự kiện lịch công tác thành công!', 'success');
      } else {
        await fetchApi('/v1/schedules', {
          method: 'POST',
          body: JSON.stringify(formState),
        });
        showToast('Tạo mới sự kiện lịch công tác thành công!', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi lưu lịch công tác:', err);
      showToast('Không thể lưu sự kiện lịch công tác.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {scheduleToEdit ? 'Chỉnh sửa Sự kiện Lịch công tác' : 'Thêm mới Sự kiện Lịch công tác'}
              </h3>
              <p className="text-xs text-slate-400">
                Nhập thông tin lịch họp, công tác lãnh đạo Ban Quản lý MBS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs text-slate-300 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Thứ trong tuần *</label>
              <select
                value={formState.dayOfWeek}
                onChange={(e) => setFormState({ ...formState, dayOfWeek: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
              >
                <option value="Thứ 2">Thứ 2</option>
                <option value="Thứ 3">Thứ 3</option>
                <option value="Thứ 4">Thứ 4</option>
                <option value="Thứ 5">Thứ 5</option>
                <option value="Thứ 6">Thứ 6</option>
                <option value="Thứ 7">Thứ 7</option>
                <option value="Chủ nhật">Chủ nhật</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Ngày *</label>
              <input
                type="date"
                value={formState.date}
                onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Khung giờ công tác *</label>
              <input
                type="text"
                placeholder="VD: 08:00 - 11:30"
                value={formState.timeSlot}
                onChange={(e) => setFormState({ ...formState, timeSlot: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                <input
                  type="checkbox"
                  checked={formState.isAllDay}
                  onChange={(e) => setFormState({ ...formState, isAllDay: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Công tác cả ngày</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Nội dung công tác / Cuộc họp *</label>
            <textarea
              rows={3}
              placeholder="Nhập nội dung chi tiết cuộc họp hoặc chương trình công tác..."
              value={formState.eventTitle}
              onChange={(e) => setFormState({ ...formState, eventTitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Lãnh đạo Chủ trì</label>
              <input
                type="text"
                placeholder="VD: Giám đốc / PGĐ Lê Thị Thanh Thảo"
                value={formState.leaderName}
                onChange={(e) => setFormState({ ...formState, leaderName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Địa điểm</label>
              <input
                type="text"
                placeholder="VD: Phòng họp số 2"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Thành phần tham dự</label>
            <input
              type="text"
              placeholder="VD: Các Chi bộ, Trưởng các Phòng chuyên môn..."
              value={formState.attendees}
              onChange={(e) => setFormState({ ...formState, attendees: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Ghi chú thêm</label>
            <input
              type="text"
              placeholder="VD: Theo Thông báo số 1841/TB-BQLKLH-VP"
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-400">Hiển thị công khai Portal:</span>
            <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
              <input
                type="checkbox"
                checked={formState.isPublic}
                onChange={(e) => setFormState({ ...formState, isPublic: e.target.checked })}
                className="rounded accent-emerald-500"
              />
              <span className={formState.isPublic ? 'text-emerald-400' : 'text-slate-400'}>
                {formState.isPublic ? 'Công khai' : 'Nội bộ'}
              </span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{scheduleToEdit ? 'Cập nhật Sự kiện' : 'Lưu vào CSDL'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
