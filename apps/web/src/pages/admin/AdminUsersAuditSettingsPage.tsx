import React, { useState } from 'react';
import {
  UserCheck,
  History,
  Settings,
  ShieldAlert,
  Key,
  Database,
  Lock,
  Plus,
  RefreshCw,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { MOCK_AUDIT_LOGS } from '../../lib/mock-data';

export interface AdminUsersAuditSettingsPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'users' | 'audit' | 'settings';
}

export const AdminUsersAuditSettingsPage: React.FC<AdminUsersAuditSettingsPageProps> = ({ onNavigate, subTab = 'users' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'settings'>(subTab);

  const usersList = [
    { id: 'u1', name: 'TS. Nguyễn Văn Hùng', email: 'admin@mbs.hochiminhcity.gov.vn', role: 'SuperAdmin', sso: 'SSO Connected', status: 'ACTIVE' },
    { id: 'u2', name: 'Kỹ sư Nguyễn Hoàng Nam', email: 'nam.nh@mbs.hochiminhcity.gov.vn', role: 'Editor Lead', sso: 'Standard', status: 'ACTIVE' },
    { id: 'u3', name: 'Chuyên viên Trần Thị Mai', email: 'mai.tt@mbs.hochiminhcity.gov.vn', role: 'Officer (Một cửa)', sso: 'SSO Connected', status: 'ACTIVE' },
  ];

  const handleRunBackup = () => {
    showToast('Bắt đầu sao lưu', 'Hệ thống đã khởi tạo bản sao lưu cơ sở dữ liệu tự động thành công!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            {activeTab === 'users' && 'Quản lý Người dùng, Phân quyền RBAC & Đăng nhập SSO'}
            {activeTab === 'audit' && 'Nhật ký Hoạt động Hệ thống (Audit Log 100%)'}
            {activeTab === 'settings' && 'Cấu hình Hệ thống, API & Lịch Sao lưu'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị tài khoản, kiểm vết an toàn thông tin 100% thao tác & tự động hóa sao lưu dữ liệu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Người dùng & Phân quyền
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'audit' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Nhật ký Audit Log
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Cấu hình & Sao lưu
            </button>
          </div>

          {activeTab === 'users' && (
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Tạo tài khoản mới
            </Button>
          )}

          {activeTab === 'settings' && (
            <Button onClick={handleRunBackup} variant="primary" size="sm" className="gap-1.5">
              <Database className="w-4 h-4" /> Sao lưu ngay
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'users' && (
        /* Users RBAC Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Email công vụ</th>
                  <th className="p-4">Vai trò (RBAC)</th>
                  <th className="p-4">Xác thực SSO</th>
                  <th className="p-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-4 font-bold text-white">{user.name}</td>
                    <td className="p-4 font-mono text-slate-400">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="outline" size="sm" className="border-rose-800 text-rose-300">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-emerald-400">{user.sso}</td>
                    <td className="p-4 text-center">
                      <Badge variant="success" size="sm">Đang hoạt động</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        /* Audit Log Timeline */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">100% Vết Thao tác Ghi nhận (Audit Log)</h3>

          <div className="divide-y divide-slate-800">
            {MOCK_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{log.actor}</strong>
                    <span className="font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] border border-emerald-900">{log.action}</span>
                    <span className="text-slate-400 font-mono">({log.ip})</span>
                  </div>
                  <p className="text-slate-400">{log.target}</p>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        /* System Settings & Backup Scheduler */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-3xl mx-auto">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">Cấu hình Hệ thống & Sao lưu Tự động</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tên cơ quan vận hành</label>
              <input type="text" defaultValue="Ban Quản lý các Khu liên hợp xử lý chất thải TP.HCM (MBS)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Tích hợp API Thời tiết & AQI Key</label>
              <input type="text" defaultValue="mbs_live_aqi_key_998823" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-400" />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Lịch trình Sao lưu Dữ liệu Tự động</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <option>Hằng ngày lúc 01:00 AM (Daily Backup)</option>
                <option>Hằng tuần vào Chủ nhật</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
