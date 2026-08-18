import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Send,
  ArrowLeft,
  Upload
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

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');

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

  useEffect(() => {
    // Load categories from PostgreSQL DB API
    fetchApi<{ data: any[] }>('/v1/categories')
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setCategories(res.data);
          if (!categoryId) setCategoryId(res.data[0].id);
        }
      })
      .catch(() => {});

    // If editing existing post
    if (postId) {
      setIsLoading(true);
      fetchApi<{ data: any }>(`/v1/posts/${postId}`)
        .then((res) => {
          if (res && res.data) {
            const p = res.data;
            setTitle(p.title || '');
            setSlug(p.slug || '');
            setSummary(p.summary || '');
            setContent(p.content || '');
            setCategoryId(p.categoryId || p.category?.id || '');
            setImageUrl(p.imageUrl || '');
            setMetaTitle(p.metaTitle || '');
            setMetaDesc(p.metaDescription || '');
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

  // Upload thumbnail image from local computer
  const handleThumbFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      showToast('Đang tải ảnh đại diện...', 'Vui lòng chờ...', 'info');

      // Get bearer token from localStorage
      const token = localStorage.getItem('mbs_access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:4000/api/v1/media/upload', {
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

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Thông tin chưa đủ', 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết', 'error');
      return;
    }

    try {
      const payload = {
        title,
        summary: summary || title,
        content,
        categoryId,
        imageUrl,
        metaTitle,
        metaDescription: metaDesc,
        status: 'DRAFT',
      };

      if (postId) {
        await fetchApi(`/v1/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Đã cập nhật bài viết', 'Thông tin bài viết đã được cập nhật vào CSDL PostgreSQL', 'success');
      } else {
        await fetchApi('/v1/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Đã lưu bản nháp', 'Bài viết mới đã được lưu vào CSDL PostgreSQL thành công', 'success');
      }

      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi lưu bài viết', err.message || 'Không thể lưu bài viết', 'error');
    }
  };

  const handleSubmitOrPublish = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      showToast('Thông tin chưa đủ', 'Vui lòng nhập đầy đủ tiêu đề, nội dung và chọn chuyên mục', 'error');
      return;
    }

    try {
      const payload = {
        title,
        summary: summary || title,
        content,
        categoryId,
        imageUrl,
        metaTitle,
        metaDescription: metaDesc,
      };

      let targetPostId = postId;

      if (postId) {
        await fetchApi(`/v1/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        const res = await fetchApi<{ data: any }>('/v1/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        targetPostId = res.data?.id;
      }

      if (userRole === 'EDITOR') {
        // Submit for approval (PENDING_REVIEW)
        if (targetPostId) {
          await fetchApi(`/v1/posts/${targetPostId}/submit`, { method: 'PATCH' });
        }
        showToast('Đã gửi trình duyệt', 'Bài viết đã được chuyển sang trạng thái PENDING_REVIEW chờ Trưởng ban duyệt', 'success');
      } else {
        // EDITOR_LEAD, ADMIN, or SUPER_ADMIN -> Approve and Publish immediately
        if (targetPostId) {
          await fetchApi(`/v1/posts/${targetPostId}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'APPROVE' }),
          });
        }
        showToast('Xuất bản thành công', 'Bài viết đã được duyệt và xuất bản lên Cổng thông tin!', 'success');
      }

      onNavigate('/admin/posts');
    } catch (err: any) {
      showToast('Lỗi xử lý bài viết', err.message || 'Không thể lưu hoặc gửi duyệt bài viết', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Back button and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/posts')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {postId ? 'Chỉnh sửa Bài viết' : 'Soạn thảo Bài viết mới'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Trình soạn thảo chuẩn CMS kết nối CSDL PostgreSQL & Cấu hình SEO On-page
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSaveDraft} variant="outline" size="sm" className="gap-1.5 bg-slate-900 border-slate-800 text-slate-200">
            <Save className="w-3.5 h-3.5" /> {postId ? 'Cập nhật bản nháp' : 'Lưu bản nháp (DRAFT)'}
          </Button>
          <Button onClick={handleSubmitOrPublish} variant="primary" size="sm" className="gap-1.5">
            <Send className="w-3.5 h-3.5" /> {userRole === 'EDITOR' ? 'Gửi trình duyệt' : 'Gửi duyệt & Xuất bản'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm font-medium">
          Đang tải thông tin bài viết từ CSDL PostgreSQL...
        </div>
      ) : (
        /* Editor Main Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Fields Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tóm tắt ngắn (Excerpt) *</label>
                <textarea
                  rows={3}
                  placeholder="Nhập tóm tắt 2-3 câu giới thiệu bài viết..."
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

              {/* Rich Text Toolbar */}
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
          </div>

          {/* Sidebar Configuration Column */}
          <div className="space-y-6">
            {/* Category Configuration Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">Cấu hình Chuyên mục</h3>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Chuyên mục tin *</label>
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-slate-400 font-medium">Ảnh đại diện (Thumbnail)</label>
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> Chọn từ máy tính
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
                  placeholder="Dán URL ảnh hoặc tải từ máy tính..."
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

            {/* SEO On-page Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">Cấu hình Thẻ SEO On-Page</h3>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Meta Title (Tiêu đề SEO)</label>
                <input
                  type="text"
                  placeholder="Để trống sẽ lấy theo tiêu đề bài viết..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Meta Description (Mô tả SEO)</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả SEO tối đa 160 ký tự cho Google Search..."
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
