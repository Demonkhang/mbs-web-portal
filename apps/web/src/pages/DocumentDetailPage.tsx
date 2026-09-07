import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Share2, Calendar, Building2, User, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { MOCK_DOCUMENTS } from '../lib/mock-data';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { DocViewer } from '../components/shared/DocViewer';
import { useToast } from '../components/ui/toast';
import { fetchApi } from '../services/api-client';
import { downloadPdfFile } from '../lib/utils';

export interface DocumentDetailPageProps {
  id: string;
  onNavigate: (path: string) => void;
}

export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ id, onNavigate }) => {
  const { showToast } = useToast();
  const [doc, setDoc] = useState<any | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadDocDetail = async () => {
      try {
        // 1. Try fetching exact document from PostgreSQL API
        const res = await fetchApi<{ data: any }>(`/v1/documents/${id}`);
        if (res && res.data && isMounted) {
          setDoc(res.data);
        } else {
          // Fallback to mock data if API doc not found
          const mock = MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];
          if (isMounted) setDoc(mock);
        }
      } catch (err) {
        // Fallback to mock data on error
        const mock = MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];
        if (isMounted) setDoc(mock);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const loadRelatedDocs = async () => {
      try {
        const resAll = await fetchApi<{ data: any[] }>('/v1/documents');
        if (resAll && resAll.data && isMounted) {
          const others = resAll.data.filter((d) => d.id !== id).slice(0, 4);
          setRelatedDocs(others);
        }
      } catch (e) {
        const mockOthers = MOCK_DOCUMENTS.filter((d) => d.id !== id).slice(0, 4);
        if (isMounted) setRelatedDocs(mockOthers);
      }
    };

    loadDocDetail();
    loadRelatedDocs();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownload = () => {
    if (!doc) return;
    downloadPdfFile(doc.fileUrl, doc.code || 'van-ban', showToast);
  };


  const handlePrint = () => {
    window.print();
  };

  const formatDateStr = (dateVal?: string) => {
    if (!dateVal) return '15/02/2026';
    try {
      return new Date(dateVal).toLocaleDateString('vi-VN');
    } catch (e) {
      return dateVal;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold">Đang tải chi tiết văn bản từ CSDL PostgreSQL...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy văn bản pháp quy</h2>
        <Button variant="outline" size="sm" onClick={() => onNavigate('/van-ban')}>
          Quay lại danh sách văn bản
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Văn bản pháp quy', href: '/van-ban' },
            { label: doc.code },
          ]}
          onNavigate={onNavigate}
        />

        {/* Back Link */}
        <div>
          <button
            onClick={() => onNavigate('/van-ban')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách văn bản</span>
          </button>
        </div>

        {/* Document Header & Metadata Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                  {doc.code}
                </span>
                <Badge variant={doc.status === 'Hết hiệu lực' ? 'danger' : 'success'}>
                  {doc.status || 'Còn hiệu lực'}
                </Badge>
                <span className="text-xs text-slate-500 font-semibold">• {doc.docType}</span>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {doc.title}
              </h1>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="md" onClick={handleDownload} className="gap-2 shadow-sm font-bold">
                <Download className="w-4 h-4" />
                <span>Tải PDF ({doc.fileSize || 'PDF'})</span>
              </Button>
              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="In văn bản"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metadata Grid Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Cơ quan ban hành:</span>
              <strong className="text-slate-900 font-bold">{doc.issuingAgency}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Người ký duyệt:</span>
              <strong className="text-slate-900 font-bold">{doc.signer || 'Ban Giám đốc'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Ngày ban hành:</span>
              <strong className="text-slate-900 font-mono font-bold">{formatDateStr(doc.issueDate)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Ngày có hiệu lực:</span>
              <strong className="text-emerald-700 font-mono font-bold">{formatDateStr(doc.effectiveDate)}</strong>
            </div>
          </div>

          {/* Trích yếu tóm tắt nội dung */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Trích yếu nội dung văn bản
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 leading-relaxed">
              {doc.title}
            </p>
          </div>

          {/* Electronic Document Layout Viewer */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Toàn văn văn bản điện tử
            </h3>
            <DocViewer doc={doc} />
          </div>
        </div>

        {/* Related Documents */}
        {relatedDocs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              VĂN BẢN LIÊN QUAN & CĂN CỨ PHÁP LÝ
            </h3>

            <div className="divide-y divide-slate-100">
              {relatedDocs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(`/van-ban/${item.id}`)}
                  className="py-3 flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{formatDateStr(item.issueDate)}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 shrink-0 group-hover:underline">
                    Xem chi tiết &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
