import React, { useState } from 'react';
import { Calendar, Eye, User, Share2, Printer, ArrowLeft, Clock, Tag, MessageSquare, Check, Sparkles, ChevronRight } from 'lucide-react';
import { MOCK_NEWS } from '../lib/mock-data';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TTSReader } from '../components/shared/TTSReader';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/toast';

export interface NewsDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const article = MOCK_NEWS.find((item) => item.slug === slug) || MOCK_NEWS[0];
  const relatedNews = MOCK_NEWS.filter((item) => item.id !== article.id).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Đã sao chép liên kết', 'Đường dẫn bài viết đã được lưu vào bộ nhớ tạm.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tin tức', href: '/tin-tuc' },
            { label: article.categoryName, href: `/tin-tuc?cat=${article.categorySlug || article.category}` },
            { label: 'Chi tiết bài viết' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Article Container */}
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          {/* Header Info */}
          <div className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <Badge variant="gov">{article.categoryName}</Badge>
              <span className="text-xs text-slate-400 font-mono">• MBS Media Release</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Meta bar: Date, author, views, tools */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {article.views} lượt xem
                </span>
              </div>

              {/* Utility buttons: Font size, Share, Print */}
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
          <TTSReader text={`${article.title}. ${article.summary}. ${article.content}`} />

          {/* Summary Lead Box */}
          <div className="p-4 sm:p-5 bg-emerald-50/70 border-l-4 border-emerald-700 rounded-r-xl text-slate-800 font-semibold text-xs sm:text-sm leading-relaxed">
            {article.summary}
          </div>

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
                Hình ảnh thực tế tại Khu Liên hợp Xử lý Chất thải TP.HCM - Nguồn: Ban Quản lý MBS
              </figcaption>
            </figure>
          )}

          {/* Article Body Content */}
          <div
            className={`space-y-4 text-slate-700 leading-relaxed ${
              fontSize === 'large' ? 'text-base' : fontSize === 'xlarge' ? 'text-lg' : 'text-sm sm:text-base'
            }`}
          >
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <h3 key={index} className="text-base sm:text-lg font-bold text-slate-900 mt-6 pt-2 border-t border-slate-100">
                    {paragraph.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              return (
                <p key={index} className="text-justify">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Source Attribution & Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">Từ khóa:</span>
              <div className="flex flex-wrap gap-1.5">
                {['MBS TP.HCM', 'Xử lý rác thải', 'Môi trường đô thị', 'Công nghệ đốt phát điện'].map((tag, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right text-xs font-bold text-slate-800">
              Ban Biên tập Cổng Thông tin điện tử MBS
            </div>
          </div>
        </article>

        {/* Navigation & Related News Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/tin-tuc')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách tin tức</span>
            </Button>
          </div>

          {/* Related News 3-grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              TIN TỨC CÙNG CHUYÊN MỤC
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(`/tin-tuc/${item.slug}`)}
                  className="group cursor-pointer space-y-2 hover:bg-slate-50 p-2 rounded-xl transition-colors"
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {formatDate(item.publishedAt)}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
