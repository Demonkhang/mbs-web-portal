import React, { useState } from 'react';
import {
  Image as ImageIcon,
  BookOpen,
  Upload,
  Copy,
  Check,
  Search,
  FileText,
  Eye,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { useToast } from '../../components/ui/toast';

export interface AdminMediaPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'media' | 'emagazine';
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ onNavigate, subTab = 'media' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'media' | 'emagazine'>(subTab);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mediaItems = [
    { id: 'm1', name: 'Lễ ký kết công nghệ đốt rác phát điện 2026.webp', size: '240 KB', status: 'WebP Compresed', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80' },
    { id: 'm2', name: 'Hệ thống quan trắc tự động Đa Phước.webp', size: '180 KB', status: 'WebP Compressed', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80' },
    { id: 'm3', name: 'Ban Giám đốc kiểm tra thực địa.webp', size: '310 KB', status: 'WebP Compressed', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Đã sao chép URL', 'Đường dẫn hình ảnh đã được chép vào bộ nhớ tạm', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-teal-400" />
            {activeTab === 'media' ? 'Quản lý Kho Đa phương tiện (Media Library)' : 'Quản lý Ấn phẩm E-Magazine Sách lật'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý kho thư viện ảnh, video nén chuẩn WebP & tạo bản tin sách lật điện tử (Flipbook)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'media' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Kho Thư viện Ảnh
            </button>
            <button
              onClick={() => setActiveTab('emagazine')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'emagazine' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Ấn phẩm E-Magazine
            </button>
          </div>

          <Button variant="primary" size="sm" className="gap-1.5">
            <Upload className="w-4 h-4" /> {activeTab === 'media' ? 'Tải ảnh mới (Auto WebP)' : 'Tải PDF Ấn phẩm'}
          </Button>
        </div>
      </div>

      {activeTab === 'media' ? (
        /* Media Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl group hover:border-teal-500 transition-all">
              <img src={item.url} alt={item.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform" />
              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">{item.size}</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">{item.status}</span>
                </div>
                <Button
                  onClick={() => handleCopyUrl(item.url, item.id)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-slate-950 border-slate-800 text-slate-200 gap-1.5 mt-2"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Đã chép URL' : 'Sao chép URL chèn bài'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* E-Magazine View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Danh sách Bản tin Nội bộ & Kỷ yếu Số</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase bg-teal-950 px-2 py-0.5 rounded border border-teal-800">Bản tin Tháng 02/2026</span>
                <h4 className="text-sm font-bold text-white">Ấn phẩm Thông tin Khoa học & Môi trường MBS Số 24</h4>
                <p className="text-xs text-slate-400">Định dạng PDF • 32 Trang • Tự động kích hoạt sách lật 3D</p>
              </div>

              <Button onClick={() => setIsFlipbookOpen(true)} variant="primary" size="sm" className="gap-1 text-xs shrink-0">
                <Eye className="w-3.5 h-3.5" /> Xem Flipbook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Flipbook Preview Modal */}
      <Modal isOpen={isFlipbookOpen} onClose={() => setIsFlipbookOpen(false)} title="Xem trước Ấn phẩm Sách lật Điện tử 3D (Interactive Flipbook)" maxWidth="4xl">
        <div className="space-y-4 text-center">
          <div className="p-12 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 font-serif shadow-inner">
            <h3 className="text-xl font-bold text-emerald-400">ẤN PHẨM THÔNG TIN KHOA HỌC & MÔI TRƯỜNG MBS</h3>
            <p className="text-xs text-slate-400 mt-2">Bản tin số hóa tương tác đa phương tiện • Ban Quản lý MBS TP.HCM</p>
            <div className="w-32 h-1 bg-emerald-500 mx-auto my-6"></div>
            <p className="text-sm italic">Trang 1 / 32 • Bấm kéo góc trang để lật sách</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
