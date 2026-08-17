import React, { useState } from 'react';
import {
  Calendar,
  Vote,
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { MOCK_WORK_SCHEDULE, MOCK_POLLS } from '../../lib/mock-data';

export interface AdminSchedulesPollsPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'schedules' | 'polls' | 'banners';
}

export const AdminSchedulesPollsPage: React.FC<AdminSchedulesPollsPageProps> = ({ onNavigate, subTab = 'schedules' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedules' | 'polls' | 'banners'>(subTab);

  const bannersList = [
    { id: 'b1', name: 'Banner Tuyên truyền Chuyển đổi số MBS 2026', pos: 'Trang chủ Header Banner', link: 'https://mbs.tphcm.gov.vn' },
    { id: 'b2', name: 'Logo liên kết UBND Thành phố Hồ Chí Minh', pos: 'Footer Liên kết đơn vị', link: 'https://hochiminhcity.gov.vn' },
    { id: 'b3', name: 'Logo Sở Tài nguyên và Môi trường TP.HCM', pos: 'Footer Liên kết đơn vị', link: 'https://donre.hochiminhcity.gov.vn' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-amber-400" />
            {activeTab === 'schedules' && 'Quản lý Lịch Công tác Tuần Lãnh đạo'}
            {activeTab === 'polls' && 'Quản trị Khảo sát & Thăm dò Dư luận'}
            {activeTab === 'banners' && 'Quản lý Banner & Liên kết Web'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Nhập lịch công tác hiện trường, tạo câu hỏi khảo sát ý kiến công dân & quản lý banner liên kết
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'schedules' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Lịch Công tác
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'polls' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Khảo sát dư luận
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'banners' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Banner & Liên kết
            </button>
          </div>

          <Button variant="primary" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> {activeTab === 'schedules' ? 'Thêm lịch mới' : activeTab === 'polls' ? 'Tạo khảo sát' : 'Thêm banner'}
          </Button>
        </div>
      </div>

      {activeTab === 'schedules' && (
        /* Work Schedule Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Lịch Công tác Tuần 07 (Từ 16/02/2026 đến 22/02/2026)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Chủ trì / Lãnh đạo</th>
                  <th className="p-4">Nội dung công tác</th>
                  <th className="p-4">Địa điểm</th>
                  <th className="p-4 text-center">Chế độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MOCK_WORK_SCHEDULE.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">{item.day} ({item.time})</td>
                    <td className="p-4 font-bold text-white">{item.leader}</td>
                    <td className="p-4 max-w-xs">{item.title}</td>
                    <td className="p-4 text-slate-400">{item.location}</td>
                    <td className="p-4 text-center">
                      <Badge variant="success" size="sm">Công khai</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'polls' && (
        /* Polls View */
        <div className="space-y-4">
          {MOCK_POLLS.map((poll) => (
            <div key={poll.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm">Đang diễn ra</Badge>
                <span className="text-xs text-slate-400 font-mono">Tổng số vote: {poll.totalVotes} lượt</span>
              </div>
              <h3 className="text-base font-bold text-white">{poll.question}</h3>

              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                  return (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{opt.text}</span>
                        <span className="text-amber-400 font-mono">{pct}% ({opt.votes} vote)</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'banners' && (
        /* Banners List */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">Danh sách Banner & Logo Liên kết</h3>

          <div className="space-y-3">
            {bannersList.map((banner) => (
              <div key={banner.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{banner.name}</h4>
                  <span className="text-xs text-slate-500">{banner.pos} • {banner.link}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-slate-900 border-slate-800 text-slate-300">Sửa</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
