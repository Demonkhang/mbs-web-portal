import React from 'react';
import { ChevronRight, Calendar, Eye, Download, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { MOCK_NEWS, MOCK_DOCUMENTS } from '../../lib/mock-data';
import { formatDate } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface FeaturedNewsProps {
  onNavigate: (path: string) => void;
}

export const FeaturedNews: React.FC<FeaturedNewsProps> = ({ onNavigate }) => {
  const featuredArticle = MOCK_NEWS[0];
  const sideArticles = MOCK_NEWS.slice(1, 4);
  const recentDocs = MOCK_DOCUMENTS.slice(0, 4);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Tin tức nổi bật (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-emerald-700 rounded-xs"></div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  TIN TỨC & HOẠT ĐỘNG NỔI BẬT
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/tin-tuc')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Main Featured Big Item */}
            {featuredArticle && (
              <div
                onClick={() => onNavigate(`/tin-tuc/${featuredArticle.slug}`)}
                className="group cursor-pointer bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="gov">{featuredArticle.categoryName}</Badge>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(featuredArticle.publishedAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {featuredArticle.views} lượt xem
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {featuredArticle.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Sub-articles 3-item list */}
            <div className="divide-y divide-slate-100">
              {sideArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onNavigate(`/tin-tuc/${article.slug}`)}
                  className="py-3.5 flex gap-4 group cursor-pointer hover:bg-slate-50/80 rounded-xl px-2 transition-colors"
                >
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-24 h-20 sm:w-28 sm:h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">
                      {article.categoryName}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug transition-colors">
                      {article.title}
                    </h5>
                    <span className="text-[11px] text-slate-400 block">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Văn bản mới ban hành (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-red-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-red-700 rounded-xs"></div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  VĂN BẢN MỚI BAN HÀNH
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/van-ban')}
                className="text-xs font-bold text-red-700 hover:text-red-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Kho văn bản</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Document Cards */}
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigate(`/van-ban/${doc.id}`)}
                  className="p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-black text-emerald-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {doc.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {doc.issueDate}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug transition-colors">
                      {doc.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[200px] font-medium">{doc.issuingAgency}</span>
                    <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1 shrink-0">
                      Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Callout box: Tra cứu văn bản theo số hiệu */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold">Tra cứu hệ thống Văn bản pháp luật</h4>
              </div>
              <p className="text-xs text-slate-300">
                Tìm kiếm hơn 1.200 văn bản pháp quy, quy chuẩn kỹ thuật quốc gia về môi trường và xử lý chất thải rắn.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('/van-ban')}
                className="w-full justify-center bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
              >
                Tra cứu ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
