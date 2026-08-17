import React, { useState, useMemo } from 'react';
import { Search, FileText, Download, Eye, Calendar, Filter, Building2, User, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { MOCK_DOCUMENTS, DOCUMENT_TYPES, ISSUING_AGENCIES } from '../lib/mock-data';
import { LegalDocument } from '../lib/types';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Pagination } from '../components/ui/pagination';
import { DocViewer } from '../components/shared/DocViewer';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export interface DocumentsPageProps {
  onNavigate: (path: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [selectedAgency, setSelectedAgency] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [selectedYear, setSelectedYear] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingDoc, setViewingDoc] = useState<LegalDocument | null>(null);

  const pageSize = 5;

  const filteredDocs = useMemo(() => {
    return MOCK_DOCUMENTS.filter((doc) => {
      const matchKeyword =
        !searchKeyword.trim() ||
        doc.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        doc.fullText.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchType = selectedType === 'Tất cả' || doc.docType === selectedType;
      const matchAgency = selectedAgency === 'Tất cả' || doc.issuingAgency === selectedAgency;
      const matchStatus = selectedStatus === 'Tất cả' || doc.status === selectedStatus;
      const matchYear = selectedYear === 'Tất cả' || doc.issueDate.includes(selectedYear);

      return matchKeyword && matchType && matchAgency && matchStatus && matchYear;
    });
  }, [searchKeyword, selectedType, selectedAgency, selectedStatus, selectedYear]);

  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, currentPage]);

  const handleResetFilter = () => {
    setSearchKeyword('');
    setSelectedType('Tất cả');
    setSelectedAgency('Tất cả');
    setSelectedStatus('Tất cả');
    setSelectedYear('Tất cả');
    setCurrentPage(1);
  };

  const handleDownload = (doc: LegalDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('Bắt đầu tải văn bản', `Đang tải xuống ${doc.code} (${doc.fileSize})...`, 'info');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Kho văn bản pháp quy' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Header Title */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            HỆ THỐNG VĂN BẢN PHÁP QUY & CHỈ ĐẠO ĐIỀU HÀNH
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu văn bản quy phạm pháp luật, quyết định, quy chuẩn kỹ thuật quốc gia về môi trường và xử lý chất thải rắn
          </p>
        </div>

        {/* Filter & Search Bar Box */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Top Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Nhập số ký hiệu hoặc từ khóa trích yếu văn bản (VD: 04/2026/QĐ-UBND, chỉ thị, chất thải rắn...)"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* Select Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Loại văn bản</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Cơ quan ban hành</label>
              <select
                value={selectedAgency}
                onChange={(e) => {
                  setSelectedAgency(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                {ISSUING_AGENCIES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tình trạng hiệu lực</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Còn hiệu lực">Còn hiệu lực</option>
                <option value="Hết hiệu lực">Hết hiệu lực</option>
                <option value="Bị thay thế">Bị thay thế</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Năm ban hành</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                <option value="Tất cả">Tất cả các năm</option>
                <option value="2026">Năm 2026</option>
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
                <option value="2023">Năm 2023</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Link */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Tìm thấy <strong>{filteredDocs.length}</strong> văn bản phù hợp
            </span>
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Documents Table / List */}
        <div className="space-y-4">
          {paginatedDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy văn bản nào</h3>
              <p className="text-xs text-slate-500">Vui lòng điều chỉnh từ khóa hoặc bộ lọc tra cứu.</p>
              <Button variant="outline" size="sm" onClick={handleResetFilter}>
                Đặt lại tìm kiếm
              </Button>
            </div>
          ) : (
            paginatedDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigate(`/van-ban/${doc.id}`)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {doc.code}
                    </span>
                    <Badge variant={doc.status === 'con-hieu-luc' ? 'success' : 'danger'}>
                      {doc.status === 'con-hieu-luc' ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">• {doc.docType}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 leading-snug transition-colors">
                    {doc.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {doc.issuingAgency}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Ban hành: {doc.issueDate}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Người ký: {doc.signer}
                    </span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingDoc(doc);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors cursor-pointer"
                    title="Xem nhanh văn bản"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDownload(doc, e)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors cursor-pointer"
                    title={`Tải xuống tệp PDF (${doc.fileSize})`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 transition-all gap-1"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Quick Modal Document Viewer */}
        {viewingDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
              <DocViewer
                doc={viewingDoc}
                onClose={() => setViewingDoc(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
