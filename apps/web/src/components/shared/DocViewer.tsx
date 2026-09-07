import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download, Share2, FileText, CheckCircle2, FileUp, ExternalLink, Eye } from 'lucide-react';
import { LegalDocument } from '../../lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/toast';
import { getAbsolutePdfUrl, downloadPdfFile } from '../../lib/utils';

export interface DocViewerProps {
  doc: LegalDocument;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({ doc, onNavigate, onClose }) => {
  const { showToast } = useToast();

  const pdfUrl = getAbsolutePdfUrl(doc.fileUrl || '/uploads/documents/van-ban-mbs-2026.pdf');
  const [iframeError, setIframeError] = useState(false);

  const handlePrint = () => {
    if (pdfUrl) {
      const win = window.open(pdfUrl, '_blank');
      if (win) win.print();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    downloadPdfFile(doc.fileUrl, doc.code, showToast);
  };


  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết', 'Liên kết văn bản đã được sao chép vào bộ nhớ tạm', 'info');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Top Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-sm font-bold text-white block">Xem trước Văn bản: {doc.code}</span>
            <span className="text-[11px] text-slate-400 font-mono truncate max-w-md block">{doc.title}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 bg-slate-800 border-slate-700 text-slate-200 hover:text-white">
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In tệp</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownload} className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
            <Download className="w-3.5 h-3.5" />
            <span>Tải tệp PDF</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleShare} className="p-2 text-slate-300 hover:text-white" title="Chia sẻ">
            <Share2 className="w-4 h-4" />
          </Button>

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose} className="bg-slate-800 border-slate-700 text-slate-200 hover:text-white">
              Đóng
            </Button>
          )}
        </div>
      </div>

      {/* Main PDF Document Content Container Only */}
      <div className="bg-slate-900 relative min-h-[500px]">
        {pdfUrl && !iframeError ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title={`PDF Viewer - ${doc.code}`}
            onError={() => setIframeError(true)}
            className="w-full h-[750px] border-0 bg-slate-100"
          />
        ) : (
          <div className="p-12 text-center text-slate-300 space-y-4 max-w-lg mx-auto py-24">
            <FileText className="w-16 h-16 text-emerald-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-white">Xem trước File PDF Đính kèm</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Văn bản <strong>{doc.code}</strong> được lưu trữ dưới định dạng tệp PDF. Bạn có thể mở tệp trực tiếp trong tab mới hoặc tải tệp về máy tính.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" /> Mở Tệp PDF trong tab mới
                </a>
              )}
              <Button variant="outline" size="sm" onClick={handleDownload} className="bg-slate-800 border-slate-700 text-white">
                <Download className="w-4 h-4 mr-1" /> Tải về PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
