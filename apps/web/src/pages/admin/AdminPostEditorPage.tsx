import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Send,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Award,
  Eye,
  AlertTriangle,
  FileUp,
  X,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';
import { fetchApi } from '../../services/api-client';
import { RichTextToolbar } from '../../components/admin/RichTextToolbar';

export interface AdminPostEditorPageProps {
  onNavigate: (path: string) => void;
  postId?: string;
}

export const AdminPostEditorPage: React.FC<AdminPostEditorPageProps> = ({ onNavigate, postId }) => {
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [postStatus, setPostStatus] = useState<string>('DRAFT');

  // New Workflow States
  const [isSafetyCommitted, setIsSafetyCommitted] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachUrl, setNewAttachUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isSpotlight, setIsSpotlight] = useState<boolean>(false);

  // Leadership & Royalty States
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [royaltyScore, setRoyaltyScore] = useState<number>(20);
  const [royaltyNotes, setRoyaltyNotes] = useState<string>('');

  // Unpublish Modal
  const [showUnpublishModal, setShowUnpublishModal] = useState<boolean>(false);
  const [unpublishReason, setUnpublishReason] = useState<string>('');
  const [existingUnpublishReason, setExistingUnpublishReason] = useState<string>('');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const canPublishDirectly = ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD'].includes(userRole);
  const isApproverOrAdmin = ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD'].includes(userRole);

  useEffect(() => {
    fetchApi<{ data: any[] }>('/v1/categories')
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setCategories(res.data);
          if (!categoryId) setCategoryId(res.data[0].id);
        }
      })
      .catch(() => {});

    if (postId) {
      setIsLoading(true);
      fetchApi<{ data: any }>(`/v1/posts/${postId}`)
        .then((res) => {
          if (res && res.data) {
            const p = res.data;

            const isAuthor = p.authorId === currentUser?.id || p.author?.id === currentUser?.id;
            const canEditThisPost = isAuthor || isApproverOrAdmin;
            if (!canEditThisPost) {
              showToast('Không đủ quyền hạn', 'Bạn chỉ có quyền chỉnh sửa bài viết do chính bạn tạo.', 'error');
              onNavigate('/admin/posts');
              return;
            }

            setTitle(p.title || '');
            setSlug(p.slug || '');
            setSummary(p.summary || '');
            setContent(p.content || '');
            setCategoryId(p.categoryId || p.category?.id || '');
            setImageUrl(p.imageUrl || '');
            setMetaTitle(p.metaTitle || '');
            setMetaDesc(p.metaDescription || '');
            setPostStatus(p.status || 'DRAFT');
            setIsSafetyCommitted(Boolean(p.isSafetyCommitted));
            setAttachments(Array.isArray(p.attachments) ? p.attachments : []);
            setIsFeatured(Boolean(p.isFeatured));
            setIsSpotlight(Boolean(p.isSpotlight));
            setApprovalNotes(p.approvalNotes || '');
            setRoyaltyScore(p.royaltyScore || 20);
            setRoyaltyNotes(p.royaltyNotes || '');
            setExistingUnpublishReason(p.unpublishReason || '');
          }
        })
        .catch((err) => {
          showToast('Lỗi tải chi tiết bài viết', err.message || 'Lỗi máy chủ', 'error');
        })
        .finally(() => setIsLoading(false));
    }
  }, [postId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(generatedSlug);
  };

  const handleThumbFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      showToast('Đang tải ảnh đại diện...', 'Vui lòng chờ...', 'info');

      const token = localStorage.getItem('mbs_access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/v1/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Không thể tải ảnh');

      const uploaded = data.data?.[0];
      if (uploaded?.url) {
        setImageUrl(uploaded.url);
        showToast('Tải ảnh thành công', 'Đã cập nhật ảnh đại diện bài viết', 'success');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh', err.message || 'Không thể tải tệp lên', 'error');
    } finally {
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    }
  };

  const handleAddAttachment = () => {
    if (!newAttachUrl.trim()) return;
    setAttachments([...attachments, newAttachUrl.trim()]);
    setNewAttachUrl('');
    showToast('Đã thêm tư liệu đính kèm', 'Đường dẫn tư liệu đã được lưu vào danh sách', 'info');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getPayload = () => ({
    title,
    summary: summary || title,
    content,
    categoryId,
    imageUrl,
    metaTitle,
    metaDescription: metaDesc,
    isSafetyCommitted,
    attachments,
    isFeatured,
    isSpotlight,
    approvalNotes,
    royaltyScore,
    royaltyNotes,
  });

  // Nút 1: Lưu bản nháp (DRAFT)
  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Thông tin chưa đủ', 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết', 'error');
      return;
    }

    try {
      const payload = { ...getPayload(), status: 'DRAFT' };

      if (postId) {
        await fetchApi(`/v1/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Đã lưu bản nháp', 'Đã cập nhật bài viết ở trạng thái Bản nháp (DRAFT)', 'success');
      } else {
        await fetchApi('/v1/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Đã lưu bản nháp', 'Tạo bài viết mới ở trạng thái Bản nháp (DRAFT) thành công', 'success');
      }

      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi lưu bản nháp', err.message || 'Không thể lưu bản nháp', 'error');
    }
  };

  // Nút 2: Lưu chỉnh sửa
  const handleSaveUpdate = async () => {
    if (!postId) return;
    if (!title.trim() || !content.trim()) {
      showToast('Thông tin chưa đủ', 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết', 'error');
      return;
    }

    try {
      await fetchApi(`/v1/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(getPayload()),
      });
      showToast('Đã cập nhật bài viết', 'Thông tin chỉnh sửa đã được lưu vào hệ thống', 'success');
      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi cập nhật bài viết', err.message || 'Không thể cập nhật bài viết', 'error');
    }
  };

  // BƯỚC 1: Nút "Gửi biên tập (SUBMITTED)"
  const handleSubmitEditorial = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      showToast('Thông tin chưa đủ', 'Vui lòng nhập đầy đủ tiêu đề, nội dung và chọn chuyên mục', 'error');
      return;
    }

    if (!isSafetyCommitted) {
      showToast('Chưa tích chọn cam kết', 'Bạn bắt buộc phải tích chọn cam kết nội dung không chứa thông tin bí mật nhà nước trước khi gửi biên tập.', 'warning');
      return;
    }

    try {
      let targetPostId = postId;

      if (postId) {
        await fetchApi(`/v1/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(getPayload()),
        });
      } else {
        const res = await fetchApi<{ data: any }>('/v1/posts', {
          method: 'POST',
          body: JSON.stringify(getPayload()),
        });
        targetPostId = res.data?.id;
      }

      if (targetPostId) {
        await fetchApi(`/v1/posts/${targetPostId}/submit`, {
          method: 'PATCH',
          body: JSON.stringify({ isSafetyCommitted: true }),
        });
      }

      showToast('Đã gửi biên tập (Bước 1)', 'Bài viết đã chuyển sang trạng thái ĐÃ GỬI BIÊN TẬP (SUBMITTED)', 'success');
      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi gửi biên tập', err.message || 'Không thể gửi bài viết', 'error');
    }
  };

  // BƯỚC 2A: Nút "Bắt đầu biên tập (IN_EDITING)"
  const handleStartEditing = async () => {
    if (!postId) return;
    try {
      await fetchApi(`/v1/posts/${postId}/start-editing`, { method: 'PATCH' });
      setPostStatus('IN_EDITING');
      showToast('Đã tiếp nhận biên tập (Bước 2)', 'Trạng thái bài viết chuyển sang ĐANG BIÊN TẬP (IN_EDITING)', 'success');
    } catch (err: any) {
      showToast('Lỗi tiếp nhận', err.message || 'Không thể tiếp nhận biên tập', 'error');
    }
  };

  // BƯỚC 2B: Nút "Trình Lãnh đạo phê duyệt (PENDING_APPROVAL)"
  const handleSubmitApproval = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      showToast('Thông tin chưa đủ', 'Vui lòng nhập đầy đủ tiêu đề, nội dung và chọn chuyên mục', 'error');
      return;
    }

    try {
      let targetPostId = postId;

      if (postId) {
        await fetchApi(`/v1/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(getPayload()),
        });
      } else {
        const res = await fetchApi<{ data: any }>('/v1/posts', {
          method: 'POST',
          body: JSON.stringify(getPayload()),
        });
        targetPostId = res.data?.id;
      }

      if (targetPostId) {
        await fetchApi(`/v1/posts/${targetPostId}/submit-approval`, {
          method: 'PATCH',
          body: JSON.stringify({ isFeatured, isSpotlight, categoryId }),
        });
      }

      showToast('Đã trình Lãnh đạo (Bước 2)', 'Bài viết đã chuyển sang trạng thái CHỜ LÃNH ĐẠO DUYỆT (PENDING_APPROVAL)', 'success');
      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi trình duyệt', err.message || 'Không thể trình Lãnh đạo phê duyệt', 'error');
    }
  };

  // BƯỚC 3: Nút "Lãnh đạo Phê duyệt & Chấm nhuận bút (APPROVED)"
  const handleLeadershipApprove = async () => {
    if (!postId) return;
    try {
      await fetchApi(`/v1/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(getPayload()),
      });

      await fetchApi(`/v1/posts/${postId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'APPROVE',
          approvalNotes,
          royaltyScore,
          royaltyNotes,
        }),
      });

      showToast('Lãnh đạo phê duyệt thành công (Bước 3)', `Đã duyệt bài viết và ghi nhận điểm nhuận bút: ${royaltyScore} điểm.`, 'success');
      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi phê duyệt', err.message || 'Không thể phê duyệt bài viết', 'error');
    }
  };

  // BƯỚC 4: Nút "Xuất bản ra Cổng ngoài (PUBLISHED)"
  const handlePublishDirectly = async () => {
    if (!postId) return;
    try {
      await fetchApi(`/v1/posts/${postId}/publish`, { method: 'PATCH' });
      showToast('Xuất bản thành công (Bước 4)', 'Bài viết đã xuất bản công khai lên Portal!', 'success');
      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi xuất bản', err.message || 'Không thể xuất bản bài viết', 'error');
    }
  };

  // BƯỚC 5: Nút "Thu hồi bài viết khẩn cấp (UNPUBLISHED)"
  const handleUnpublishSubmit = async () => {
    if (!postId || !unpublishReason.trim()) {
      showToast('Thiếu lý do thu hồi', 'Vui lòng nhập đầy đủ lý do gỡ bài khẩn cấp', 'warning');
      return;
    }

    try {
      await fetchApi(`/v1/posts/${postId}/unpublish`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: unpublishReason.trim() }),
      });

      setShowUnpublishModal(false);
      showToast('Đã thu hồi bài viết (Bước 5)', 'Bài viết đã được gỡ khỏi Cổng thông tin công khai và lưu vào bảng lịch sử.', 'success');
      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi thu hồi bài', err.message || 'Không thể gỡ bài viết', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Back button, Status Badge and Workflow Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/posts')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {postId ? 'Biên tập Bài viết (Luồng 5 bước)' : 'Soạn thảo Bài viết mới'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                postStatus === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                postStatus === 'APPROVED' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
                postStatus === 'PENDING_APPROVAL' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                postStatus === 'IN_EDITING' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                postStatus === 'SUBMITTED' ? 'bg-sky-950 text-sky-300 border-sky-800' :
                postStatus === 'UNPUBLISHED' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {postStatus === 'DRAFT' && '1. Bản nháp (DRAFT)'}
                {postStatus === 'SUBMITTED' && '2. Đã gửi (SUBMITTED)'}
                {postStatus === 'IN_EDITING' && '2. Đang biên tập (IN_EDITING)'}
                {postStatus === 'PENDING_APPROVAL' && '3. Chờ duyệt (PENDING_APPROVAL)'}
                {postStatus === 'APPROVED' && '4. Đã duyệt (APPROVED)'}
                {postStatus === 'PUBLISHED' && '4. Đã xuất bản (PUBLISHED)'}
                {postStatus === 'UNPUBLISHED' && '5. Đã thu hồi (UNPUBLISHED)'}
                {postStatus === 'REJECTED' && 'Đã từ chối (REJECTED)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quy trình 5 bước: Khởi tạo & Cam kết → Thư ký biên tập → Lãnh đạo duyệt & Chấm nhuận bút → Xuất bản → Thu hồi khẩn cấp
            </p>
          </div>
        </div>

        {/* Dynamic Buttons Bar based on Status & Role */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preview Button */}
          <Button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 bg-slate-900 border-slate-700 text-sky-400 hover:text-sky-300"
          >
            <Eye className="w-3.5 h-3.5" /> Xem Preview
          </Button>

          {/* Save Draft */}
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            size="sm"
            className="gap-1.5 bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Lưu nháp
          </Button>

          {postId && (
            <Button
              onClick={handleSaveUpdate}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-750 font-bold"
            >
              <Save className="w-3.5 h-3.5" /> Lưu cập nhật
            </Button>
          )}

          {/* Step 1: Author submit */}
          {(postStatus === 'DRAFT' || !postId) && (
            <Button
              onClick={handleSubmitEditorial}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-sky-950 hover:bg-sky-900 border-sky-800 text-sky-300 font-bold"
            >
              <Send className="w-3.5 h-3.5" /> Gửi biên tập (SUBMITTED)
            </Button>
          )}

          {/* Step 2A: Secretary start editing */}
          {postStatus === 'SUBMITTED' && (
            <Button
              onClick={handleStartEditing}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-purple-950 hover:bg-purple-900 border-purple-800 text-purple-300 font-bold"
            >
              <FileText className="w-3.5 h-3.5" /> Tiếp nhận biên tập
            </Button>
          )}

          {/* Step 2B: Secretary submit for approval */}
          {(postStatus === 'IN_EDITING' || postStatus === 'SUBMITTED') && (
            <Button
              onClick={handleSubmitApproval}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-amber-950 hover:bg-amber-900 border-amber-800 text-amber-300 font-bold"
            >
              <Send className="w-3.5 h-3.5" /> Trình Lãnh đạo duyệt
            </Button>
          )}

          {/* Step 3: Leadership approve */}
          {postStatus === 'PENDING_APPROVAL' && isApproverOrAdmin && (
            <Button
              onClick={handleLeadershipApprove}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-cyan-950 hover:bg-cyan-900 border-cyan-800 text-cyan-300 font-bold"
            >
              <Award className="w-3.5 h-3.5" /> Duyệt bài & Chấm nhuận bút
            </Button>
          )}

          {/* Step 4: Publish */}
          {(postStatus === 'APPROVED' || canPublishDirectly) && postStatus !== 'PUBLISHED' && (
            <Button
              onClick={handlePublishDirectly}
              variant="primary"
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Xuất bản công khai
            </Button>
          )}

          {/* Step 5: Unpublish emergency */}
          {postStatus === 'PUBLISHED' && isApproverOrAdmin && (
            <Button
              onClick={() => setShowUnpublishModal(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-rose-950 hover:bg-rose-900 border-rose-800 text-rose-300 font-bold"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Thu hồi khẩn cấp
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm font-medium">
          Đang tải thông tin bài viết...
        </div>
      ) : (
        /* Editor Main Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Fields Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1 MANDATORY SAFETY COMMITMENT BOX */}
            <div className="bg-slate-900 border border-sky-900/60 rounded-2xl p-5 space-y-3 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> BƯỚC 1: Cam kết An toàn & Bảo mật Thông tin Nhà nước
              </div>
              <label className="flex items-start gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-sky-900/50 cursor-pointer hover:border-sky-500 transition-all">
                <input
                  type="checkbox"
                  checked={isSafetyCommitted}
                  onChange={(e) => setIsSafetyCommitted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                />
                <span className="text-xs text-slate-200 font-semibold leading-relaxed">
                  Tôi cam kết: <strong className="text-sky-300">Nội dung không chứa thông tin bí mật nhà nước hoặc tài liệu chưa được phép công bố</strong> theo đúng quy định pháp luật và quy chế phát ngôn của Sở/Ban ngành.
                </span>
              </label>
            </div>

            {/* Title & Excerpt Input */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề tin bài thu hút..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Đường dẫn tĩnh (Slug)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400">
                  <span className="text-slate-500 select-none">https://mbs.tphcm.gov.vn/tin-tuc/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-transparent text-emerald-400 font-bold focus:outline-none flex-1 ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tóm tắt ngắn (Sapo / Excerpt) *</label>
                <textarea
                  rows={3}
                  placeholder="Nhập sapo 2-3 câu giới thiệu bài viết (Thư ký biên tập tối ưu chuẩn báo chí)..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Rich Text Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Nội dung chi tiết (Rich Content)</label>
                <span className="text-[10px] text-emerald-400 font-semibold">Tích hợp HTML / WYSIWYG Editor Toolbar</span>
              </div>

              <RichTextToolbar textareaRef={textareaRef} content={content} onChange={setContent} />

              <textarea
                ref={textareaRef}
                rows={14}
                placeholder="Soạn nội dung bài viết định dạng HTML / Rich Text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Attachments Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                <FileUp className="w-4 h-4 text-sky-400" /> Tệp & Tư liệu Đính kèm (Attachments)
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập đường dẫn tài liệu đính kèm (PDF, DOCX, ZIP)..."
                  value={newAttachUrl}
                  onChange={(e) => setNewAttachUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <Button onClick={handleAddAttachment} variant="outline" size="sm" type="button" className="text-xs">
                  Thêm đính kèm
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300">
                      <span className="font-mono truncate max-w-md text-emerald-400">{att}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unpublish Reason History Callout if exists */}
            {existingUnpublishReason && (
              <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" /> Lịch sử Gỡ bài / Thu hồi Khẩn cấp
                </div>
                <p className="text-xs text-rose-200">
                  Lý do thu hồi: <span className="font-semibold italic">"{existingUnpublishReason}"</span>
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Configuration Column */}
          <div className="space-y-6">
            {/* STEP 2: SECRETARY DISPLAY FLOW CONFIG */}
            <div className="bg-slate-900 border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-purple-900/50 pb-3 flex items-center gap-2">
                BƯỚC 2: Cấu hình Biên tập & Luồng Hiển thị
              </h3>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Chuyên mục tin bài *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs text-slate-400 font-medium">Luồng hiển thị trang chủ (Display Flow)</label>
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-950"
                  />
                  <span>Gắn nhãn <strong className="text-amber-400">Tin nổi bật (Featured)</strong></span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpotlight}
                    onChange={(e) => setIsSpotlight(e.target.checked)}
                    className="rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-950"
                  />
                  <span>Gắn nhãn <strong className="text-cyan-400">Tin tiêu điểm (Spotlight)</strong></span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-slate-400 font-medium">Ảnh đại diện (Thumbnail)</label>
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> Tải từ máy
                  </button>
                  <input
                    type="file"
                    ref={thumbInputRef}
                    onChange={handleThumbFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  placeholder="URL ảnh đại diện..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-2 font-mono text-[11px]"
                />
                {imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 h-32 bg-slate-950 relative">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: LEADERSHIP APPROVAL & ROYALTY EVALUATION */}
            <div className="bg-slate-900 border border-cyan-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/50 pb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" /> BƯỚC 3: Lãnh đạo Phê duyệt & Chấm nhuận bút
              </h3>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Ghi chú chỉ đạo / Phê duyệt</label>
                <textarea
                  rows={2}
                  placeholder="Nhập ghi chú phê duyệt của Lãnh đạo..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Khung điểm nhuận bút</label>
                  <select
                    value={royaltyScore}
                    onChange={(e) => setRoyaltyScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none"
                  >
                    <option value={10}>Mức D (10 điểm)</option>
                    <option value={20}>Mức C (20 điểm)</option>
                    <option value={30}>Mức B (30 điểm)</option>
                    <option value={50}>Mức A (50 điểm)</option>
                    <option value={100}>Đặc biệt (100 điểm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Ghi chú nhuận bút</label>
                  <input
                    type="text"
                    placeholder="Loại A/B/C..."
                    value={royaltyNotes}
                    onChange={(e) => setRoyaltyNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SEO On-page Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">Cấu hình Thẻ SEO On-Page</h3>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Meta Title (Tiêu đề SEO)</label>
                <input
                  type="text"
                  placeholder="Tiêu đề SEO..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Meta Description (Mô tả SEO)</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả SEO..."
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNPUBLISH EMERGENCY MODAL */}
      {showUnpublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" /> Gỡ bài / Thu hồi bài viết khẩn cấp
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thao tác này sẽ gỡ bài viết khỏi Cổng thông tin ngay lập tức. Vui lòng nhập rõ <strong className="text-rose-300">lý do thu hồi</strong> để lưu trữ lịch sử kiểm tra.
            </p>
            <textarea
              rows={4}
              placeholder="Nhập lý do gỡ bài (vd: Theo chỉ đạo đột xuất của Lãnh đạo Ban biên tập / Đính chính thông tin)..."
              value={unpublishReason}
              onChange={(e) => setUnpublishReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowUnpublishModal(false)} variant="outline" size="sm">
                Hủy bỏ
              </Button>
              <Button onClick={handleUnpublishSubmit} variant="outline" size="sm" className="bg-rose-950 hover:bg-rose-900 border-rose-800 text-rose-300 font-bold">
                Xác nhận Thu hồi bài
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Xem trước hiển thị Cổng thông tin (Portal Preview)
              </span>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-left">
              <h1 className="text-2xl font-bold text-white">{title || 'Tiêu đề chưa nhập'}</h1>
              {imageUrl && (
                <div className="rounded-xl overflow-hidden max-h-80">
                  <img src={imageUrl} alt="Preview" className="w-full object-cover" />
                </div>
              )}
              {summary && <p className="text-sm font-semibold text-slate-300 italic border-l-2 border-emerald-500 pl-3">{summary}</p>}
              <div
                className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: content || '<p className="text-slate-500">Chưa có nội dung</p>' }}
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <Button onClick={() => setShowPreviewModal(false)} variant="primary" size="sm">
                Đóng xem trước
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
