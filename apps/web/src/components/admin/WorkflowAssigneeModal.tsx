import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, CheckCircle2, Send, Award, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { fetchApi } from '../../services/api-client';

export interface WorkflowAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { nextAssigneeId?: string; nextAssigneeName?: string; scheduledPublishAt?: string }) => void;
  targetStep: number; // 2: Thư ký biên tập, 3: Lãnh đạo duyệt, 4: Xuất bản
  actionTitle: string;
  confirmText: string;
}

export const WorkflowAssigneeModal: React.FC<WorkflowAssigneeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetStep,
  actionTitle,
  confirmText,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Step 4 Scheduled Publish States
  const [publishMode, setPublishMode] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('08:00');

  useEffect(() => {
    if (!isOpen) return;

    // Default scheduled time: tomorrow at 08:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setScheduledDate(dateStr);

    setIsLoadingUsers(true);
    fetchApi<{ data: any[] }>('/v1/users/assignees')
      .then((res) => {
        if (res && res.data) {
          let filtered = res.data;
          if (targetStep === 2) {
            // Editors / Secretaries / Lead
            filtered = res.data.filter((u) => ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD', 'EDITOR'].includes(u.role));
          } else if (targetStep === 3) {
            // Approvers / Leadership
            filtered = res.data.filter((u) => ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD'].includes(u.role));
          } else if (targetStep === 4) {
            // Publishers / Leadership
            filtered = res.data.filter((u) => ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD', 'OFFICER'].includes(u.role));
          }

          setUsers(filtered.length > 0 ? filtered : res.data);
          if (filtered.length > 0) {
            setSelectedUserId(filtered[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingUsers(false));
  }, [isOpen, targetStep]);

  if (!isOpen) return null;

  const handleConfirmSubmit = () => {
    let selectedUser = users.find((u) => u.id === selectedUserId);
    let payload: any = {
      nextAssigneeId: selectedUser?.id || selectedUserId,
      nextAssigneeName: selectedUser ? (selectedUser.fullName || selectedUser.email) : 'Cán bộ thụ lý',
    };

    if (targetStep === 4 && publishMode === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        alert('Vui lòng chọn đầy đủ ngày và giờ hẹn xuất bản.');
        return;
      }
      const combinedDateTimeStr = `${scheduledDate}T${scheduledTime}:00`;
      const scheduledMs = new Date(combinedDateTimeStr).getTime();
      if (isNaN(scheduledMs) || scheduledMs <= Date.now()) {
        alert('Thời gian hẹn giờ xuất bản phải ở thời điểm tương lai.');
        return;
      }
      payload.scheduledPublishAt = new Date(combinedDateTimeStr).toISOString();
    }

    onConfirm(payload);
  };

  const getStepTitle = () => {
    if (targetStep === 2) return 'Bước 2: Phân công Thư ký Biên tập';
    if (targetStep === 3) return 'Bước 3: Trình Lãnh đạo Phê duyệt & Chấm điểm';
    if (targetStep === 4) return 'Bước 4: Xuất bản hoặc Hẹn giờ Xuất bản';
    return actionTitle;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{getStepTitle()}</h3>
              <p className="text-xs text-slate-400">Vui lòng chọn Cán bộ chịu trách nhiệm trực tiếp cho bước tiếp theo</p>
            </div>
          </div>
        </div>

        {/* Step 4 Special Mode Selector: Instant vs Scheduled */}
        {targetStep === 4 && (
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Lựa chọn chế độ Xuất bản *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPublishMode('instant')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  publishMode === 'instant'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Xuất bản Ngay</span>
                <span className="text-[10px] font-normal text-slate-400">Đẩy bài hiển thị Portal tức thì</span>
              </button>

              <button
                type="button"
                onClick={() => setPublishMode('scheduled')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  publishMode === 'scheduled'
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Hẹn giờ Xuất bản</span>
                <span className="text-[10px] font-normal text-slate-400">Tự động đẩy bài khi đến giờ</span>
              </button>
            </div>

            {/* Scheduled Date Time Input */}
            {publishMode === 'scheduled' && (
              <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Chọn Ngày xuất bản</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Chọn Giờ xuất bản</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignee Select Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Chọn Cán bộ chịu trách nhiệm Bước {targetStep} *
          </label>

          {isLoadingUsers ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400 font-medium">
              Đang tải danh sách cán bộ...
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {users.map((u) => (
                <label
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedUserId === u.id
                      ? 'bg-emerald-950/70 border-emerald-500 text-white'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                      {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{u.fullName || u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {u.department ? `${u.department} • ` : ''}
                        {u.role}
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="assignee"
                    checked={selectedUserId === u.id}
                    onChange={() => setSelectedUserId(u.id)}
                    className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Notice */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            Sau khi xác nhận, bài viết sẽ được chuyển giao chính thức cho cán bộ được chọn. Lịch sử phân công sẽ được lưu trữ vĩnh viễn trong CSDL PostgreSQL.
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button onClick={onClose} variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-300">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="primary"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> {confirmText || 'Xác nhận chuyển bước'}
          </Button>
        </div>
      </div>
    </div>
  );
};
