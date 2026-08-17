import React, { useState } from 'react';
import { Image, Video, Play, Eye, Download, Calendar, ExternalLink, Filter } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Tabs } from '../components/ui/tabs';
import { Modal } from '../components/ui/modal';

export interface MediaPageProps {
  onNavigate: (path: string) => void;
}

export const MediaPage: React.FC<MediaPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const photos = [
    {
      id: 'p1',
      title: 'Hệ thống cân xe tự động và kiểm soát tải trọng tại cổng Khu LHXLCT Đa Phước',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
      date: '16/02/2026',
      category: 'Khu Đa Phước',
      desc: 'Hệ thống cân điện tử tự động kết hợp camera nhận diện biển số và quét mã QR lệnh vận chuyển rác thải.'
    },
    {
      id: 'p2',
      title: 'Trạm xử lý nước rỉ rác công nghệ màng sinh học MBR và lọc thẩm thấu ngược RO',
      url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
      date: '14/02/2026',
      category: 'Công nghệ Môi trường',
      desc: 'Nước thải sau xử lý đạt cột A QCVN 40:2011/BTNMT trước khi xả ra nguồn tiếp nhận.'
    },
    {
      id: 'p3',
      title: 'Nhà máy phân loại và tái chế chất thải rắn sinh hoạt tại Phước Hiệp - Củ Chi',
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      date: '10/02/2026',
      category: 'Khu Phước Hiệp',
      desc: 'Dây chuyền phân loại cơ học tách nhựa, kim loại và rác hữu cơ để sản xuất phân vi sinh compost.'
    },
    {
      id: 'p4',
      title: 'Hệ thống ống thu gom khí bãi rác LFG và phát điện hòa lưới quốc gia',
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
      date: '08/02/2026',
      category: 'Năng lượng tái tạo',
      desc: 'Trạm phát điện tận dụng khí mê-tan LFG từ các ô chôn lấp hợp vệ sinh công suất 12 MW.'
    },
    {
      id: 'p5',
      title: 'Đội ngũ chuyên viên kiểm định và phân tích mẫu môi trường tại Phòng Thí nghiệm',
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      date: '02/02/2026',
      category: 'Giám sát kỹ thuật',
      desc: 'Quan trắc các chỉ tiêu BOD5, COD, kim loại nặng và dư lượng khí độc định kỳ hàng tuần.'
    },
    {
      id: 'p6',
      title: 'Vành đai cây xanh cách ly sinh thái 500m bao quanh khu liên hợp',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      date: '28/01/2026',
      category: 'Cảnh quan sinh thái',
      desc: 'Trồng bổ sung hơn 20.000 cây xanh các loại nhằm ngăn phát tán bụi và giảm thiểu mùi hôi ra khu dân cư.'
    },
  ];

  const videos = [
    {
      id: 'v1',
      title: 'Phóng sự HTV9: TP.HCM đẩy nhanh tiến độ các dự án đốt rác phát điện WtE',
      duration: '06:45',
      thumbnail: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
      date: '15/02/2026',
      views: '4.820',
      desc: 'Ghi nhận thực tế tại công trường xây dựng nhà máy đốt rác phát điện tại Khu Đa Phước và Phước Hiệp.'
    },
    {
      id: 'v2',
      title: 'Truyền hình VTV1: Hệ thống quan trắc tự động 24/7 minh bạch hóa chỉ số môi trường',
      duration: '04:12',
      thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      date: '11/02/2026',
      views: '3.150',
      desc: 'Giới thiệu trung tâm giám sát thông minh kết nối dữ liệu 18 trạm cảm biến môi trường của Ban Quản lý MBS.'
    },
    {
      id: 'v3',
      title: 'Phim tư liệu: 20 năm phát triển và chuyển đổi công nghệ xử lý chất thải rắn TP.HCM',
      duration: '15:30',
      thumbnail: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      date: '01/02/2026',
      views: '8.900',
      desc: 'Hành trình từ các bãi rác hở truyền thống đến các khu liên hợp xử lý hiện đại theo mô hình kinh tế tuần hoàn.'
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Thư viện hình ảnh & Video' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Header */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            THƯ VIỆN HÌNH ẢNH & PHÓNG SỰ VIDEO
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hình ảnh tư liệu hoạt động tiếp nhận, xử lý chất thải và các phóng sự truyền hình về công tác bảo vệ môi trường
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'photos', label: `Thư viện Ảnh tư liệu (${photos.length})` },
            { id: 'videos', label: `Phóng sự Video & Truyền hình (${videos.length})` },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {/* PHOTOS GRID */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="gov">{item.category}</Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 rounded-full bg-white/90 text-slate-900 shadow-lg">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] text-slate-400 font-mono block">{item.date}</span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIDEOS GRID */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia({ ...item, isVideo: true })}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {item.duration}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{item.date}</span>
                    <span>{item.views} lượt xem</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Media Preview Modal */}
        {selectedMedia && (
          <Modal
            isOpen={!!selectedMedia}
            onClose={() => setSelectedMedia(null)}
            title={selectedMedia.title}
            maxWidth="3xl"
          >
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center">
                <img
                  src={selectedMedia.url || selectedMedia.thumbnail}
                  alt={selectedMedia.title}
                  className="max-h-[400px] w-full object-cover"
                />
                {selectedMedia.isVideo && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white space-y-2">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                    <span className="text-xs font-semibold">Đang phát phóng sự HD</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed text-justify">{selectedMedia.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Ngày đăng: {selectedMedia.date}</span>
                  <span className="font-bold text-emerald-800">Ban Biên tập Cổng Thông tin điện tử MBS</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
