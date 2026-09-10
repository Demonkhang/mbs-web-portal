import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchApi } from '../../services/api-client';
import { useToast } from '../ui/toast';

export interface AdminScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminScheduleImportModal: React.FC<AdminScheduleImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedBatch, setParsedBatch] = useState<any | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'append'>('overwrite');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setParsedBatch(null);
    }
  };

  const handleParseFile = async () => {
    if (!selectedFile) {
      showToast('Vui lòng chọn file Excel trước khi xem trước!', 'error');
      return;
    }

    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';
      const token = localStorage.getItem('mbs_access_token') || localStorage.getItem('mbs_auth_token') || localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/v1/schedules/import`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const resData = await response.json();
      if (response.ok && resData.data) {
        setParsedBatch(resData.data);
        showToast(`Bóc tách thành công ${resData.data.items?.length || 0} sự kiện lịch tuần!`, 'success');
      } else {
        showToast(resData.detail || 'Lỗi bóc tách file Excel!', 'error');
      }
    } catch (err: any) {
      console.error('Lỗi import file Excel:', err);
      showToast('Không thể kết nối máy chủ để đọc file Excel.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!parsedBatch || !parsedBatch.items) return;

    setIsSaving(true);
    try {
      const res = await fetchApi<{ data: { savedCount: number } }>('/v1/schedules/batch-save', {
        method: 'POST',
        body: JSON.stringify({
          weekNumber: parsedBatch.weekNumber,
          year: parsedBatch.year,
          startDate: parsedBatch.startDate,
          endDate: parsedBatch.endDate,
          items: parsedBatch.items,
          mode: importMode,
        }),
      });

      showToast(`Đã lưu thành công ${res?.data?.savedCount || parsedBatch.items.length} sự kiện lịch tuần vào CSDL PostgreSQL!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi lưu CSDL:', err);
      showToast('Lỗi khi lưu lịch tuần vào CSDL PostgreSQL.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Lịch công tác Tuần từ Excel</h3>
              <p className="text-xs text-slate-400">
                Hỗ trợ định dạng .xlsx, .xls theo mẫu chuẩn của Ban Quản lý MBS
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300 flex-1">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/60 rounded-2xl p-6 text-center space-y-3 transition-colors">
            <UploadCloud className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <label htmlFor="excel-file-input" className="cursor-pointer font-bold text-amber-400 hover:underline">
                Bấm để chọn file Excel
              </label>
              <span className="text-slate-400"> hoặc kéo thả file vào đây</span>
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {selectedFile && (
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-xl font-mono text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>{selectedFile.name}</span>
                <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {selectedFile && !parsedBatch && (
            <button
              onClick={handleParseFile}
              disabled={isParsing}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đọc và phân tích file Excel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xem trước Dữ liệu Lịch tuần</span>
                </>
              )}
            </button>
          )}

          {/* Parsed Preview Table */}
          {parsedBatch && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[11px] block">Kết quả bóc tách:</span>
                  <span className="font-bold text-white text-sm">
                    Tuần {parsedBatch.weekNumber} / {parsedBatch.year}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    ({parsedBatch.startDate ? new Date(parsedBatch.startDate).toLocaleDateString('vi-VN') : ''} - {parsedBatch.endDate ? new Date(parsedBatch.endDate).toLocaleDateString('vi-VN') : ''})
                  </span>
                </div>
                <div className="bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-700/60 font-bold text-xs text-white">
                  Tìm thấy: {parsedBatch.items?.length || 0} sự kiện
                </div>
              </div>

              {/* Mode selection */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-4">
                <span className="font-bold text-slate-400">Chế độ ghi CSDL:</span>
                <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === 'overwrite'}
                    onChange={() => setImportMode('overwrite')}
                    className="accent-amber-500"
                  />
                  <span>Ghi đè (Thay thế toàn bộ lịch tuần {parsedBatch.weekNumber})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-amber-500"
                  />
                  <span>Thêm mới (Giữ lại sự kiện cũ)</span>
                </label>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Nội dung công tác</th>
                      <th className="p-3">Chủ trì</th>
                      <th className="p-3">Địa điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900">
                    {parsedBatch.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-850">
                        <td className="p-3 font-mono text-amber-400 font-bold whitespace-nowrap">
                          {item.dayOfWeek}<br />
                          <span className="text-[10px] text-slate-400 font-normal">{item.timeSlot}</span>
                        </td>
                        <td className="p-3 font-medium text-white max-w-xs leading-snug">{item.eventTitle}</td>
                        <td className="p-3 text-slate-300 whitespace-nowrap">{item.leaderName || '-'}</td>
                        <td className="p-3 text-slate-400 max-w-xs">{item.location || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          {parsedBatch && (
            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu vào CSDL...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận Lưu vào CSDL PostgreSQL</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
