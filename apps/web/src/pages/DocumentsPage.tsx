import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Eye, Calendar, Building2, RotateCcw } from 'lucide-react';
import { DOCUMENT_TYPES, ISSUING_AGENCIES } from '../lib/mock-data';
import { LegalDocument } from '../lib/types';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Pagination } from '../components/ui/pagination';
import { DocViewer } from '../components/shared/DocViewer';
import { useToast } from '../components/ui/toast';
import { formatDate, downloadPdfFile } from '../lib/utils';
import { fetchApi } from '../services/api-client';

export interface DocumentsPageProps {
  onNavigate: (path: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [selectedAgency, setSelectedAgency] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingDoc, setViewingDoc] = useState<LegalDocument | null>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = 5;

  useEffect(() => {
    setIsLoading(true);
    // Fetch live legal documents from PostgreSQL DB API
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append('q', searchKeyword.trim());
    if (selectedType !== 'Tất cả') params.append('docType', selectedType);

    const endpoint = `/v1/documents/search?${params.toString()}`;
    fetchApi<{ data: any[] }>(endpoint)
      .then((res) => {
        if (res && res.data) {
          setDocuments(res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải kho văn bản:', err);
      })
      .finally(() => setIsLoading(false));
  }, [searchKeyword, selectedType]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchAgency = selectedAgency === 'Tất cả' || doc.issuingAgency === selectedAgency;
      const matchStatus = selectedStatus === 'Tất cả' || doc.status === selectedStatus;
      return matchAgency && matchStatus;
    });
  }, [documents, selectedAgency, selectedStatus]);

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
    setCurrentPage(1);
  };

  const handleDownload = (doc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPdfFile(doc.fileUrl, doc.code, showToast);
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
            Tra cứu văn bản quy phạm pháp luật, quyết định, quy chuẩn kỹ thuật quốc gia từ CSDL PostgreSQL
          </p>
        </div>

        {/* Filter & Search Bar Box */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
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
              placeholder="Nhập số ký hiệu hoặc từ khóa trích yếu văn bản trong CSDL PostgreSQL..."
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
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilter}
                className="w-full justify-center text-xs gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>

        {/* Document Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Tìm thấy <strong>{filteredDocs.length}</strong> văn bản phù hợp trong CSDL PostgreSQL</span>
        </div>

        {/* Main List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Đang truy vấn kho văn bản từ CSDL PostgreSQL...
          </div>
        ) : paginatedDocs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Search className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy văn bản nào trong CSDL</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Vui lòng thay đổi từ khóa hoặc xóa bớt tiêu chí lọc.
            </p>
            <Button size="sm" variant="outline" onClick={handleResetFilter}>
              Đặt lại bộ lọc
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setViewingDoc(doc)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono text-xs border border-emerald-200">
                      {doc.code}
                    </span>
                    <Badge variant="gov">{doc.docType}</Badge>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {doc.status || 'Còn hiệu lực'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {doc.issuingAgency}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Ban hành: {formatDate(doc.issueDate)}
                    </span>
                    <span>•</span>
                    <span>Lĩnh vực: <strong>{doc.domain || 'Môi trường'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingDoc(doc);
                    }}
                    className="text-xs gap-1 border-slate-300 hover:bg-slate-50"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem trước
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => handleDownload(doc, e)}
                    className="text-xs gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải về
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Preview Modal */}
        {viewingDoc && (
          <DocViewer
            doc={viewingDoc}
            onClose={() => setViewingDoc(null)}
          />
        )}
      </div>
    </div>
  );
};
