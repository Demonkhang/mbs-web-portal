import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { MOCK_DOCUMENTS, DOCUMENT_TYPES, ISSUING_AGENCIES } from '../../lib/mock-data';

export interface AdminDocumentsPageProps {
  onNavigate: (path: string) => void;
  subView?: 'list' | 'new';
}

export const AdminDocumentsPage: React.FC<AdminDocumentsPageProps> = ({ onNavigate, subView = 'list' }) => {
  const { showToast } = useToast();
  const [currentSubView, setCurrentSubView] = useState<'list' | 'new'>(subView);

  // Form State
  const [docCode, setDocCode] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Nghị định');
  const [issuingAgency, setIssuingAgency] = useState('Chính phủ');
  const [signer, setSigner] = useState('');
  const [issueDate, setIssueDate] = useState('2026-02-15');
  const [effectiveDate, setEffectiveDate] = useState('2026-02-15');
  const [fullText, setFullText] = useState('');

  const handleCreateDocument = () => {
    showToast('Tải lên thành công', `Văn bản ${docCode || 'mới'} đã được thêm vào Kho dữ liệu & kích hoạt Full-Text Search!`, 'success');
    setCurrentSubView('list');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {currentSubView === 'new' && (
            <button
              onClick={() => setCurrentSubView('list')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileCheck className="w-6 h-6 text-teal-400" />
              {currentSubView === 'list' ? 'Quản trị Kho Văn bản Pháp quy' : 'Thêm mới Văn bản Quy phạm'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Quản lý văn bản pháp luật, metadata và kích hoạt Full-Text Search (pg_trgm)
            </p>
          </div>
        </div>

        {currentSubView === 'list' && (
          <Button onClick={() => setCurrentSubView('new')} variant="primary" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Thêm văn bản mới
          </Button>
        )}
      </div>

      {currentSubView === 'list' ? (
        /* Documents Repository Table View */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm văn bản theo số hiệu, trích yếu, người ký..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <select className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                {DOCUMENT_TYPES.map((t, i) => <option key={i}>{t}</option>)}
              </select>
              <select className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                {ISSUING_AGENCIES.map((a, i) => <option key={i}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Số hiệu</th>
                    <th className="p-4">Trích yếu nội dung</th>
                    <th className="p-4">Loại văn bản</th>
                    <th className="p-4">Cơ quan / Người ký</th>
                    <th className="p-4 text-center">Ngày ban hành</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {MOCK_DOCUMENTS.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-850 transition-colors">
                      <td className="p-4 font-mono font-bold text-teal-400">{doc.code}</td>
                      <td className="p-4 max-w-md font-medium text-white line-clamp-2">{doc.title}</td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm" className="border-teal-800 text-teal-300">
                          {doc.docType}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="font-bold text-slate-300">{doc.issuingAgency}</div>
                        <div className="text-[10px] text-slate-500">{doc.signer}</div>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-400">{doc.issueDate}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${doc.status === 'con-hieu-luc' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'}`}>
                          {doc.status === 'con-hieu-luc' ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onNavigate(`/van-ban/${doc.id}`)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-teal-400" title="Xem văn bản">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400" title="Sửa">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Add/Update Document Form View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">Nhập Metadata & Tải tệp Văn bản</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Số / Ký hiệu văn bản *</label>
              <input
                type="text"
                placeholder="Ví dụ: 08/2026/NĐ-CP"
                value={docCode}
                onChange={(e) => setDocCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Loại văn bản *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                {DOCUMENT_TYPES.filter(t => t !== 'Tất cả').map((t, i) => <option key={i}>{t}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Trích yếu nội dung *</label>
              <textarea
                rows={2}
                placeholder="Nhập trích yếu tóm tắt nội dung văn bản..."
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Cơ quan ban hành *</label>
              <input
                type="text"
                value={issuingAgency}
                onChange={(e) => setIssuingAgency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Người ký *</label>
              <input
                type="text"
                placeholder="Ví dụ: Phó Thủ tướng..."
                value={signer}
                onChange={(e) => setSigner(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Ngày ban hành</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Ngày có hiệu lực</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Toàn văn bản (Đăng tải cho Full-Text Search)</label>
              <textarea
                rows={6}
                placeholder="Dán toàn văn bản để lập chỉ mục tìm kiếm Full-Text Search pg_trgm..."
                value={fullText}
                onChange={(e) => setFullText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setCurrentSubView('list')} className="bg-slate-950 border-slate-800 text-slate-300">
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDocument} className="gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Lưu & Lập chỉ mục Tìm kiếm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
