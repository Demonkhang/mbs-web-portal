import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Eye,
  GitCompare,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { useToast } from '../../components/ui/toast';

export interface AdminApprovalsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminApprovalsPage: React.FC<AdminApprovalsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const pendingQueue = [
    {
      id: 'appr-01',
      title: 'Triển khai hệ thống quan trắc tự động liên tục 24/7 tại Khu liên hợp xử lý chất thải Đa Phước',
      author: 'Kỹ sư Nguyễn Hoàng Nam (Phòng QLMT)',
      submittedAt: '15/02/2026 09:30',
      category: 'Khoa học & Công nghệ',
      status: 'PENDING',
      originalContent: 'Triển khai hệ thống quan trắc tự động về bụi mịn PM2.5 và H2S tại Khu xử lý rác Đa Phước...',
      editedContent: 'Triển khai hệ thống quan trắc tự động về bụi mịn PM2.5, H2S, NH3 và VOCs truyền dữ liệu 24/7 về Sở TN&MT và công khai trên Cổng MBS...',
    },
    {
      id: 'appr-02',
      title: 'Thông báo Kế hoạch điều phối xe vận chuyển rác sinh hoạt dịp cao điểm Tết 2026',
      author: 'Chuyên viên Trần Thị Mai (Văn phòng Ban)',
      submittedAt: '14/02/2026 14:20',
      category: 'Thông báo & Công khai',
      status: 'PENDING',
      originalContent: 'Phân luồng xe rác vào bãi chôn lấp...',
      editedContent: 'Phương án phân luồng giao thông chuyên dụng và điều phối 100% quân số trực 24/24 tiếp nhận rác sinh hoạt tăng 25%...',
    },
  ];

  const handleApprove = (postTitle: string) => {
    showToast('Phê duyệt thành công', `Bài viết "${postTitle}" đã được duyệt và đăng tải công khai!`, 'success');
    setSelectedPost(null);
  };

  const handleReject = () => {
    showToast('Đã trả bài viết', 'Nội dung đã được trả lại tác giả kèm ghi chú sửa đổi', 'warning');
    setIsRejectModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Hàng đợi Phê duyệt Tin bài (Diff View Workflow)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Giao diện Trưởng Ban biên tập so sánh phiên bản sửa đổi (Diff View) và phê duyệt xuất bản
          </p>
        </div>
      </div>

      {!selectedPost ? (
        /* Pending Queue List Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Bài viết đang chờ phê duyệt ({pendingQueue.length})</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {pendingQueue.map((post) => (
              <div key={post.id} className="p-5 bg-slate-900 hover:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                <div className="space-y-1.5 max-w-2xl">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                    {post.category}
                  </span>
                  <h4 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Tác giả: <strong>{post.author}</strong></span>
                    <span>•</span>
                    <span>Gửi duyệt: {post.submittedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedPost(post)}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-emerald-400" /> So sánh Diff View
                  </Button>
                  <Button
                    onClick={() => handleApprove(post.title)}
                    variant="primary"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt ngay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Side-by-Side Diff Viewer Interface */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-white">So sánh nội dung sửa đổi (Diff Viewer)</h3>
                <p className="text-xs text-slate-400">{selectedPost.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setIsRejectModalOpen(true)} variant="danger" size="sm" className="gap-1">
                <XCircle className="w-3.5 h-3.5" /> Từ chối / Trả bài
              </Button>
              <Button onClick={() => handleApprove(selectedPost.title)} variant="primary" size="sm" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt đăng bài
              </Button>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Original Version */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-900 block">
                Phiên bản gốc (Original)
              </span>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 min-h-[240px] leading-relaxed">
                {selectedPost.originalContent}
              </div>
            </div>

            {/* Right: Edited Version */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-900 block">
                Phiên bản cập nhật mới (Proposed Edit)
              </span>
              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-800/60 text-xs font-mono text-emerald-300 min-h-[240px] leading-relaxed">
                {selectedPost.editedContent}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Từ chối & Trả bài viết">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">Nhập ghi chú chi tiết lý do từ chối để tác giả tiến hành sửa đổi:</p>
          <textarea
            rows={4}
            placeholder="Ví dụ: Cần bổ sung thêm thông số kỹ thuật về chỉ số nước rỉ rác..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject}>
              Xác nhận trả bài
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
