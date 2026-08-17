import React, { useState } from 'react';
import { Building2, Users, Phone, Mail, Search, ShieldCheck, MapPin, Award, FileText, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { OrgChart } from '../components/shared/OrgChart';
import { Tabs } from '../components/ui/tabs';

export interface OrgStructurePageProps {
  onNavigate: (path: string) => void;
}

export const OrgStructurePage: React.FC<OrgStructurePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('intro');
  const [searchDirectory, setSearchDirectory] = useState('');

  const directoryList = [
    { name: 'Nguyễn Văn Minh', role: 'Trưởng ban', dept: 'Ban Giám đốc', phone: '028 3822 5566 (Ext 101)', email: 'minhnv.mbs@tphcm.gov.vn' },
    { name: 'Lê Thị Thu Hằng', role: 'Phó Trưởng ban (Kỹ thuật)', dept: 'Ban Giám đốc', phone: '028 3822 5566 (Ext 102)', email: 'hangltt.mbs@tphcm.gov.vn' },
    { name: 'Trần Đình Quân', role: 'Phó Trưởng ban (Kế hoạch - ĐTXD)', dept: 'Ban Giám đốc', phone: '028 3822 5566 (Ext 103)', email: 'quantd.mbs@tphcm.gov.vn' },
    { name: 'Võ Hoàng Nam', role: 'Chánh Văn phòng', dept: 'Văn phòng Ban', phone: '028 3822 5566 (Ext 201)', email: 'namvh.mbs@tphcm.gov.vn' },
    { name: 'Phạm Thanh Sơn', role: 'Phó Chánh Văn phòng', dept: 'Văn phòng Ban', phone: '028 3822 5566 (Ext 202)', email: 'sonpt.mbs@tphcm.gov.vn' },
    { name: 'Ngô Đức Thắng', role: 'Trưởng phòng Kế hoạch - Tài chính', dept: 'Phòng Kế hoạch - Tài chính', phone: '028 3822 5566 (Ext 301)', email: 'thangnd.mbs@tphcm.gov.vn' },
    { name: 'Đoàn Kim Oanh', role: 'Kế toán trưởng', dept: 'Phòng Kế hoạch - Tài chính', phone: '028 3822 5566 (Ext 302)', email: 'oanhdk.mbs@tphcm.gov.vn' },
    { name: 'Hoàng Quốc Việt', role: 'Trưởng phòng Quản lý Kỹ thuật & Công nghệ', dept: 'Phòng Quản lý Kỹ thuật', phone: '028 3822 5566 (Ext 401)', email: 'viethq.mbs@tphcm.gov.vn' },
    { name: 'Trần Văn Long', role: 'Phó Trưởng phòng Quản lý Kỹ thuật', dept: 'Phòng Quản lý Kỹ thuật', phone: '028 3822 5566 (Ext 402)', email: 'longtv.mbs@tphcm.gov.vn' },
    { name: 'Đỗ Anh Tuấn', role: 'Trưởng phòng Giám sát & Quản lý Chất thải', dept: 'Phòng Giám sát Môi trường', phone: '028 3822 5566 (Ext 501)', email: 'tuanda.mbs@tphcm.gov.vn' },
    { name: 'Lê Minh Trí', role: 'Đội trưởng Trạm Giám sát Đa Phước (24/7)', dept: 'Trạm Giám sát Hiện trường Đa Phước', phone: '028 3778 1234', email: 'tramdaphuoc.mbs@tphcm.gov.vn' },
    { name: 'Vũ Đức Thành', role: 'Đội trưởng Trạm Giám sát Phước Hiệp (24/7)', dept: 'Trạm Giám sát Hiện trường Phước Hiệp', phone: '028 3792 5678', email: 'tramphuochiep.mbs@tphcm.gov.vn' },
  ];

  const filteredDirectory = directoryList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      item.role.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      item.dept.toLowerCase().includes(searchDirectory.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Giới thiệu & Cơ cấu tổ chức' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Header */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            GIỚI THIỆU BAN QUẢN LÝ CÁC KHU LIÊN HỢP XỬ LÝ CHẤT THẢI TP.HCM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Đơn vị sự nghiệp công lập trực thuộc Sở Tài nguyên và Môi trường TP. Hồ Chí Minh
          </p>
        </div>

        {/* Tab switcher */}
        <Tabs
          tabs={[
            { id: 'intro', label: '1. Chức năng - Nhiệm vụ' },
            { id: 'leadership', label: '2. Ban Lãnh đạo' },
            { id: 'organogram', label: '3. Sơ đồ tổ chức tương tác' },
            { id: 'directory', label: '4. Danh bạ điện tử cán bộ' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* TAB 1: CHỨC NĂNG NHIỆM VỤ */}
        {activeTab === 'intro' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="gov">QUYẾT ĐỊNH THÀNH LẬP</Badge>
                  <span className="text-xs text-slate-500 font-mono">UBND TP. HỒ CHÍ MINH</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Vị trí pháp lý và chức năng nhiệm vụ trọng tâm
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  Ban Quản lý các Khu liên hợp xử lý chất thải thành phố (viết tắt là Ban Quản lý MBS) là đơn vị sự nghiệp công lập trực thuộc Sở Tài nguyên và Môi trường thành phố Hồ Chí Minh, có tư cách pháp nhân, có con dấu riêng và được mở tài khoản tại Kho bạc Nhà nước và Ngân hàng thương mại theo quy định của pháp luật.
                </p>
              </div>

              {/* 4 Pillars of Duty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {[
                  {
                    title: '1. Quản lý Quy hoạch & Hạ tầng kỹ thuật',
                    desc: 'Tổ chức quản lý, giám sát đầu tư xây dựng các công trình hạ tầng kỹ thuật dùng chung tại các Khu liên hợp xử lý chất thải Đa Phước (Bình Chánh) và Phước Hiệp (Củ Chi).'
                  },
                  {
                    title: '2. Giám sát Tiếp nhận & Xử lý Chất thải',
                    desc: 'Trực ban 24/7 kiểm soát khối lượng, phân loại và quy trình tiếp nhận rác sinh hoạt, rác công nghiệp, bùn thải và chất thải nguy hại vào các nhà máy xử lý rác theo hợp đồng.'
                  },
                  {
                    title: '3. Quan trắc & Bảo vệ Môi trường',
                    desc: 'Vận hành hệ thống 18 trạm quan trắc tự động không khí, nước ngầm, nước rỉ rác; kiểm tra mùi hôi và chỉ đạo các biện pháp phòng ngừa sự cố ô nhiễm môi trường.'
                  },
                  {
                    title: '4. Thúc đẩy Chuyển đổi Công nghệ Xanh (WtE)',
                    desc: 'Phối hợp với các nhà đầu tư đẩy nhanh tiến độ chuyển đổi công nghệ chôn lấp hợp vệ sinh sang công nghệ đốt rác phát điện (Waste-to-Energy) theo định hướng Net Zero 2030.'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/40 transition-colors space-y-2">
                    <h3 className="text-sm font-bold text-emerald-800">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BAN LÃNH ĐẠO */}
        {activeTab === 'leadership' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Đồng chí Nguyễn Văn Minh',
                  role: 'Trưởng ban Quản lý MBS',
                  duties: 'Phụ trách chung toàn bộ hoạt động của Ban; trực tiếp chỉ đạo công tác quy hoạch, kế hoạch đầu tư, tổ chức cán bộ, tài chính ngân sách và các dự án chuyển đổi công nghệ đốt rác phát điện WtE.',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                  email: 'minhnv.mbs@tphcm.gov.vn'
                },
                {
                  name: 'Đồng chí Lê Thị Thu Hằng',
                  role: 'Phó Trưởng ban Quản lý MBS',
                  duties: 'Phụ trách công tác quản lý kỹ thuật, công nghệ môi trường, giám sát quan trắc tự động 24/7; giải quyết phản ánh mùi hôi và thủ tục dịch vụ công trực tuyến.',
                  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                  email: 'hangltt.mbs@tphcm.gov.vn'
                },
                {
                  name: 'Đồng chí Trần Đình Quân',
                  role: 'Phó Trưởng ban Quản lý MBS',
                  duties: 'Phụ trách công tác quản lý xây dựng công trình, hạ tầng kỹ thuật bãi rác, nghiệm thu khối lượng vận hành tiếp nhận chất thải và phòng chống cháy nổ mùa khô.',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                  email: 'quantd.mbs@tphcm.gov.vn'
                },
              ].map((leader, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-center flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-28 h-28 rounded-full overflow-hidden mx-auto border-4 border-emerald-100 shadow-md">
                      <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{leader.name}</h3>
                      <span className="text-xs font-bold text-emerald-700 block mt-0.5">{leader.role}</span>
                    </div>
                    <p className="text-xs text-slate-600 text-justify leading-relaxed pt-2 border-t border-slate-100">
                      {leader.duties}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono">
                    {leader.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORGANOGRAM */}
        {activeTab === 'organogram' && (
          <div className="space-y-6">
            <OrgChart />
          </div>
        )}

        {/* TAB 4: DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  DANH BẠ ĐIỆN TỬ CÁN BỘ - PHÒNG BAN CHUYÊN MÔN
                </h3>
                <p className="text-xs text-slate-500">Tra cứu số điện thoại nội bộ và thư điện tử công vụ</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchDirectory}
                  onChange={(e) => setSearchDirectory(e.target.value)}
                  placeholder="Tìm kiếm cán bộ, phòng ban..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Họ và tên</th>
                    <th className="p-3.5">Chức danh / Vị trí</th>
                    <th className="p-3.5">Đơn vị / Phòng ban</th>
                    <th className="p-3.5">Số điện thoại liên hệ</th>
                    <th className="p-3.5">Thư điện tử công vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDirectory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3.5 text-slate-700 font-medium">{item.role}</td>
                      <td className="p-3.5 text-slate-600">{item.dept}</td>
                      <td className="p-3.5 font-mono text-emerald-800 font-bold">{item.phone}</td>
                      <td className="p-3.5 font-mono text-slate-500">{item.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
