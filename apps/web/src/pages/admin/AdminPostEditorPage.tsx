import React, { useState } from 'react';
import {
  FileText,
  Save,
  Send,
  Upload,
  Sparkles,
  Tag,
  FolderTree,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';
import { NEWS_CATEGORIES } from '../../lib/mock-data';

export interface AdminPostEditorPageProps {
  onNavigate: (path: string) => void;
  postId?: string;
}

export const AdminPostEditorPage: React.FC<AdminPostEditorPageProps> = ({ onNavigate, postId }) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState(postId ? 'Triển khai hệ thống giám sát tự động và cảnh báo môi trường' : '');
  const [slug, setSlug] = useState(postId ? 'trien-khai-he-thong-giam-sat-tu-dong-va-canh-bao-moi-truong' : '');
  const [summary, setSummary] = useState(postId ? 'Nhằm nâng cao hiệu lực quản lý và minh bạch thông tin chỉ số môi trường, Ban Quản lý MBS đã hoàn tất lắp đặt hệ thống cảm biến quan trắc tự động.' : '');
  const [content, setContent] = useState(postId ? 'Nội dung chi tiết bài viết quan trắc môi trường...' : '');
  const [category, setCategory] = useState('khoa-hoc-cong-nghe');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');

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

  const handleSaveDraft = () => {
    showToast('Đã lưu bản nháp', 'Bài viết đã được lưu vào danh sách bản nháp thành công', 'info');
  };

  const handleSubmitForApproval = () => {
    showToast('Đã gửi phê duyệt', 'Bài viết đã được gửi tới Trưởng Ban biên tập chờ duyệt', 'success');
    onNavigate('/admin/posts');
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
              Trình soạn thảo chuẩn CMS tích hợp kiểm duyệt và cấu hình SEO On-page
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSaveDraft} variant="outline" size="sm" className="gap-1.5 bg-slate-900 border-slate-800 text-slate-200">
            <Save className="w-3.5 h-3.5" /> Lưu bản nháp
          </Button>
          <Button onClick={handleSubmitForApproval} variant="primary" size="sm" className="gap-1.5">
            <Send className="w-3.5 h-3.5" /> Gửi duyệt & Xuất bản
          </Button>
        </div>
      </div>

      {/* Editor Main Grid */}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-bold placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Đường dẫn tĩnh (Slug)</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400">
                <span className="text-slate-500">https://mbs.tphcm.gov.vn/tin-tuc/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent border-none text-emerald-400 focus:outline-none flex-1 font-mono"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Rich Text / Block Content Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nội dung chi tiết (Rich Content)</h3>
              <span className="text-xs text-emerald-400 font-semibold">Tích hợp TipTap Editor</span>
            </div>

            <textarea
              rows={14}
              placeholder="Soạn nội dung bài viết định dạng HTML / Rich Text..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar Configuration Column */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" /> Cấu hình Chuyên mục
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Chuyên mục tin *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {NEWS_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Ảnh đại diện (Thumbnail)</label>
              <div className="space-y-2">
                {imageUrl && (
                  <img src={imageUrl} alt="Thumbnail preview" className="w-full h-32 rounded-xl object-cover border border-slate-800" />
                )}
                <input
                  type="text"
                  placeholder="URL hình ảnh..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEO On-Page Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" /> Cấu hình Thẻ SEO On-page
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Meta Title (Tiêu đề SEO)</label>
              <input
                type="text"
                placeholder="Để trống sẽ lấy theo tiêu đề bài viết..."
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Meta Description (Mô tả SEO)</label>
              <textarea
                rows={3}
                placeholder="Mô tả SEO tối đa 160 ký tự cho Google Search..."
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
