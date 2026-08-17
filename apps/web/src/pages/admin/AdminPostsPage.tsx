import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderTree,
  FileCode,
  Edit,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MOCK_NEWS, NEWS_CATEGORIES } from '../../lib/mock-data';

export interface AdminPostsPageProps {
  onNavigate: (path: string) => void;
  subView?: 'posts' | 'categories' | 'pages';
}

export const AdminPostsPage: React.FC<AdminPostsPageProps> = ({ onNavigate, subView = 'posts' }) => {
  const [currentView, setCurrentView] = useState<'posts' | 'categories' | 'pages'>(subView);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const pagesList = [
    { title: 'Giới thiệu chung Ban Quản lý MBS', slug: '/gioi-thieu', updatedAt: '12/01/2026', views: 12500 },
    { title: 'Chức năng - Nhiệm vụ chính thức', slug: '/so-do-to-chuc?tab=functions', updatedAt: '10/01/2026', views: 8900 },
    { title: 'Cơ cấu sơ đồ tổ chức bộ máy', slug: '/so-do-to-chuc?tab=org', updatedAt: '05/01/2026', views: 14200 },
  ];

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
            Soạn thảo, quản lý bài viết, chuyên mục phân cấp và xuất bản nội dung lên Cổng thông tin
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

          {currentView === 'posts' && (
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
                placeholder="Tìm bài viết theo tiêu đề, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Trạng thái:</span>
              {['all', 'published', 'pending', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${selectedStatus === status ? 'bg-slate-800 text-emerald-400 border border-emerald-800' : 'text-slate-400 hover:text-white'}`}
                >
                  {status === 'all' && 'Tất cả'}
                  {status === 'published' && 'Đã xuất bản'}
                  {status === 'pending' && 'Chờ duyệt'}
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
                  {MOCK_NEWS.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-850 transition-colors">
                      <td className="p-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800" />
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
                          {post.categoryName}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">{post.author}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Đã xuất bản
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-300">{post.views}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onNavigate(`/admin/posts/${post.id}/edit`)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onNavigate(`/tin-tuc/${post.slug}`)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 transition-colors" title="Xem công khai">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {currentView === 'categories' && (
        /* Categories Tree View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Danh sách Chuyên mục Phân cấp</h3>
            <Button size="sm" variant="primary" className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Thêm chuyên mục mới
            </Button>
          </div>

          <div className="space-y-2">
            {NEWS_CATEGORIES.map((cat) => (
              <div key={cat.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <FolderTree className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                    <span className="text-xs font-mono text-slate-500">Slug: /tin-tuc?cat={cat.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-slate-900 border-slate-800 text-slate-300">
                    Sửa
                  </Button>
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
    </div>
  );
};
