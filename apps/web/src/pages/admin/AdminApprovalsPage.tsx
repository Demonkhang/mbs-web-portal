import React, { useState, useEffect } from 'react';
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
import { fetchApi } from '../../services/api-client';

export interface AdminApprovalsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminApprovalsPage: React.FC<AdminApprovalsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Logged in user role
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('mbs_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  const userRole = currentUser?.role || 'CITIZEN';
  const canApprove = ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD'].includes(userRole);

  const loadPendingPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ data: any[] }>('/v1/posts?status=pending');
      if (res && res.data) {
        setPendingQueue(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bài viết chờ duyệt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const handleApprove = async (post: any) => {
    if (!canApprove) {
      showToast('Không đủ quyền hạn', 'Chỉ Lãnh đạo Ban biên tập hoặc Super Admin mới có quyền duyệt bài viết.', 'error');
      return;
    }

    try {
      await fetchApi(`/v1/posts/${post.id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      showToast('Phê duyệt thành công', `Bài viết "${post.title}" đã được duyệt và chuyển sang bước Xuất bản!`, 'success');
      setSelectedPost(null);
      loadPendingPosts();
    } catch (err: any) {
      showToast('Lỗi phê duyệt', err.message || 'Không thể phê duyệt bài viết', 'error');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedPost) return;
    if (!canApprove) {
      showToast('Không đủ quyền hạn', 'Chỉ Lãnh đạo Ban biên tập mới có quyền trả bài viết.', 'error');
      return;
    }

    try {
      await fetchApi(`/v1/posts/${selectedPost.id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'REJECT', reason: reviewNote || 'Chưa đạt yêu cầu biên tập' }),
      });
      showToast('Đã trả bài viết', 'Bài viết đã được trả lại tác giả kèm ghi chú yêu cầu chỉnh sửa', 'warning');
      setIsRejectModalOpen(false);
      setSelectedPost(null);
      setReviewNote('');
      loadPendingPosts();
    } catch (err: any) {
      showToast('Lỗi trả bài', err.message || 'Không thể từ chối bài viết', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Hàng đợi Phê duyệt Tin bài (Luồng 5 bước CSDL PostgreSQL)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Giao diện Lãnh đạo Ban biên tập xem xét bài viết, rà soát tiến trình 5 bước và phê duyệt xuất bản
          </p>
        </div>
      </div>

      {!selectedPost ? (
        /* Pending Queue List Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Bài viết đang chờ phê duyệt ({pendingQueue.length})</h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              Đang tải hàng đợi phê duyệt bài viết từ CSDL PostgreSQL...
            </div>
          ) : pendingQueue.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              Hiện tại không có bài viết nào trong hàng đợi chờ xử lý phê duyệt.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {pendingQueue.map((post) => (
                <div key={post.id} className="p-5 bg-slate-900 hover:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-800">
                        {post.category?.name || 'Tin tức'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        post.status === 'PENDING_APPROVAL' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        post.status === 'IN_EDITING' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                        'bg-sky-950 text-sky-300 border-sky-800'
                      }`}>
                        {post.status === 'PENDING_APPROVAL' ? 'Bước 3: Chờ Lãnh đạo Duyệt' :
                         post.status === 'IN_EDITING' ? 'Bước 2: Đang Biên tập' : 'Bước 2: Đã gửi Biên tập'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onNavigate(`/admin/posts/edit/${post.id}`)}>
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Tác giả: <strong>{post.author?.fullName || 'Biên tập viên'}</strong></span>
                      {post.assignedToName && (
                        <>
                          <span>•</span>
                          <span className="text-amber-300">Phân công: <strong>{post.assignedToName}</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>Ngày tạo: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate(`/admin/posts/edit/${post.id}`)}
                      className="gap-1 bg-slate-950 border-slate-800 text-sky-400 hover:text-sky-300 text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" /> Biên tập & Chấm điểm (Bước 5)
                    </Button>
                    {canApprove && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApprove(post)}
                          className="gap-1 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPost(post);
                            setIsRejectModalOpen(true);
                          }}
                          className="gap-1 text-xs border-rose-800 text-rose-400 hover:bg-rose-950"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Diff / Review Detail View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách hàng đợi
            </button>
            <div className="flex items-center gap-2">
              {canApprove && (
                <>
                  <Button size="sm" variant="primary" onClick={() => handleApprove(selectedPost)} className="gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt & Xuất bản ngay
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsRejectModalOpen(true)} className="gap-1 border-rose-800 text-rose-400">
                    <XCircle className="w-3.5 h-3.5" /> Từ chối bài viết
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{selectedPost.title}</h2>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p><strong>Tác giả:</strong> {selectedPost.author?.fullName || 'Biên tập viên'}</p>
              <p><strong>Tóm tắt:</strong> {selectedPost.summary}</p>
              <p><strong>Chuyên mục:</strong> {selectedPost.category?.name || 'Chưa phân loại'}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400">Nội dung chi tiết:</h3>
              <div
                className="text-xs text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối bài viết */}
      {isRejectModalOpen && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Từ chối & Trả bài viết về Biên tập viên"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Ghi chú lý do yêu cầu chỉnh sửa *</label>
              <textarea
                rows={4}
                placeholder="Nhập lý do từ chối hoặc yêu cầu bổ sung thông tin..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectSubmit} className="border-rose-800 text-rose-400 bg-rose-950">
                Xác nhận trả bài
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
