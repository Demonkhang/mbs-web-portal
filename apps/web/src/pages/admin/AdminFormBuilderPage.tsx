import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Move,
  CheckCircle2,
  Eye,
  Save,
  Type,
  FileText,
  Calendar,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';

export interface AdminFormBuilderPageProps {
  onNavigate: (path: string) => void;
}

export const AdminFormBuilderPage: React.FC<AdminFormBuilderPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [formFields, setFormFields] = useState([
    { id: 'f1', label: 'Tên Tổ chức / Doanh nghiệp nộp hồ sơ', type: 'text', required: true },
    { id: 'f2', label: 'Mã số thuế / Số ĐKKD', type: 'text', required: true },
    { id: 'f3', label: 'Số lượng xe vận chuyển đăng ký (Chiếc)', type: 'number', required: false },
    { id: 'f4', label: 'Ngày dự kiến bắt đầu tiếp nhận chất thải', type: 'date', required: true },
    { id: 'f5', label: 'Tải lên Giấy phép môi trường (PDF/DOCX)', type: 'file', required: true },
  ]);

  const addField = (fieldType: string) => {
    const id = `f_${Date.now()}`;
    const newField = {
      id,
      label: fieldType === 'file' ? 'Tải lên tài liệu kèm theo' : 'Trường thông tin mới',
      type: fieldType,
      required: true,
    };
    setFormFields([...formFields, newField]);
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter((f) => f.id !== id));
  };

  const handleSaveForm = () => {
    showToast('Lưu Biểu mẫu thành công', 'Cấu hình form tiếp nhận hồ sơ đã được áp dụng lên Cổng Dịch vụ công!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-emerald-400" />
            Thiết lập Biểu mẫu Động (Dynamic Form Builder)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Công cụ kéo thả thiết lập các trường thông tin trong form tiếp nhận hồ sơ DVC
          </p>
        </div>

        <Button onClick={handleSaveForm} variant="primary" size="sm" className="gap-1.5">
          <Save className="w-4 h-4" /> Xuất bản Biểu mẫu
        </Button>
      </div>

      {/* Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Field Palette Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bộ chọn Loại trường dữ liệu</h3>

          <div className="space-y-2 text-xs font-bold">
            <button onClick={() => addField('text')} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-slate-200 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2"><Type className="w-4 h-4 text-emerald-400" /> Trường văn bản (Text Input)</span>
              <Plus className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button onClick={() => addField('date')} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-slate-200 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-400" /> Trường chọn Ngày (Date Picker)</span>
              <Plus className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button onClick={() => addField('file')} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-slate-200 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-amber-400" /> Trường đính kèm Tệp (File Upload)</span>
              <Plus className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Right Interactive Form Preview canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" /> Xem trước Giao diện Form (Live Preview)
            </h3>
            <span className="text-xs text-slate-400 font-mono">{formFields.length} trường thông tin</span>
          </div>

          <div className="space-y-4">
            {formFields.map((field, idx) => (
              <div key={field.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Move className="w-4 h-4 text-slate-600 cursor-grab shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{field.label}</span>
                      {field.required && <span className="text-rose-500 text-xs font-bold">*</span>}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900 inline-block">
                      {field.type}
                    </span>
                  </div>
                </div>

                <button onClick={() => removeField(field.id)} className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
