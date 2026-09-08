import React from 'react';
import {
  Upload,
  FileText,
  Clock,
  ShieldCheck,
  FileUp,
  X,
  CheckCircle2,
  FileCode,
  Check,
  Calendar,
  Paperclip,
  UserCheck,
  Send,
  Globe,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { UserRole, ROLE_DEFINITIONS } from '../../../lib/permission.utils';

export interface DocumentEditorFormProps {
  editingDocId: string | null;
  formStep: 1 | 2 | 3;
  onFormStepChange: (step: 1 | 2 | 3) => void;
  docCode: string;
  onDocCodeChange: (val: string) => void;
  docTitle: string;
  onDocTitleChange: (val: string) => void;
  docType: string;
  onDocTypeChange: (val: string) => void;
  issuingAgency: string;
  onIssuingAgencyChange: (val: string) => void;
  docStatus: string;
  onDocStatusChange: (val: string) => void;
  signer: string;
  onSignerChange: (val: string) => void;
  issueDate: string;
  onIssueDateChange: (val: string) => void;
  effectiveDate: string;
  onEffectiveDateChange: (val: string) => void;
  domain: string;
  onDomainChange: (val: string) => void;
  fullText: string;
  onFullTextChange: (val: string) => void;
  htmlContent: string;
  onHtmlContentChange: (val: string) => void;
  pdfFileUrl: string;
  pdfFileName: string;
  pdfFileSize: string;
  isUploadingPdf: boolean;
  p7sSignatureUrl: string;
  p7sFileName: string;
  isUploadingP7s: boolean;
  isConfidentialChecked: boolean;
  onConfidentialCheckedChange: (val: boolean) => void;
  publishScheduleMode: 'IMMEDIATE' | 'SCHEDULED';
  onPublishScheduleModeChange: (mode: 'IMMEDIATE' | 'SCHEDULED') => void;
  scheduledPublishDate: string;
  activeRole: UserRole;
  canDirectPublish: boolean;
  pdfInputRef: React.RefObject<HTMLInputElement | null>;
  p7sInputRef: React.RefObject<HTMLInputElement | null>;
  issueDateInputRef: React.RefObject<HTMLInputElement | null>;
  effectiveDateInputRef: React.RefObject<HTMLInputElement | null>;
  onHandlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHandleP7sUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPdf: () => void;
  onClearP7s: () => void;
  onSaveDocument: (targetStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED') => void;
  onOpenScheduleModal: () => void;
  documentTypes: string[];
  issuingAgencies: string[];
}

export const DocumentEditorForm: React.FC<DocumentEditorFormProps> = ({
  editingDocId,
  formStep,
  onFormStepChange,
  docCode,
  onDocCodeChange,
  docTitle,
  onDocTitleChange,
  docType,
  onDocTypeChange,
  issuingAgency,
  onIssuingAgencyChange,
  docStatus,
  onDocStatusChange,
  signer,
  onSignerChange,
  issueDate,
  onIssueDateChange,
  effectiveDate,
  onEffectiveDateChange,
  domain,
  onDomainChange,
  fullText,
  onFullTextChange,
  htmlContent,
  onHtmlContentChange,
  pdfFileUrl,
  pdfFileName,
  pdfFileSize,
  isUploadingPdf,
  p7sSignatureUrl,
  p7sFileName,
  isUploadingP7s,
  isConfidentialChecked,
  onConfidentialCheckedChange,
  publishScheduleMode,
  onPublishScheduleModeChange,
  scheduledPublishDate,
  activeRole,
  canDirectPublish,
  pdfInputRef,
  p7sInputRef,
  issueDateInputRef,
  effectiveDateInputRef,
  onHandlePdfUpload,
  onHandleP7sUpload,
  onClearPdf,
  onClearP7s,
  onSaveDocument,
  onOpenScheduleModal,
  documentTypes,
  issuingAgencies,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
      {/* Step Indicator Header */}
      <div className="grid grid-cols-3 gap-2 pb-6 border-b border-slate-800">
        <button
          onClick={() => onFormStepChange(1)}
          className={`p-3 rounded-xl border text-left transition-all ${
            formStep === 1
              ? 'bg-teal-950/60 border-teal-500 text-teal-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-500">Bước 1</div>
          <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
            <Upload className="w-3.5 h-3.5 text-teal-400" /> 1. Tiếp nhận & ATTT
          </div>
        </button>

        <button
          onClick={() => onFormStepChange(2)}
          className={`p-3 rounded-xl border text-left transition-all ${
            formStep === 2
              ? 'bg-teal-950/60 border-teal-500 text-teal-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-500">Bước 2</div>
          <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
            <FileText className="w-3.5 h-3.5 text-teal-400" /> 2. Số hóa Metadata
          </div>
        </button>

        <button
          onClick={() => onFormStepChange(3)}
          className={`p-3 rounded-xl border text-left transition-all ${
            formStep === 3
              ? 'bg-teal-950/60 border-teal-500 text-teal-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-500">Bước 3</div>
          <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-teal-400" /> 3. Xem trước & Trình duyệt
          </div>
        </button>
      </div>

      {/* Hidden File Inputs for Real File Upload */}
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        onChange={onHandlePdfUpload}
        className="hidden"
      />

      <input
        ref={p7sInputRef}
        type="file"
        accept=".p7s,.sig,.bin"
        onChange={onHandleP7sUpload}
        className="hidden"
      />

      {/* Form Step Content */}
      {formStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> Kiểm tra Định dạng Tệp PDF/A & An toàn Thông tin
          </h3>

          {/* Interactive Upload PDF Box */}
          <div
            onClick={() => pdfInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-teal-500 bg-slate-950 hover:bg-slate-950/80 p-6 rounded-2xl text-center space-y-3 transition-colors cursor-pointer group relative"
          >
            {/* Clear PDF 'X' button if file selected/uploaded */}
            {(pdfFileName || pdfFileUrl) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearPdf();
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors z-10 shadow-md"
                title="Xóa / Hủy chọn tệp PDF"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <FileUp className="w-10 h-10 text-teal-400 group-hover:scale-110 mx-auto transition-transform" />
            <div>
              <div className="text-xs font-bold text-white">
                {pdfFileName ? (
                  <span className="text-teal-300 font-mono">Tệp đã chọn: {pdfFileName}</span>
                ) : (
                  'Nhấn để Tải lên File PDF/A văn bản chính thức'
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {pdfFileSize ? `Dung lượng: ${pdfFileSize}` : 'Được lưu riêng biệt trong thư mục /uploads/documents/ (Không đưa vào Kho ảnh)'}
              </p>
            </div>

            {isUploadingPdf && (
              <div className="text-xs text-teal-400 animate-pulse font-bold">Đang tải và xử lý tệp...</div>
            )}

            {pdfFileUrl && (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu đĩa riêng: {pdfFileUrl}
              </div>
            )}
          </div>

          {/* Upload P7S Digital Signature Box */}
          <div
            onClick={() => p7sInputRef.current?.click()}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 space-y-2 cursor-pointer transition-colors relative"
          >
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <FileCode className="w-4 h-4 text-amber-400" /> Đóng kèm Chữ ký số Chuyên dùng (.p7s)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-400 hover:underline">Tải lên tệp .p7s</span>
                {(p7sFileName || p7sSignatureUrl) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearP7s();
                    }}
                    className="p-1 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                    title="Xóa tệp chữ ký số .p7s"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {p7sFileName ? (
              <div className="text-xs text-amber-300 font-mono flex items-center justify-between bg-amber-950/30 p-2 rounded-lg border border-amber-900/50">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> {p7sFileName}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Chưa gắn chữ ký số PKI. Nhấp vào đây để chọn tệp .p7s</p>
            )}
          </div>

          {/* Information Access Law Compliance Checkbox */}
          <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="confidentialCheck"
              checked={isConfidentialChecked}
              onChange={(e) => onConfidentialCheckedChange(e.target.checked)}
              className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="confidentialCheck" className="text-xs text-emerald-200 cursor-pointer leading-relaxed">
              <strong>Cam kết An toàn Thông tin & Thể thức (Luật Tiếp cận thông tin)</strong>: Đảm bảo văn bản đã kiểm tra thể thức, không thuộc danh mục Mật/Tối mật/Tuyệt mật và được phép công khai rộng rãi trên Cổng thông tin.
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onFormStepChange(2)} variant="primary" size="sm">
              Tiếp theo: Nhập Metadata &rarr;
            </Button>
          </div>
        </div>
      )}

      {formStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200 text-xs">
          <h3 className="text-sm font-bold text-white">Biên tập Thông tin Thuộc tính (Metadata)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Số / Ký hiệu văn bản *</label>
              <input
                type="text"
                placeholder="Ví dụ: 05/2024/QĐ-UBND"
                value={docCode}
                onChange={(e) => onDocCodeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Loại văn bản *</label>
              <select
                value={docType}
                onChange={(e) => onDocTypeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                {documentTypes.filter((t) => t !== 'Tất cả').map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Trích yếu nội dung *</label>
              <textarea
                rows={2}
                placeholder="Nhập trích yếu tóm tắt nội dung văn bản..."
                value={docTitle}
                onChange={(e) => onDocTitleChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Cơ quan ban hành *</label>
              <select
                value={issuingAgency}
                onChange={(e) => onIssuingAgencyChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                {issuingAgencies.filter((a) => a !== 'Tất cả').map((agency, i) => (
                  <option key={i} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Trạng thái hiệu lực *</label>
              <select
                value={docStatus}
                onChange={(e) => onDocStatusChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Còn hiệu lực">Còn hiệu lực</option>
                <option value="Hết hiệu lực">Hết hiệu lực</option>
                <option value="Hết hiệu lực một phần">Hết hiệu lực một phần</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Người ký *</label>
              <input
                type="text"
                placeholder="Ví dụ: Chủ tịch UBND TP.HCM"
                value={signer}
                onChange={(e) => onSignerChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            {/* Custom Date Picker 1: Ngày ban hành */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Ngày ban hành *</span>
                <span className="text-[10px] text-teal-400 font-mono">Định dạng: DD/MM/YYYY</span>
              </label>

              <div
                onClick={() => {
                  try {
                    issueDateInputRef.current?.showPicker?.();
                  } catch (e) {
                    issueDateInputRef.current?.focus();
                  }
                }}
                className="bg-slate-950 border border-slate-800 hover:border-teal-500 focus-within:border-teal-500 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-inner group relative"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {issueDate ? new Date(issueDate).toLocaleDateString('vi-VN') : 'Chọn ngày ban hành'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">{issueDate || 'YYYY-MM-DD'}</span>
                  </div>
                </div>

                <input
                  ref={issueDateInputRef}
                  type="date"
                  value={issueDate}
                  onChange={(e) => onIssueDateChange(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                <span className="text-slate-500">Nhanh:</span>
                <button
                  type="button"
                  onClick={() => onIssueDateChange(new Date().toISOString().split('T')[0])}
                  className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => onIssueDateChange('2026-09-01')}
                  className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Đầu tháng
                </button>
                <button
                  type="button"
                  onClick={() => onIssueDateChange('2026-01-01')}
                  className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Đầu năm
                </button>
              </div>
            </div>

            {/* Custom Date Picker 2: Ngày có hiệu lực */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Ngày có hiệu lực *</span>
                <span className="text-[10px] text-teal-400 font-mono">Định dạng: DD/MM/YYYY</span>
              </label>

              <div
                onClick={() => {
                  try {
                    effectiveDateInputRef.current?.showPicker?.();
                  } catch (e) {
                    effectiveDateInputRef.current?.focus();
                  }
                }}
                className="bg-slate-950 border border-slate-800 hover:border-teal-500 focus-within:border-teal-500 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-inner group relative"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {effectiveDate ? new Date(effectiveDate).toLocaleDateString('vi-VN') : 'Chọn ngày có hiệu lực'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">{effectiveDate || 'YYYY-MM-DD'}</span>
                  </div>
                </div>

                <input
                  ref={effectiveDateInputRef}
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => onEffectiveDateChange(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                <span className="text-slate-500">Nhanh:</span>
                <button
                  type="button"
                  onClick={() => onEffectiveDateChange(issueDate)}
                  className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Cùng ngày ban hành
                </button>
                <button
                  type="button"
                  onClick={() => onEffectiveDateChange(new Date().toISOString().split('T')[0])}
                  className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Hôm nay
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Tóm tắt hiển thị HTML (Phục vụ SEO & Machine Indexing)</label>
              <textarea
                rows={3}
                placeholder="Nhập nội dung HTML tóm tắt hiển thị trên cổng thông tin..."
                value={htmlContent}
                onChange={(e) => onHtmlContentChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Toàn văn bản (Đánh chỉ mục Full-Text Search pg_trgm)</label>
              <textarea
                rows={5}
                placeholder="Dán toàn văn bản để máy chủ tìm kiếm PostgreSQL lập chỉ mục tra cứu..."
                value={fullText}
                onChange={(e) => onFullTextChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <Button onClick={() => onFormStepChange(1)} variant="outline" size="sm">
              &larr; Quay lại
            </Button>
            <Button onClick={() => onFormStepChange(3)} variant="primary" size="sm">
              Tiếp theo: Xem trước & Trình duyệt &rarr;
            </Button>
          </div>
        </div>
      )}

      {formStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Xem trước Văn bản & Thực hiện Hành động Nghiệp vụ</span>
            <Badge className={ROLE_DEFINITIONS[activeRole]?.badgeClass || 'bg-slate-800'}>
              Quyền hiện tại: {ROLE_DEFINITIONS[activeRole]?.title}
            </Badge>
          </h3>

          {/* Dynamic Live Preview Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-teal-950 text-teal-300 border-teal-800 font-mono text-xs">
                {docCode || 'Chưa nhập số'}
              </Badge>
              <Badge variant="outline">{docType}</Badge>
              <span className="text-xs text-slate-400 font-medium">Bởi: {issuingAgency}</span>
            </div>

            <h4 className="text-base font-bold text-white leading-snug">
              {docTitle || 'Chưa nhập trích yếu (Vui lòng quay lại Bước 2 nhập trích yếu)'}
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-900 pt-3">
              <div>Người ký: <strong className="text-slate-200">{signer || 'Ban Giám đốc'}</strong></div>
              <div>Ngày ban hành: <strong className="text-slate-200">{issueDate}</strong></div>
              <div>Trạng thái ATTT: <strong className="text-emerald-400">Đã cam kết theo Luật TCTT</strong></div>
              <div>Chữ ký số: <strong className="text-amber-400">{p7sFileName ? `Gắn tệp ${p7sFileName}` : 'Đã kiểm tra'}</strong></div>
            </div>

            {pdfFileUrl && (
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2">
                <Paperclip className="w-3.5 h-3.5 text-teal-400" />
                <span>File đính kèm (Lưu riêng): <strong>{pdfFileName || pdfFileUrl}</strong></span>
              </div>
            )}
          </div>

          {/* Publication Schedule Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Cài đặt Thời điểm Xuất bản Công khai
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Mode 1: Immediate */}
              <div
                onClick={() => onPublishScheduleModeChange('IMMEDIATE')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                  publishScheduleMode === 'IMMEDIATE'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishScheduleMode === 'IMMEDIATE'}
                    onChange={() => onPublishScheduleModeChange('IMMEDIATE')}
                    className="accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-white">⚡ Xuất bản ngay lập tức</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Kích hoạt xuất bản và công khai ngay tức thì trên Cổng thông tin điện tử MBS.
                </p>
              </div>

              {/* Mode 2: Scheduled */}
              <div
                onClick={() => {
                  onPublishScheduleModeChange('SCHEDULED');
                  onOpenScheduleModal();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                  publishScheduleMode === 'SCHEDULED'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishScheduleMode === 'SCHEDULED'}
                    onChange={() => {
                      onPublishScheduleModeChange('SCHEDULED');
                      onOpenScheduleModal();
                    }}
                    className="accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-white">📅 Hẹn giờ xuất bản tự động</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Cài đặt ngày giờ tương lai, hệ thống tự động xuất bản vào thời điểm được ấn định.
                </p>
              </div>
            </div>

            {/* Scheduled Date Display & Modal Trigger */}
            {publishScheduleMode === 'SCHEDULED' && (
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-3 animate-in fade-in duration-200 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-cyan-400" /> Thời gian Hẹn giờ Xuất bản
                    </span>
                    <div className="text-base font-black text-white font-mono mt-1 flex items-center gap-2">
                      <span>{new Date(scheduledPublishDate).toLocaleString('vi-VN')}</span>
                      <span className="text-[11px] font-normal text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                        Đã thiết lập
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={onOpenScheduleModal}
                    variant="outline"
                    size="sm"
                    className="bg-cyan-950/80 hover:bg-cyan-900 border-cyan-600 text-cyan-300 hover:text-white gap-2 font-bold cursor-pointer transition-all hover:scale-105"
                  >
                    <Calendar className="w-4 h-4 text-cyan-400" /> Mở Form Cài đặt Lịch
                  </Button>
                </div>

                <div
                  onClick={onOpenScheduleModal}
                  className="text-xs text-cyan-200 bg-cyan-950/60 p-3 rounded-xl border border-cyan-800/80 flex items-center justify-between cursor-pointer hover:border-cyan-500 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      Văn bản sẽ ở trạng thái <strong>HẸN GIỜ XUẤT BẢN</strong> và tự động công khai vào{' '}
                      <strong>{new Date(scheduledPublishDate).toLocaleString('vi-VN')}</strong>.
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 hover:underline shrink-0 pl-2">
                    Đổi mốc giờ &rarr;
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons based on Active Role */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" /> Hành động khả thi cho vai trò{' '}
              <span className="text-teal-400">{ROLE_DEFINITIONS[activeRole]?.title}</span>:
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button onClick={() => onFormStepChange(2)} variant="outline" size="sm">
                &larr; Quay lại sửa
              </Button>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Save Draft */}
                <Button
                  onClick={() => onSaveDocument('DRAFT')}
                  variant="outline"
                  size="sm"
                  className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  {editingDocId ? 'Lưu cập nhật Nháp' : 'Lưu bản nháp (DRAFT)'}
                </Button>

                {/* Submit for Review */}
                {(!canDirectPublish || activeRole === 'SUPER_ADMIN') && (
                  <Button
                    onClick={() => onSaveDocument('PENDING_REVIEW')}
                    variant="secondary"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Trình duyệt Lãnh đạo (PENDING_REVIEW)
                  </Button>
                )}

                {/* Direct Approve & Publish or Schedule */}
                {canDirectPublish && (
                  <Button
                    onClick={() => onSaveDocument('PUBLISHED')}
                    variant="primary"
                    size="sm"
                    className={`${
                      publishScheduleMode === 'SCHEDULED'
                        ? 'bg-cyan-600 hover:bg-cyan-500'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    } text-white font-bold gap-1.5 shadow-lg cursor-pointer`}
                  >
                    {publishScheduleMode === 'SCHEDULED' ? (
                      <>
                        <Clock className="w-4 h-4" /> {editingDocId ? 'Cập nhật & Hẹn giờ' : 'Hẹn giờ xuất bản'}
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" /> {editingDocId ? 'Cập nhật & Phê duyệt' : 'Phê duyệt & Xuất bản ngay'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
