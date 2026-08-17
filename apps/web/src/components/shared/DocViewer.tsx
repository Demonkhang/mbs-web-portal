import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download, Share2, FileText, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';
import { LegalDocument } from '../../lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/toast';

export interface DocViewerProps {
  doc: LegalDocument;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({ doc, onNavigate, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast('Bắt đầu tải tệp PDF', `Đang tải văn bản ${doc.code} (${doc.fileSize})`, 'success');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết', 'Liên kết văn bản đã được sao chép vào bộ nhớ tạm', 'info');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-700" />
          <span className="text-sm font-bold text-slate-800">Toàn văn văn bản: {doc.code}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
              disabled={zoomLevel <= 80}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2 select-none">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
              disabled={zoomLevel >= 140}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In văn bản</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Tải về PDF ({doc.fileSize})</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleShare} className="p-2" title="Chia sẻ">
            <Share2 className="w-4 h-4 text-slate-600" />
          </Button>

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      </div>

      {/* Official Government Document Paper Preview */}
      <div className="p-6 md:p-12 bg-slate-100/70 overflow-x-auto">
        <div
          className="max-w-3xl mx-auto bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-200 text-slate-900 transition-all font-serif"
          style={{ fontSize: `${zoomLevel}%` }}
        >
          {/* Header standard Vietnamese official template */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-center text-sm font-sans mb-8">
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wider text-xs sm:text-sm text-slate-800">
                {doc.issuingAgency.toUpperCase()}
              </p>
              <div className="w-16 h-0.5 bg-slate-800 mx-auto"></div>
              <p className="text-xs font-semibold text-slate-600 mt-1">Số: {doc.code}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wider text-xs sm:text-sm text-slate-900">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="text-xs font-semibold text-slate-700 italic">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-24 h-0.5 bg-slate-800 mx-auto"></div>
              <p className="text-[11px] text-slate-500 italic mt-1">Hà Nội, ngày {doc.issueDate}</p>
            </div>
          </div>

          {/* Title & Document Content */}
          <div className="text-center my-6 space-y-2 font-sans">
            <Badge variant="gov" size="md">{doc.docType.toUpperCase()}</Badge>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mt-2">
              {doc.title}
            </h2>
          </div>

          {/* Document Body Text */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif py-4">
            {doc.fullText}
          </div>

          {/* Signer block */}
          <div className="mt-12 pt-8 flex justify-between items-start font-sans text-xs sm:text-sm">
            <div className="text-slate-600 space-y-1 text-left">
              <strong className="block text-slate-800 font-bold">Nơi nhận:</strong>
              <p>- Như Điều 2;</p>
              <p>- Văn phòng Chính phủ;</p>
              <p>- Bộ TN&MT;</p>
              <p>- UBND các tỉnh, thành phố;</p>
              <p>- Lưu: VT, KTN.</p>
            </div>
            <div className="text-center space-y-2">
              <strong className="block uppercase font-bold text-slate-900">
                TM. {doc.issuingAgency.toUpperCase()}
              </strong>
              <span className="text-xs font-semibold text-slate-600 italic block">
                {doc.signer.includes('Thủ tướng') ? 'THỦ TƯỚNG' : 'BỘ TRƯỞNG / CHỦ TỊCH'}
              </span>
              <div className="h-16 flex items-center justify-center">
                {/* Official red stamp graphic indicator */}
                <div className="w-24 h-24 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center p-1 opacity-70 rotate-[-12deg] select-none text-[8px] font-bold">
                  <span>CỘNG HÒA X.H.C.N</span>
                  <span className="font-extrabold text-[9px]">VIỆT NAM</span>
                  <span>★ ĐÃ KÝ SỐ ★</span>
                </div>
              </div>
              <p className="font-bold text-slate-900 pt-2">{doc.signer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
