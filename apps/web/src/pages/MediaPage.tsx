import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video,
  Play,
  Eye,
  Download,
  Calendar,
  Search,
  Filter,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Sparkles,
  LayoutGrid,
  List,
  Layers,
  ShieldCheck,
  FileText,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { useToast } from '../components/ui/toast';

export interface MediaPageProps {
  onNavigate: (path: string) => void;
}

interface MediaItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  desc: string;
  size?: string;
  format?: string;
  isFromDb?: boolean;
  isFeatured?: boolean;
  isVideo?: boolean;
  duration?: string;
  views?: string;
}

export const MediaPage: React.FC<MediaPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'photos'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Lightbox & Modal States
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // DB Media from API
  const [dbMediaItems, setDbMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  // Fallback curated photos ONLY if database has 0 items
  const fallbackPhotos: MediaItem[] = [
    {
      id: 'p1',
      title: 'Hệ thống cân xe tự động & camera AI quét mã QR lệnh vận chuyển rác tại Khu LHXLCT Đa Phước',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1400&q=85',
      date: '16/02/2026',
      category: 'Khu Đa Phước',
      format: 'WEBP 4K',
      size: '240 KB',
      desc: 'Hệ thống cân điện tử hiện đại kết hợp nhận diện biển số tự động 24/7, giám sát khối lượng chất thải tiếp nhận chính xác tuyệt đối.',
      isFeatured: true,
    },
    {
      id: 'p2',
      title: 'Trạm xử lý nước rỉ rác công nghệ màng sinh học MBR kết hợp thẩm thấu ngược RO công suất 2.500 m³/ngày',
      url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1400&q=85',
      date: '14/02/2026',
      category: 'Công nghệ Môi trường',
      format: 'WEBP 4K',
      size: '310 KB',
      desc: 'Nước rỉ rác sau xử lý đạt quy chuẩn Cột A QCVN 40:2011/BTNMT, tái sử dụng hoàn toàn cho tưới cây và rửa đường nội bộ.',
      isFeatured: false,
    },
    {
      id: 'p3',
      title: 'Dây chuyền phân loại cơ học tách nhựa, kim loại sản xuất phân vi sinh Compost tại Khu Phước Hiệp',
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1400&q=85',
      date: '10/02/2026',
      category: 'Khu Phước Hiệp',
      format: 'WEBP 4K',
      size: '180 KB',
      desc: 'Nhà máy phân loại rác thải sinh hoạt theo mô hình kinh tế tuần hoàn, tối ưu tỷ lệ tái chế chất thải hữu cơ.',
      isFeatured: false,
    },
  ];

  // Fetch DB items from API
  const fetchDbMedia = async () => {
    try {
      setIsLoadingDb(true);
      const res = await fetch(`${BASE_URL}/v1/media`);
      const json = await res.json();
      if (json.data && json.data.items) {
        const formatted: MediaItem[] = json.data.items.map((item: any) => ({
          id: item.id,
          title: item.title || item.originalName || item.filename,
          url: item.url,
          date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
          category: item.category || 'Khu Đa Phước',
          desc: item.description || item.caption || `Tệp hình ảnh được tải lên CSDL PostgreSQL. Dung lượng: ${(item.size / 1024).toFixed(1)} KB.`,
          size: `${(item.size / 1024).toFixed(1)} KB`,
          format: item.filename?.endsWith('.webp') ? 'WEBP 4K' : item.mimeType?.split('/')[1]?.toUpperCase() || 'IMAGE',
          isFromDb: true,
          isFeatured: Boolean(item.isFeatured),
        }));
        setDbMediaItems(formatted);
      }
    } catch (err) {
      console.error('Error fetching DB media for public gallery:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const [categoriesList, setCategoriesList] = useState<string[]>([
    'Tất cả',
    'Khu Đa Phước',
    'Khu Phước Hiệp',
    'Công nghệ Môi trường',
    'Năng lượng tái tạo',
    'Giám sát kỹ thuật',
    'Ấn phẩm Báo chí',
  ]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/v1/media/categories`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setCategoriesList(['Tất cả', ...json.data]);
      }
    } catch (err) {
      console.error('Error fetching public media categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDbMedia();
  }, []);

  const allCombinedItems: MediaItem[] = dbMediaItems.length > 0 ? dbMediaItems : fallbackPhotos;

  const filteredItems = allCombinedItems.filter((item) => {
    if (activeTab === 'featured' && !item.isFeatured) return false;
    if (activeTab === 'photos' && item.isVideo) return false;
    if (selectedCategory !== 'Tất cả' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    }
    return true;
  });



  const handleCopyUrl = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Đã sao chép đường dẫn', 'URL hình ảnh HD đã được chép vào bộ nhớ tạm', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeMedia = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Kho Thư viện Ảnh & Tư liệu Đa phương tiện' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Hero Section Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/60 p-8 sm:p-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kho Tư liệu Số hóa Cổng Thông tin MBS TP.HCM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
              THƯ VIỆN HÌNH ẢNH CỔNG THÔNG TIN
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Kho dữ liệu hình ảnh được quản lý và kiểm duyệt trực tiếp từ Ban Biên tập Cổng Thông tin Điện tử MBS TP.HCM.
            </p>

            {/* Quick Stat Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span className="text-slate-400">Hình ảnh CSDL:</span>
                <strong className="text-teal-300 font-mono text-sm">{allCombinedItems.length}</strong>
              </div>
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-slate-400">Ảnh ghim nổi bật:</span>
                <strong className="text-amber-300 font-mono text-sm">
                  {allCombinedItems.filter((i) => i.isFeatured).length}
                </strong>
              </div>
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Đồng bộ Trang Quản lý:</span>
                <strong className="text-emerald-300 font-bold">100% Sync</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Filter, Search & Controls Bar */}
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-4 backdrop-blur-md">
          {/* Main Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Tất cả tư liệu ({allCombinedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'featured'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Ảnh nổi bật (
                {allCombinedItems.filter((i) => i.isFeatured).length})
              </button>
            </div>

            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
                title="Dạng Lưới Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
                title="Dạng Danh sách List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input & Category Pills */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto py-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-teal-950 text-teal-300 border-teal-600 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm tư liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* MEDIA GALLERY DISPLAY */}
        {isLoadingDb ? (
          <div className="py-20 text-center text-slate-400">Đang tải kho hình ảnh CSDL...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-slate-950/60 border border-slate-800 rounded-3xl p-8 space-y-4">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Chưa có hình ảnh nào trong danh mục</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Vui lòng quay lại sau hoặc thử từ khóa tìm kiếm khác.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group bg-slate-950 border border-slate-800/80 hover:border-teal-500 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-teal-950/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Box */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  {item.url.endsWith('.pdf') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 p-4 text-center">
                      <FileText className="w-12 h-12 mb-2" />
                      <span className="text-xs font-bold truncate max-w-full">{item.title}</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1400&q=85';
                      }}
                    />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/90 text-teal-300 border border-teal-800/80 backdrop-blur-md">
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-600/80 backdrop-blur-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> Nổi bật
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(idx);
                      }}
                      className="p-3 bg-slate-900/90 text-white rounded-full hover:bg-teal-600 transition-colors shadow-lg border border-slate-700"
                      title="Xem full HD"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleCopyUrl(e, item.url, item.id)}
                      className="p-3 bg-slate-900/90 text-white rounded-full hover:bg-teal-600 transition-colors shadow-lg border border-slate-700"
                      title="Sao chép URL chèn bài"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" /> {item.date}
                    </span>
                    {item.format && (
                      <span className="font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                        {item.format}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">
                    {item.desc}
                  </p>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ban Quản lý MBS</span>
                    <span className="text-teal-400 group-hover:underline font-semibold flex items-center gap-1">
                      Xem chi tiết <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="bg-slate-950 border border-slate-800/80 hover:border-teal-500 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-24 h-16 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-400 uppercase">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] text-amber-400 font-bold">★ Nổi bật</span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900">
                  <span className="font-mono text-[11px]">{item.date}</span>
                  <button
                    onClick={(e) => handleCopyUrl(e, item.url, item.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === item.id ? 'Đã chép' : 'Sao chép URL'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
        {activeMedia && (
          <Modal
            isOpen={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
            title={`Chi tiết tư liệu: ${activeMedia.title}`}
            maxWidth="4xl"
          >
            <div className="space-y-5">
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2 min-h-[360px] max-h-[520px]">
                {activeMedia.url.endsWith('.pdf') ? (
                  <iframe src={activeMedia.url} className="w-full h-[480px] rounded-xl" title="PDF Document" />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.title}
                    className="max-h-[480px] w-full object-contain rounded-xl shadow-2xl"
                  />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-teal-600 text-white rounded-full backdrop-blur-md transition-colors border border-slate-700 shadow-xl"
                  title="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-teal-600 text-white rounded-full backdrop-blur-md transition-colors border border-slate-700 shadow-xl"
                  title="Ảnh sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-900 text-xs">
                  <span className="text-teal-400 font-bold uppercase bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
                    {activeMedia.category}
                  </span>
                  <span className="text-slate-400 font-mono">Đăng ngày: {activeMedia.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeMedia.desc}</p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    readOnly
                    value={activeMedia.url}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={(e) => handleCopyUrl(e, activeMedia.url, activeMedia.id)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg w-full sm:w-auto justify-center"
                    >
                      <Copy className="w-4 h-4" /> Sao chép Link HD
                    </button>
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors shrink-0"
                      title="Tải về tệp gốc"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
