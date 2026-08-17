import React from 'react';
import { CheckCircle2, Clock, Printer, Download, User, Calendar } from 'lucide-react';
import { ApplicationTracking } from '../../lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn, formatDateTime } from '../../lib/utils';
import { useToast } from '../ui/toast';

export interface StepperStatusProps {
  tracking?: ApplicationTracking;
  trackingCode?: string;
  currentStep?: number;
  submissionDate?: string;
  expectedDate?: string;
  onPrint?: () => void;
}

export const StepperStatus: React.FC<StepperStatusProps> = ({
  tracking,
  trackingCode,
  currentStep,
  submissionDate,
  expectedDate,
  onPrint
}) => {
  const { showToast } = useToast();

  const code = tracking?.trackingCode || trackingCode || 'MBS-2026-N/A';
  const step = tracking?.currentStep || currentStep || 1;
  const subDate = tracking?.submissionDate || submissionDate || '';
  const expDate = tracking?.expectedDate || expectedDate || '';
  const statusText = tracking?.statusText || 'Đang xử lý trên hệ thống';

  const steps = [
    { step: 1, title: 'Tiếp nhận hồ sơ', desc: 'Bộ phận một cửa tiếp nhận và kiểm tra' },
    { step: 2, title: 'Thẩm định hồ sơ', desc: 'Kiểm tra kỹ thuật & phương tiện thực tế' },
    { step: 3, title: 'Trình phê duyệt', desc: 'Lãnh đạo Ban Quản lý ký duyệt quyết định' },
    { step: 4, title: 'Hoàn tất & Trả kết quả', desc: 'Cấp giấy phép điện tử & thẻ RFID' },
  ];

  const handleDownloadReceipt = () => {
    showToast('Tải giấy biên nhận', `Đang tải biên nhận điện tử mã ${code}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Header with Tracking Code and Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase">Mã biên nhận:</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 tracking-wider font-mono bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              {code}
            </span>
            <Badge variant="success" size="md">
              {statusText}
            </Badge>
          </div>
          {tracking?.serviceName && (
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
              {tracking.serviceName}
            </h3>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="w-4 h-4" />
            <span>In phiếu tiếp nhận</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownloadReceipt} className="gap-1.5">
            <Download className="w-4 h-4" />
            <span>Tải biên nhận PDF</span>
          </Button>
        </div>
      </div>

      {/* 4-Step Visual Stepper */}
      <div className="py-4">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(100, ((step - 1) / (steps.length - 1)) * 100)}%` }}
            ></div>
          </div>

          {/* Step Circles */}
          {steps.map((s) => {
            const isCompleted = s.step < step;
            const isCurrent = s.step === step;
            const isPending = s.step > step;

            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center group">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md',
                    isCompleted && 'bg-emerald-600 text-white ring-4 ring-emerald-100',
                    isCurrent && 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 animate-pulse',
                    isPending && 'bg-white text-slate-400 border-2 border-slate-300'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : s.step}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold mt-2 text-center max-w-[90px] sm:max-w-[120px]',
                    isCurrent ? 'text-amber-700 font-bold' : isCompleted ? 'text-emerald-800' : 'text-slate-500'
                  )}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applicant & Officer Information Grid */}
      {tracking && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              Thông tin người nộp
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <p><strong className="text-slate-700 font-semibold">Tổ chức / Cá nhân:</strong> {tracking.applicantName}</p>
              <p><strong className="text-slate-700 font-semibold">Số điện thoại:</strong> {tracking.applicantPhone}</p>
              <p><strong className="text-slate-700 font-semibold">Email:</strong> {tracking.applicantEmail}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Tiến độ & Cán bộ phụ trách
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <p><strong className="text-slate-700 font-semibold">Ngày tiếp nhận:</strong> {formatDateTime(subDate)}</p>
              <p>
                <strong className="text-slate-700 font-semibold">Ngày hẹn trả kết quả:</strong>{' '}
                <span className="font-bold text-amber-700">{formatDateTime(expDate)}</span>
              </p>
              <p><strong className="text-slate-700 font-semibold">Cán bộ xử lý:</strong> {tracking.assignedOfficer} ({tracking.department})</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing History Timeline */}
      {tracking?.history && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            Nhật ký xử lý hồ sơ chi tiết
          </h4>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {tracking.history.map((h, i) => (
              <div key={i} className="p-4 bg-white hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className="mt-1">
                  {h.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : h.status === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h5 className="text-sm font-bold text-slate-900">{h.title}</h5>
                    <span className="text-xs font-mono text-slate-500">{h.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">{h.description}</p>
                  <span className="text-xs text-slate-500 font-medium mt-1 block">Người thực hiện: {h.officer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
