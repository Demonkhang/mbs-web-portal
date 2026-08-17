import React, { useState, useMemo } from 'react';
import { Search, Calendar, Eye, Tag, ChevronRight, Filter, Flame, Clock } from 'lucide-react';
import { MOCK_NEWS, NEWS_CATEGORIES } from '../lib/mock-data';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Pagination } from '../components/ui/pagination';
import { formatDate, cn } from '../lib/utils';

export interface NewsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate, initialCategory = 'all' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter((item) => {
      const catSlug = item.categorySlug || item.category;
      const matchCat = selectedCategory === 'all' || catSlug === selectedCategory;
      const matchQuery =
        !searchKeyword.trim() ||
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchKeyword]);

  const totalPages = Math.ceil(filteredNews.length / pageSize) || 1;
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNews.slice(start, start + pageSize);
  }, [filteredNews, currentPage]);

  const topViews = [...MOCK_NEWS].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tin tức & Sự kiện' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Page Header */}
        <div className="border-b-2 border-emerald-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              TIN TỨC & HOẠT ĐỘNG
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Thông tin thời sự, chỉ đạo điều hành, quản lý kỹ thuật và tiến độ các dự án xử lý chất thải TP.HCM
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            )}
          >
            Tất cả chuyên mục ({MOCK_NEWS.length})
          </button>
          {NEWS_CATEGORIES.map((cat) => {
            const count = MOCK_NEWS.filter((n) => (n.categorySlug || n.category) === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
                  selectedCategory === cat.slug
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                )}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Main Content Layout (8 cols list + 4 cols sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-6">
            {paginatedNews.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài viết nào phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc chuyên mục.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchKeyword('');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Xem tất cả tin tức
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedNews.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => onNavigate(`/tin-tuc/${article.slug}`)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="relative w-full sm:w-56 h-40 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="gov">{article.categoryName}</Badge>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-1.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            {formatDate(article.publishedAt)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {article.views}
                          </span>
                        </div>

                        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                          {article.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-700">
                        <span className="text-[11px] font-semibold text-slate-400">Tác giả: {article.author}</span>
                        <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Đọc tiếp <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tin đọc nhiều nhất widget */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Flame className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  TIN ĐỌC NHIỀU NHẤT
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {topViews.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(`/tin-tuc/${item.slug}`)}
                    className="py-3 flex items-start gap-3 group cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {item.views} lượt xem
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chuyên mục box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
                CHUYÊN MỤC TIN
              </h3>
              <div className="space-y-1 text-xs">
                {NEWS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentPage(1);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-emerald-800 transition-colors font-medium cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
