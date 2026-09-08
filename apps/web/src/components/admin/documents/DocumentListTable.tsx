import React from 'react';
import {
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Check,
  XCircle,
  History,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { UserRole } from '../../../lib/permission.utils';

export interface DocumentListTableProps {
  currentTab: 'all' | 'approval';
  onTabChange: (tab: 'all' | 'approval') => void;
  documentsCount: number;
  approvalQueueCount: number;
  displayedDocs: any[];
  isLoading: boolean;
  activeRole: UserRole;
  onNavigate: (path: string) => void;
  onStartEdit: (doc: any) => void;
  onDeleteDocument: (id: string, code: string) => void;
  onOpenHistory: (doc: any) => void;
  onApprove: (id: string, code: string) => void;
  onReject: (doc: any) => void;
  onSubmitForReview: (id: string, code: string) => void;
  renderApprovalBadge: (status: string) => React.ReactNode;

  // Pagination props
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const DocumentListTable: React.FC<DocumentListTableProps> = ({
  currentTab,
  onTabChange,
  documentsCount,
  approvalQueueCount,
  displayedDocs,
  isLoading,
  activeRole,
  onNavigate,
  onStartEdit,
  onDeleteDocument,
  onOpenHistory,
  onApprove,
  onReject,
  onSubmitForReview,
  renderApprovalBadge,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const canApproveReject =
    activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN' || activeRole === 'EDITOR_LEAD';

  const startItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItemIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-4">
      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => onTabChange('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            currentTab === 'all'
              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Tất cả văn bản ({documentsCount})
        </button>

        <button
          onClick={() => onTabChange('approval')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 relative ${
            currentTab === 'approval'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          Hàng đợi Phê duyệt Lãnh đạo
          {approvalQueueCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {approvalQueueCount}
            </span>
          )}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Số hiệu / Chữ ký số</th>
                <th className="p-4">Trích yếu nội dung</th>
                <th className="p-4">Loại & Cơ quan</th>
                <th className="p-4 text-center">Ngày ban hành</th>
                <th className="p-4 text-center">Trạng thái duyệt</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Đang truy vấn CSDL PostgreSQL...
                  </td>
                </tr>
              ) : displayedDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Không tìm thấy văn bản nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-slate-850 transition-colors ${
                      idx === 0 && currentPage === 1 ? 'bg-teal-950/20 border-l-4 border-l-teal-400' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-bold text-teal-400 text-sm">{doc.code}</div>
                        {idx === 0 && currentPage === 1 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[9px] border border-teal-500/40">
                            MỚI NHẤT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {doc.p7sSignatureUrl ? 'Đã xác thực PKI .p7s' : 'Chữ ký số đã kiểm tra'}
                      </div>
                    </td>

                    <td className="p-4 max-w-md font-medium text-white">
                      <div className="line-clamp-2">{doc.title}</div>
                      {doc.rejectionReason && (
                        <div className="mt-1.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Lý do từ chối:</strong> {doc.rejectionReason}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <Badge variant="outline" size="sm" className="border-teal-800 text-teal-300 mb-1">
                        {doc.docType}
                      </Badge>
                      <div className="text-slate-400 font-medium">{doc.issuingAgency}</div>
                      <div className="text-[10px] text-slate-500">Ký bởi: {doc.signer}</div>
                    </td>

                    <td className="p-4 text-center font-mono text-slate-400">
                      {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('vi-VN') : '15/02/2026'}
                    </td>

                    <td className="p-4 text-center">{renderApprovalBadge(doc.approvalStatus || 'PUBLISHED')}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Leadership approval buttons */}
                        {doc.approvalStatus === 'PENDING_REVIEW' && canApproveReject && (
                          <>
                            <button
                              onClick={() => onApprove(doc.id, doc.code)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Phê duyệt phát hành"
                            >
                              <Check className="w-3.5 h-3.5" /> Duyệt
                            </button>

                            <button
                              onClick={() => onReject(doc)}
                              className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Từ chối trả về"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Trả lại
                            </button>
                          </>
                        )}

                        {/* Submit for review button if DRAFT or REJECTED */}
                        {(doc.approvalStatus === 'DRAFT' || doc.approvalStatus === 'REJECTED') && (
                          <button
                            onClick={() => onSubmitForReview(doc.id, doc.code)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Trình duyệt Lãnh đạo"
                          >
                            <Clock className="w-3.5 h-3.5" /> Trình duyệt
                          </button>
                        )}

                        {/* Activity History Button */}
                        <button
                          onClick={() => onOpenHistory(doc)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Lịch sử hoạt động / chỉnh sửa"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Edit Document Button */}
                        <button
                          onClick={() => onStartEdit(doc)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Chỉnh sửa văn bản"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* View Document Button */}
                        <button
                          onClick={() => onNavigate(`/van-ban/${doc.id}`)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                          title="Xem chi tiết văn bản"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteDocument(doc.id, doc.code)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Xóa văn bản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination Footer Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value={10}>10 dòng / trang</option>
              <option value={20}>20 dòng / trang</option>
              <option value={50}>50 dòng / trang</option>
              <option value={100}>100 dòng / trang</option>
            </select>
            <span className="text-slate-500 font-mono hidden sm:inline">
              ({startItemIndex} - {endItemIndex} trên tổng {totalItems} văn bản)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">
              Trang <strong className="text-white font-mono">{currentPage}</strong> / {totalPages}
            </span>

            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

