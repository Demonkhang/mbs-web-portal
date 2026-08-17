import React, { useState } from 'react';
import {
  FolderTree,
  Users,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MOCK_STAFF, MOCK_ORG_TREE } from '../../lib/mock-data';

export interface AdminOrgStaffPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'org' | 'staff';
}

export const AdminOrgStaffPage: React.FC<AdminOrgStaffPageProps> = ({ onNavigate, subTab = 'org' }) => {
  const [activeTab, setActiveTab] = useState<'org' | 'staff'>(subTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            {activeTab === 'org' ? 'Cấu hình Sơ đồ Cơ cấu Tổ chức' : 'Quản lý Danh bạ Cán bộ & Nhân sự'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cấu hình cây phân cấp bộ máy lãnh đạo, các phòng ban chuyên môn & danh bạ máy lẻ nội bộ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('org')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'org' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sơ đồ Tổ chức
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'staff' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Danh bạ Cán bộ
            </button>
          </div>

          <Button variant="primary" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> {activeTab === 'org' ? 'Thêm đơn vị / phòng' : 'Thêm cán bộ mới'}
          </Button>
        </div>
      </div>

      {activeTab === 'org' ? (
        /* Org Tree Config View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">Cây phân cấp Lãnh đạo & Các Đơn vị Trực thuộc</h3>

          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-4">
            <div className="inline-block p-4 bg-emerald-950 rounded-xl border border-emerald-800 text-emerald-300 font-bold text-sm">
              {MOCK_ORG_TREE.title} - {MOCK_ORG_TREE.leaderName}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {MOCK_ORG_TREE.children?.map((child) => (
                <div key={child.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-left space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">{child.title}</span>
                  <h4 className="text-xs font-bold text-white">{child.leaderName}</h4>
                  <p className="text-[11px] text-slate-400">{child.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Staff Directory Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Họ và tên cán bộ</th>
                  <th className="p-4">Chức vụ</th>
                  <th className="p-4">Phòng ban</th>
                  <th className="p-4">Số máy lẻ</th>
                  <th className="p-4">Email công vụ</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MOCK_STAFF.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <span>{staff.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">{staff.title}</td>
                    <td className="p-4">
                      <Badge variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        {staff.department}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{staff.extension}</td>
                    <td className="p-4 font-mono text-slate-400">{staff.email}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400">
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
      )}
    </div>
  );
};
