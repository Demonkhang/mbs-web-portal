import React, { useState } from 'react';
import {
  MapPin,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { MOCK_FAQS } from '../../lib/mock-data';

export interface AdminFeedbackPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'feedback' | 'faq';
}

export const AdminFeedbackPage: React.FC<AdminFeedbackPageProps> = ({ onNavigate, subTab = 'feedback' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'feedback' | 'faq'>(subTab);

  const feedbacksList = [
    {
      id: 'fb-01',
      ticketCode: 'FB-2026-9912',
      title: 'Phản ánh phát sinh mùi hôi khói bụi rác thải tại tuyến đường dẫn vào Khu Đa Phước',
      senderName: 'Lê Văn An',
      senderPhone: '0903 888 999',
      location: 'Tỉnh lộ 50, Xã Đa Phước, Huyện Bình Chánh',
      createdAt: '15/02/2026 16:45',
      status: 'dang-xu-ly',
      statusText: 'Đã chuyển Phòng Quản lý Môi trường thụ lý',
      photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'fb-02',
      ticketCode: 'FB-2026-9804',
      title: 'Xe chở rác rỉ nước trên đường Nguyễn Văn Linh gây mùi hôi',
      senderName: 'Trần Minh Tâm',
      senderPhone: '0918 222 333',
      location: 'Ngã tư Nguyễn Văn Linh - Tỉnh lộ 50',
      createdAt: '14/02/2026 10:20',
      status: 'da-giai-quyet',
      statusText: 'Đã nhắc nhở phạt hợp đồng đơn vị vận chuyển',
      photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handlePublishAnswer = () => {
    showToast('Duyệt công khai thành công', 'Câu trả lời đã được xuất bản lên trang FAQ Cổng thông tin MBS', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-amber-400" />
            {activeTab === 'feedback' ? 'Quản lý Phản ánh Vi phạm Môi trường' : 'Quản lý Hỏi - Đáp / FAQ'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tiếp nhận thông tin phản ánh ô nhiễm từ công dân, đính kèm ảnh hiện trường & quản lý FAQ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'feedback' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Phản ánh môi trường (2)
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'faq' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Quản lý Hỏi - Đáp FAQ
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'feedback' ? (
        /* Environmental Feedback List */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacksList.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                    Mã phiếu: {item.ticketCode}
                  </span>
                  <Badge variant={item.status === 'da-giai-quyet' ? 'success' : 'warning'} size="sm">
                    {item.statusText}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Người phản ánh:</span>
                    <strong className="text-slate-200">{item.senderName}</strong> ({item.senderPhone})
                  </div>
                  <div>
                    <span className="text-slate-500 block">Địa điểm hiện trường:</span>
                    <strong className="text-slate-200">{item.location}</strong>
                  </div>
                </div>

                {item.photoUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-amber-400" /> Ảnh bằng chứng hiện trường:
                    </span>
                    <img src={item.photoUrl} alt="Bằng chứng ô nhiễm" className="w-full h-36 rounded-xl object-cover border border-slate-800" />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button variant="outline" size="sm" className="text-xs bg-slate-950 border-slate-800 text-slate-300">
                    Chuyển phòng chuyên trách
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => showToast('Duyệt kết quả', 'Đã duyệt công khai kết quả xử lý lên Cổng MBS', 'success')} className="text-xs">
                    Duyệt công khai kết quả
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* FAQ Manager List */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Danh sách Câu hỏi FAQ Thường gặp</h3>
            <Button size="sm" variant="primary" className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi FAQ mới
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_FAQS.map((faq) => (
              <div key={faq.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm" className="border-amber-800 text-amber-300">
                    {faq.category}
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">{faq.views} lượt đọc</span>
                </div>
                <h4 className="font-bold text-white text-xs">Hỏi: {faq.question}</h4>
                <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-850">
                  Đáp: {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
