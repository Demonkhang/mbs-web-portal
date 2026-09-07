import React, { useState, useEffect } from 'react';
import { Building2, Users, Phone, Mail, Search, ShieldCheck, MapPin, Award, FileText, CheckCircle2, AlertCircle, EyeOff } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { OrgChart } from '../components/shared/OrgChart';
import { Tabs } from '../components/ui/tabs';
import { fetchApi } from '../services/api-client';

export interface OrgStructurePageProps {
  onNavigate: (path: string) => void;
  initialTab?: string;
}

export const OrgStructurePage: React.FC<OrgStructurePageProps> = ({ onNavigate, initialTab }) => {
  const mapTabParam = (tab?: string) => {
    if (!tab) return 'intro';
    if (tab === 'functions') return 'intro';
    if (tab === 'org') return 'organogram';
    if (tab === 'leaders') return 'leadership';
    if (tab === 'directory') return 'directory';
    return tab;
  };

  const [activeTab, setActiveTab] = useState(() => mapTabParam(initialTab));
  const [searchDirectory, setSearchDirectory] = useState('');
  const [pageData, setPageData] = useState<any | null>(null);
  const [allPages, setAllPages] = useState<any[]>([]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(mapTabParam(initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    // Load all static pages to generate dynamic tabs (Public view loads visible pages)
    fetchApi<{ data: any[] }>('/v1/pages')
      .then((res) => {
        if (res && res.data) {
          setAllPages(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const slug = activeTab === 'organogram'
      ? 'co-cau-to-chuc'
      : activeTab === 'leadership'
      ? 'gioi-thieu'
      : activeTab === 'directory'
      ? 'danh-ba-can-bo'
      : activeTab === 'intro'
      ? 'chuc-nang-nhiem-vu'
      : activeTab;

    fetchApi<{ data: any }>(`/v1/pages/${slug}`)
      .then((res) => {
        if (res && res.data) {
          if (res.data.isHidden) {
            setPageData({ ...res.data, isHidden: true });
          } else {
            setPageData(res.data);
          }
        } else {
          setPageData({ isNotFound: true });
        }
      })
      .catch(() => {
        setPageData({ isNotFound: true });
      });
  }, [activeTab]);

  const isSlugVisible = (slug: string) => {
    if (allPages.length === 0) return true;
    const p = allPages.find((item) => item.slug === slug);
    return p ? !p.isHidden : false;
  };

  const baseTabs = [
    isSlugVisible('chuc-nang-nhiem-vu') && { id: 'intro', label: 'Chức năng - Nhiệm vụ' },
    isSlugVisible('gioi-thieu') && { id: 'leadership', label: 'Ban Lãnh đạo' },
    isSlugVisible('co-cau-to-chuc') && { id: 'organogram', label: 'Sơ đồ tổ chức tương tác' },
    isSlugVisible('danh-ba-can-bo') && { id: 'directory', label: 'Danh bạ điện tử cán bộ' },
  ].filter(Boolean) as { id: string; label: string }[];

  const customPages = allPages.filter(
    (p) => !p.isHidden && !['gioi-thieu', 'chuc-nang-nhiem-vu', 'co-cau-to-chuc', 'danh-ba-can-bo'].includes(p.slug)
  );

  const tabsList = [
    ...baseTabs.map((bt, idx) => ({ id: bt.id, label: `${idx + 1}. ${bt.label}` })),
    ...customPages.map((cp, idx) => ({
      id: cp.slug,
      label: `${baseTabs.length + idx + 1}. ${cp.title}`,
    })),
  ];

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
        {tabsList.length > 0 && (
          <Tabs
            tabs={tabsList}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        )}

        {/* Hidden or Deleted Page Notification */}
        {pageData?.isHidden ? (
          <div className="bg-amber-50 border border-amber-200 p-8 sm:p-12 rounded-2xl text-center space-y-3 shadow-xs animate-in fade-in duration-200">
            <EyeOff className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Trang nội dung này hiện đang tạm ẩn</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Nội dung trang tĩnh này đã bị tạm ẩn khỏi Cổng thông tin theo quyết định quản trị của Ban Quản lý.
            </p>
          </div>
        ) : pageData?.isNotFound ? (
          <div className="bg-slate-100 border border-slate-200 p-8 sm:p-12 rounded-2xl text-center space-y-3 shadow-xs animate-in fade-in duration-200">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Trang nội dung không tồn tại hoặc đã bị xóa</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Trang tĩnh này hiện không còn tồn tại trên hệ thống CSDL PostgreSQL.
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: CHỨC NĂNG NHIỆM VỤ */}
            {activeTab === 'intro' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="gov">QUYẾT ĐỊNH THÀNH LẬP</Badge>
                        <span className="text-xs text-slate-500 font-mono">UBND TP. HỒ CHÍ MINH</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Nội dung nạp động từ CSDL PostgreSQL (CMS)
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {pageData?.title || 'Vị trí pháp lý và chức năng nhiệm vụ trọng tâm'}
                    </h2>
                    {pageData?.summary && (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {pageData.summary}
                      </p>
                    )}
                  </div>

                  {pageData?.content ? (
                    <div
                      className="prose max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-4"
                      dangerouslySetInnerHTML={{ __html: pageData.content }}
                    />
                  ) : (
                    /* Default Fallback */
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
                  )}
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
                      role: 'Phó Trưởng ban (Phụ trách Kỹ thuật)',
                      duties: 'Trực tiếp chỉ đạo công tác quản lý kỹ thuật, công nghệ xử lý rác thải, bảo vệ môi trường, vận hành các trạm quan trắc tự động và công tác an toàn lao động tại các Khu LHXLCT.',
                      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                      email: 'hangltt.mbs@tphcm.gov.vn'
                    },
                    {
                      name: 'Đồng chí Trần Đình Quân',
                      role: 'Phó Trưởng ban (Phụ trách Kế hoạch - ĐTXD)',
                      duties: 'Trực tiếp chỉ đạo công tác quản lý đầu tư xây dựng các công trình hạ tầng kỹ thuật dùng chung, giải phóng mặt bằng, đấu thầu và các thủ tục pháp lý dự án.',
                      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                      email: 'quantd.mbs@tphcm.gov.vn'
                    },
                  ].map((leader, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-500 transition-all">
                      <div className="flex items-center gap-4">
                        <img src={leader.avatar} alt={leader.name} className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-600 shadow-sm" />
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{leader.name}</h3>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 block mt-1">
                            {leader.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                        {leader.duties}
                      </p>
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

            {/* CUSTOM STATIC PAGES CREATED FROM CMS */}
            {!['intro', 'leadership', 'organogram', 'directory'].includes(activeTab) && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="gov">TRANG NỘI DUNG TĨNH</Badge>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Nội dung nạp từ CSDL PostgreSQL (CMS)
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {pageData?.title}
                    </h2>
                    {pageData?.summary && (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {pageData.summary}
                      </p>
                    )}
                  </div>

                  {pageData?.content && (
                    <div
                      className="prose max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-4"
                      dangerouslySetInnerHTML={{ __html: pageData.content }}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
