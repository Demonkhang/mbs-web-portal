import React, { useState } from 'react';
import { CheckCircle2, Upload, FileText, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, Building, User, Mail, Phone, MapPin } from 'lucide-react';
import { PublicService } from '../../lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

export interface OnlineSubmissionWizardProps {
  service: PublicService;
  onSuccess: (trackingCode: string) => void;
  onCancel: () => void;
}

export const OnlineSubmissionWizard: React.FC<OnlineSubmissionWizardProps> = ({ service, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    applicantType: 'doanh-nghiep',
    orgName: 'Công ty Cổ phần Môi trường Đô thị Sài Gòn Xanh',
    taxCode: '0312345678',
    repName: 'Trần Văn Bình',
    repPhone: '0908 123 456',
    repEmail: 'contact@saigonxanh-env.vn',
    address: '142 Võ Văn Kiệt, Phường Cô Giang, Quận 1, TP.HCM',
    facilitySelect: 'Khu liên hợp xử lý chất thải Đa Phước (Bình Chánh)',
    wasteType: 'Chất thải rắn sinh hoạt đô thị',
    estimatedVolume: '150 tấn/ngày',
    note: 'Đề nghị cấp phép tiếp nhận xe cuốn ép rác chuyên dụng.',
    agreeTerms: true,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({
    'file-0': 'Don-de-nghi-cap-phep-Mau01.pdf',
    'file-1': 'Giay-DKKD-SaigonXanh.pdf',
    'file-2': 'Danh-sach-xe-chuyen-dung-GPS.xlsx'
  });

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => ({ ...prev, [`file-${index}`]: file.name }));
      showToast('Đã tải lên tệp tin', file.name, 'success');
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.orgName || !formData.repPhone || !formData.repEmail) {
        showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường bắt buộc (*)', 'warning');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.agreeTerms) {
        showToast('Chưa đồng ý cam kết', 'Vui lòng tích chọn cam kết tính chính xác của hồ sơ', 'warning');
        return;
      }
    }
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedCode = `MBS-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      showToast('Nộp hồ sơ thành công!', `Mã biên nhận của bạn là: ${generatedCode}`, 'success');
      onSuccess(generatedCode);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Wizard Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <Badge variant="gov">MỨC ĐỘ {service.level}</Badge>
          <span className="text-xs font-mono text-slate-500 font-semibold">{service.code}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
          Nộp hồ sơ trực tuyến: {service.title}
        </h3>
      </div>

      {/* 4-Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {[
          { num: 1, label: '1. Thông tin người nộp' },
          { num: 2, label: '2. Đính kèm hồ sơ' },
          { num: 3, label: '3. Xác nhận & Kê khai' },
          { num: 4, label: '4. Hoàn tất nộp' },
        ].map((s) => (
          <div
            key={s.num}
            className={cn(
              'py-2 px-1 rounded-lg border transition-all',
              currentStep === s.num
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : currentStep > s.num
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            )}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Step 1: Applicant Information */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Thông tin tổ chức / cá nhân đề nghị
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Doanh nghiệp / Tổ chức *
              </label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Nhập tên doanh nghiệp"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã số thuế / Số ĐKKD *
              </label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="VD: 0300123456"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người đại diện theo pháp luật *
              </label>
              <input
                type="text"
                value={formData.repName}
                onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ *
              </label>
              <input
                type="text"
                value={formData.repPhone}
                onChange={(e) => setFormData({ ...formData, repPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ thư điện tử (Email nhận kết quả và mã biên nhận) *
              </label>
              <input
                type="email"
                value={formData.repEmail}
                onChange={(e) => setFormData({ ...formData, repEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ trụ sở chính *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Attach Dossier Files */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Đính kèm các thành phần hồ sơ theo quy định
          </h4>
          <p className="text-xs text-slate-500">
            Hỗ trợ định dạng PDF, DOCX, XLSX, JPG (Dung lượng tối đa 25MB/tệp). Có thể tải mẫu văn bản sẵn.
          </p>

          <div className="space-y-3">
            {service.dossierComponents.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{comp.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 block">Số lượng yêu cầu: {comp.quantity}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {uploadedFiles[`file-${idx}`] ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="max-w-[140px] truncate">{uploadedFiles[`file-${idx}`]}</span>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chọn tệp tải lên</span>
                      <input type="file" onChange={(e) => handleFileUpload(idx, e)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Verification & Details */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Kiểm tra thông tin & Cam kết pháp lý
          </h4>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
            <p><strong>Thủ tục:</strong> {service.title}</p>
            <p><strong>Đơn vị nộp:</strong> {formData.orgName} (MST: {formData.taxCode})</p>
            <p><strong>Người đại diện:</strong> {formData.repName} ({formData.repPhone})</p>
            <p><strong>Thời gian giải quyết:</strong> {service.duration}</p>
            <p><strong>Phí / Lệ phí:</strong> {service.fee}</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Cam đoan và cam kết trách nhiệm
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs leading-relaxed text-slate-700">
                Tôi xin cam đoan toàn bộ các thông tin và tài liệu đính kèm kê khai trên là hoàn toàn chính xác, trung thực. Nếu có sai phạm, tôi và tổ chức xin chịu hoàn toàn trách nhiệm trước pháp luật.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Step 4: Final Confirmation */}
      {currentStep === 4 && (
        <div className="space-y-6 text-center py-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900">Sẵn sàng gửi hồ sơ điện tử</h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Hệ thống sẽ tạo mã biên nhận điện tử và gửi thông báo xác nhận tự động tới số điện thoại <strong>{formData.repPhone}</strong> và email <strong>{formData.repEmail}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <Button variant="outline" size="md" onClick={currentStep === 1 ? onCancel : handleBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Hủy bỏ' : 'Quay lại'}</span>
        </Button>

        {currentStep < 4 ? (
          <Button variant="primary" size="md" onClick={handleNext} className="gap-1.5">
            <span>Tiếp tục</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="primary" size="lg" isLoading={isSubmitting} onClick={handleFinalSubmit} className="gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Xác nhận nộp hồ sơ</span>
          </Button>
        )}
      </div>
    </div>
  );
};
