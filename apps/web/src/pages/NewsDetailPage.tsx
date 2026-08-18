import React, { useState, useEffect } from 'react';
import { Calendar, Eye, User, Share2, Printer, Check } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { TTSReader } from '../components/shared/TTSReader';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/toast';
import { fetchApi } from '../services/api-client';

export interface NewsDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const [article, setArticle] = useState<any>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Fetch article details by slug from PostgreSQL DB API
    fetchApi<{ data: any }>(`/v1/posts/${slug}`)
      .then((res) => {
        if (res && res.data) {
          setArticle(res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải bài viết:', err);
      })
      .finally(() => setIsLoading(false));

    // Fetch related published posts
    fetchApi<{ data: any[] }>('/v1/posts?status=PUBLISHED&limit=4')
      .then((res) => {
        if (res && res.data) {
          setRelatedNews(res.data.filter((p) => p.slug !== slug).slice(0, 3));
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Đã sao chép liên kết', 'Đường dẫn bài viết đã được lưu vào bộ nhớ tạm.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center text-slate-500 text-sm">
        Đang tải thông tin chi tiết bài viết từ CSDL PostgreSQL...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center text-slate-500 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bài viết trong CSDL PostgreSQL</h2>
        <button
          onClick={() => onNavigate('/tin-tuc')}
          className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
        >
          ← Quay lại danh sách tin tức
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tin tức', href: '/tin-tuc' },
            { label: article.category?.name || 'Tin tức', href: `/tin-tuc?cat=${article.category?.slug || 'all'}` },
            { label: 'Chi tiết bài viết' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Article Container */}
        <article className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-6">
          {/* Header Info */}
          <div className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <Badge variant="gov">{article.category?.name || 'Tin tức'}</Badge>
              <span className="text-xs text-slate-400 font-mono">• MBS Official Post</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  {article.author?.fullName || 'Ban Biên tập MBS'}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {article.views || 0} lượt xem
                </span>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-bold text-slate-700">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white shadow-xs text-emerald-800' : ''}`}
                    title="Cỡ chữ chuẩn"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-white shadow-xs text-emerald-800' : ''}`}
                    title="Cỡ chữ lớn"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2 py-1 rounded ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-emerald-800' : ''}`}
                    title="Cỡ chữ rất lớn"
                  >
                    A++
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="Chia sẻ bài viết"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="In bài viết"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Voice Speech Reader (TTS) */}
          <TTSReader text={`${article.title}. ${article.summary || ''}.`} />

          {/* Summary Lead Box */}
          {article.summary && (
            <div className="p-4 sm:p-5 bg-emerald-50/70 border-l-4 border-emerald-700 rounded-r-xl text-slate-800 font-semibold text-xs sm:text-sm leading-relaxed">
              {article.summary}
            </div>
          )}

          {/* Main Hero Image */}
          {article.imageUrl && (
            <figure className="space-y-2">
              <div className="rounded-xl overflow-hidden aspect-video bg-slate-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="text-center text-xs text-slate-500 italic">
                Hình ảnh tại Ban Quản lý MBS - Nguồn: Cổng thông tin MBS
              </figcaption>
            </figure>
          )}

          {/* Article Body Content */}
          <div
            className={`space-y-4 text-slate-700 leading-relaxed ${
              fontSize === 'large' ? 'text-base' : fontSize === 'xlarge' ? 'text-lg' : 'text-sm'
            }`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-3 border-b-2 border-emerald-700">
              TIN TỨC LIÊN QUAN
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(`/tin-tuc/${item.slug}`)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer space-y-2 group"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    className="w-full h-28 object-cover rounded-lg group-hover:scale-102 transition-transform"
                  />
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block">
                    {formatDate(item.publishedAt || item.createdAt)}
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
