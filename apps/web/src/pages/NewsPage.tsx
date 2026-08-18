import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Eye, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Pagination } from '../components/ui/pagination';
import { formatDate, cn } from '../lib/utils';
import { fetchApi } from '../services/api-client';

export interface NewsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate, initialCategory = 'all' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Categories
    fetchApi<{ data: any[] }>('/v1/categories')
      .then((res) => {
        if (res && res.data) setCategories(res.data);
      })
      .catch(() => {});

    // Fetch Published Posts from PostgreSQL DB
    setIsLoading(true);
    fetchApi<{ data: any[] }>('/v1/posts?status=PUBLISHED')
      .then((res) => {
        if (res && res.data) setPosts(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredNews = useMemo(() => {
    return posts.filter((item) => {
      const catSlug = item.category?.slug || item.categorySlug || item.categoryId;
      const matchCat = selectedCategory === 'all' || catSlug === selectedCategory;
      const matchQuery =
        !searchKeyword.trim() ||
        item.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [posts, selectedCategory, searchKeyword]);

  const totalPages = Math.ceil(filteredNews.length / pageSize) || 1;
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNews.slice(start, start + pageSize);
  }, [filteredNews, currentPage]);

  const topViews = useMemo(() => {
    return [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  }, [posts]);

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
              Thông tin thời sự, chỉ đạo điều hành, quản lý kỹ thuật và tiến độ các dự án xử lý chất thải TP.HCM (CSDL PostgreSQL)
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
              placeholder="Tìm kiếm bài viết trong DB..."
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
            Tất cả chuyên mục ({posts.length})
          </button>
          {categories.map((cat) => {
            const count = posts.filter((n) => (n.category?.slug || n.categoryId) === cat.slug || n.categoryId === cat.id).length;
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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
                Đang tải danh sách bài viết từ CSDL PostgreSQL...
              </div>
            ) : paginatedNews.length === 0 ? (
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
                        src={article.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <Badge variant="gov">{article.category?.name || 'Tin tức'}</Badge>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(article.publishedAt || article.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {article.views || 0} lượt xem
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 leading-snug transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-semibold">
                        <span className="text-slate-400">Tác giả: {article.author?.fullName || 'Ban Biên tập MBS'}</span>
                        <span className="text-emerald-700 group-hover:underline flex items-center gap-1">
                          Đọc chi tiết <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top View Articles */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-3 border-b-2 border-emerald-700">
                TIN XEM NHIỀU NHẤT
              </h3>
              <div className="divide-y divide-slate-100">
                {topViews.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(`/tin-tuc/${item.slug}`)}
                    className="py-3 flex gap-3 group cursor-pointer hover:bg-slate-50 rounded-xl px-1.5 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {item.views || 0} lượt xem
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
