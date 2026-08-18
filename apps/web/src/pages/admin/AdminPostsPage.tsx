import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FolderTree,
  Edit,
  Trash2,
  Eye,
  XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { useToast } from '../../components/ui/toast';
import { fetchApi } from '../../services/api-client';

export interface AdminPostsPageProps {
  onNavigate: (path: string) => void;
  subView?: 'posts' | 'categories' | 'pages';
}

export const AdminPostsPage: React.FC<AdminPostsPageProps> = ({ onNavigate, subView = 'posts' }) => {
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<'posts' | 'categories' | 'pages'>(subView);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rejection Modal State
  const [rejectingPost, setRejectingPost] = useState<any | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // New Category State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Logged-in user role
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('mbs_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  const userRole = currentUser?.role || 'CITIZEN';

  const canCreatePost = ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD', 'EDITOR'].includes(userRole);
  const canApprove = ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD'].includes(userRole);
  const canManageCategories = ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD'].includes(userRole);
  const canDeletePost = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

  // Load Posts from PostgreSQL API
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const statusParam =
        selectedStatus === 'all'
          ? ''
          : selectedStatus === 'published'
          ? 'PUBLISHED'
          : selectedStatus === 'pending'
          ? 'PENDING_REVIEW'
          : selectedStatus === 'rejected'
          ? 'REJECTED'
          : 'DRAFT';

      const endpoint = `/v1/posts${statusParam ? `?status=${statusParam}` : ''}`;
      const res = await fetchApi<{ data: any[] }>(endpoint);
      if (res && res.data) {
        setPosts(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách bài viết:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Categories from PostgreSQL API
  const loadCategories = async () => {
    try {
      const res = await fetchApi<{ data: any[] }>('/v1/categories');
      if (res && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải chuyên mục:', err);
    }
  };

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [selectedStatus]);

  // Quick Approve Post (For SUPER_ADMIN, ADMIN, EDITOR_LEAD)
  const handleQuickApprove = async (post: any) => {
    if (!canApprove) {
      showToast('Không đủ quyền hạn', 'Chỉ Trưởng Ban Biên tập hoặc Quản trị viên mới có quyền phê duyệt bài viết.', 'error');
      return;
    }

    try {
      await fetchApi(`/v1/posts/${post.id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      showToast('Phê duyệt thành công', `Bài viết "${post.title}" đã được duyệt & chuyển sang trạng thái ĐÃ XUẤT BẢN.`, 'success');
      loadPosts();
    } catch (err: any) {
      showToast('Lỗi phê duyệt', err.message || 'Không thể phê duyệt bài viết', 'error');
    }
  };

  // Confirm Reject with Reason (Chuyển trạng thái sang Đã Hủy / REJECTED)
  const handleConfirmReject = async () => {
    if (!rejectingPost) return;
    if (!canApprove) {
      showToast('Không đủ quyền hạn', 'Chỉ Trưởng Ban Biên tập mới có quyền trả lại bài viết.', 'error');
      return;
    }

    if (!rejectionReasonInput.trim()) {
      showToast('Thiếu thông tin', 'Vui lòng nhập lý do hủy / trả bài viết để biên tập viên chỉnh sửa.', 'warning');
      return;
    }

    try {
      await fetchApi(`/v1/posts/${rejectingPost.id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'REJECT', reason: rejectionReasonInput.trim() }),
      });
      showToast('Đã hủy duyệt bài viết', `Bài viết "${rejectingPost.title}" đã chuyển từ Chờ duyệt sang ĐÃ HỦY (REJECTED) thành công.`, 'warning');
      setIsRejectModalOpen(false);
      setRejectingPost(null);
      setRejectionReasonInput('');
      loadPosts();
    } catch (err: any) {
      showToast('Lỗi hủy bài viết', err.message || 'Không thể hủy bài viết', 'error');
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!canDeletePost) {
      showToast('Không đủ quyền hạn', 'Chỉ Quản trị viên mới có quyền xóa bài viết.', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" khỏi CSDL PostgreSQL?`)) return;

    try {
      await fetchApi(`/v1/posts/${id}`, { method: 'DELETE' });
      showToast('Xóa thành công', `Đã xóa bài viết "${title}" khỏi CSDL`, 'success');
      setPosts((prev) => prev.filter((p) => p.id !== id));
      loadPosts();
    } catch (err: any) {
      showToast('Lỗi xóa bài viết', err.message || 'Không thể xóa bài viết', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await fetchApi('/v1/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      showToast('Tạo chuyên mục thành công', `Đã thêm chuyên mục "${newCatName}" vào CSDL PostgreSQL`, 'success');
      setNewCatName('');
      setIsAddCatModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast('Lỗi tạo chuyên mục', err.message || 'Không thể tạo chuyên mục', 'error');
    }
  };

  const pagesList = [
    { title: 'Giới thiệu chung Ban Quản lý MBS', slug: '/gioi-thieu', updatedAt: '12/01/2026', views: 12500 },
    { title: 'Chức năng - Nhiệm vụ chính thức', slug: '/so-do-to-chuc?tab=functions', updatedAt: '10/01/2026', views: 8900 },
    { title: 'Cơ cấu sơ đồ tổ chức bộ máy', slug: '/so-do-to-chuc?tab=org', updatedAt: '05/01/2026', views: 14200 },
  ];

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            {currentView === 'posts' && 'Phân hệ Quản lý Bài viết & Tin tức (CMS)'}
            {currentView === 'categories' && 'Quản lý Chuyên mục Tin bài'}
            {currentView === 'pages' && 'Quản lý Nội dung Trang tĩnh'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Soạn thảo, quản lý bài viết, chuyên mục phân cấp và xuất bản nội dung lên Cổng thông tin (CSDL PostgreSQL)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setCurrentView('posts')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentView === 'posts' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Bài viết
            </button>
            <button
              onClick={() => setCurrentView('categories')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentView === 'categories' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Chuyên mục
            </button>
            <button
              onClick={() => setCurrentView('pages')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentView === 'pages' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Trang tĩnh
            </button>
          </div>

          {currentView === 'posts' && canCreatePost && (
            <Button onClick={() => onNavigate('/admin/posts/new')} variant="primary" size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Soạn bài viết mới
            </Button>
          )}
        </div>
      </div>

      {currentView === 'posts' && (
        <>
          {/* Filters Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm bài viết theo tiêu đề, tác giả trong DB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Trạng thái:</span>
              {['all', 'published', 'pending', 'rejected', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${selectedStatus === status ? 'bg-slate-800 text-emerald-400 border border-emerald-800' : 'text-slate-400 hover:text-white'}`}
                >
                  {status === 'all' && 'Tất cả'}
                  {status === 'published' && 'Đã xuất bản'}
                  {status === 'pending' && 'Chờ duyệt'}
                  {status === 'rejected' && 'Đã hủy'}
                  {status === 'draft' && 'Bản nháp'}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Bài viết & Tóm tắt</th>
                    <th className="p-4">Chuyên mục</th>
                    <th className="p-4">Tác giả</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Lượt xem</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Đang tải danh sách bài viết từ CSDL PostgreSQL...
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Chưa có bài viết nào trong CSDL PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-850 transition-colors">
                        <td className="p-4 max-w-md">
                          <div className="flex items-start gap-3">
                            <img
                              src={post.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=120&q=80'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800"
                            />
                            <div>
                              <h4 className="font-bold text-white text-xs hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1">
                                {post.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{post.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" size="sm" className="border-emerald-800 text-emerald-300">
                            {post.category?.name || 'Tin tức'}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400 font-medium">{post.author?.fullName || 'Cán bộ MBS'}</td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {post.status === 'PUBLISHED' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Đã xuất bản
                              </span>
                            )}
                            {post.status === 'PENDING_REVIEW' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
                                <Clock className="w-3 h-3" /> Chờ duyệt
                              </span>
                            )}
                            {post.status === 'DRAFT' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                                Bản nháp
                              </span>
                            )}
                            {post.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-800">
                                <XCircle className="w-3 h-3" /> Đã hủy
                              </span>
                            )}
                            {post.rejectionReason && post.status === 'REJECTED' && (
                              <span className="text-[10px] text-rose-400/90 italic max-w-[160px] truncate" title={`Lý do hủy duyệt: ${post.rejectionReason}`}>
                                Lý do: {post.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-300">{post.views || 0}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Action Buttons for Approver Role */}
                            {canApprove && post.status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(post)}
                                  className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                  title="Phê duyệt & Xuất bản tin này ngay"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingPost(post);
                                    setRejectionReasonInput('');
                                    setIsRejectModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                  title="Từ chối & Chuyển sang Đã hủy kèm lý do"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Từ chối
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => onNavigate(`/admin/posts/${post.id}/edit`)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                              title="Chỉnh sửa bài viết"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onNavigate(`/tin-tuc/${post.slug}`)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                              title="Xem bài viết công khai"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canDeletePost && (
                              <button
                                onClick={() => handleDeletePost(post.id, post.title)}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Xóa bài viết (SUPER_ADMIN / ADMIN)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {currentView === 'categories' && (
        /* Categories Tree View from PostgreSQL DB */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Danh sách Chuyên mục từ CSDL PostgreSQL</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quản lý các danh mục phân loại tin bài của Cổng thông tin</p>
            </div>
            {canManageCategories && (
              <Button onClick={() => setIsAddCatModalOpen(true)} size="sm" variant="primary" className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Thêm chuyên mục mới
              </Button>
            )}
          </div>

          {/* Modal thêm chuyên mục mới */}
          {isAddCatModalOpen && (
            <form onSubmit={handleAddCategory} className="p-4 bg-slate-950 border border-emerald-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Thêm mới chuyên mục vào PostgreSQL</h4>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Nhập tên chuyên mục (VD: Môi trường & Đô thị)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Button type="submit" size="sm" variant="primary">Lưu vào DB</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAddCatModalOpen(false)}>Hủy</Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <FolderTree className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                    <span className="text-xs font-mono text-slate-500">Slug: /tin-tuc?cat={cat.slug}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'pages' && (
        /* Static Pages View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white pb-4 border-b border-slate-800">Danh sách Trang cố định Hệ thống</h3>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {pagesList.map((page, idx) => (
              <div key={idx} className="p-4 bg-slate-950 hover:bg-slate-900 flex items-center justify-between transition-colors">
                <div>
                  <h4 className="font-bold text-white text-sm">{page.title}</h4>
                  <span className="text-xs font-mono text-emerald-400">{page.slug}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Cập nhật: {page.updatedAt}</span>
                  <Button variant="outline" size="sm" className="text-xs bg-slate-900 border-slate-800 text-slate-200">
                    Chỉnh sửa nội dung
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal từ chối bài viết chuyển sang Đã Hủy */}
      {isRejectModalOpen && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRejectingPost(null);
          }}
          title="Từ chối & Chuyển trạng thái ĐÃ HỦY bài viết"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Tiêu đề bài viết:</span>
              <strong className="text-white font-bold text-sm leading-snug block">{rejectingPost?.title}</strong>
              <div className="flex items-center gap-3 text-slate-400 pt-1 text-[11px]">
                <span>Tác giả: <strong className="text-slate-200">{rejectingPost?.author?.fullName || 'Biên tập viên'}</strong></span>
                <span>•</span>
                <span>Chuyên mục: <strong className="text-emerald-400">{rejectingPost?.category?.name || 'Tin tức'}</strong></span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2">
                Ghi chú Lý do từ chối & Yêu cầu chỉnh sửa *
              </label>
              <textarea
                rows={4}
                placeholder="Nhập chi tiết lý do từ chối (VD: Thông tin chưa kiểm chứng, bài viết trùng lặp nội dung, hình ảnh chưa đạt tiêu chuẩn...). Bài viết sẽ chuyển sang trạng thái ĐÃ HỦY."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectingPost(null);
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmReject}
                className="bg-rose-950 border-rose-800 text-rose-300 hover:bg-rose-900 font-bold"
              >
                Xác nhận Từ chối (Đổi sang Đã Hủy)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
