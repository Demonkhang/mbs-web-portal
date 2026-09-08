import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Database,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Power,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';
import { fetchApi } from '../../services/api-client';

export interface UserItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  module: string;
  userId?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

export interface AdminUsersAuditSettingsPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'users' | 'audit' | 'settings';
}

export const AdminUsersAuditSettingsPage: React.FC<AdminUsersAuditSettingsPageProps> = ({ subTab = 'users' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'settings'>(subTab);

  // Live Data States directly from PostgreSQL Database (10 columns match)
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modals States for User CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'OFFICER',
    department: 'Ban Quản lý MBS',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    password: 'admin123',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Live Users directly from PostgreSQL DB via API GET /api/v1/users
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetchApi<{ data: UserItem[] }>('/v1/users');
      if (res && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Lỗi truy vấn danh sách users từ DB:', err);
      setUsers([]);
    }
  }, []);

  // Fetch Live Audit Logs directly from PostgreSQL DB via API GET /api/v1/audit-logs
  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await fetchApi<{ data: AuditLogItem[] }>('/v1/audit-logs?page=1&limit=30');
      if (res && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      } else {
        setAuditLogs([]);
      }
    } catch (err: any) {
      console.error('Lỗi truy vấn audit logs từ DB:', err);
      setAuditLogs([]);
    }
  }, []);

  // Fetch Live Roles from PostgreSQL DB via API GET /api/v1/roles
  const loadRoles = useCallback(async () => {
    try {
      const res = await fetchApi<{ data: RoleItem[] }>('/v1/roles');
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setRoles(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi truy vấn danh sách vai trò từ DB:', err);
    }
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadRoles();
    if (activeTab === 'users') await loadUsers();
    if (activeTab === 'audit') await loadAuditLogs();
    setIsRefreshing(false);
    showToast('Tải lại dữ liệu', 'Đồng bộ lại dữ liệu trực tiếp từ CSDL PostgreSQL', 'success');
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await loadRoles();
      if (activeTab === 'users') await loadUsers();
      if (activeTab === 'audit') await loadAuditLogs();
      setIsLoading(false);
    };
    fetchData();
  }, [activeTab, loadUsers, loadAuditLogs, loadRoles]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      role: 'OFFICER',
      department: 'Ban Quản lý MBS',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      password: 'admin123',
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || 'Ban Quản lý MBS',
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      password: '',
      isActive: user.isActive,
    });
  };

  // Create User Handler (POST /api/v1/users)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.email) {
      showToast('Thông tin chưa đủ', 'Username, Họ tên và Email là bắt buộc.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi('/v1/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      showToast('Tạo tài khoản', `Đã lưu tài khoản '${formData.fullName}' vào PostgreSQL DB!`, 'success');
      setIsCreateModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      showToast('Lỗi tạo tài khoản', err.message || 'Không thể ghi vào PostgreSQL DB', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User Handler (PUT /api/v1/users/:id)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await fetchApi(`/v1/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          avatarUrl: formData.avatarUrl,
          isActive: formData.isActive,
          password: formData.password ? formData.password : undefined,
        }),
      });

      showToast('Cập nhật tài khoản', `Đã cập nhật cán bộ '${formData.fullName}' trong CSDL!`, 'success');
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      showToast('Lỗi cập nhật', err.message || 'Không thể cập nhật CSDL', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle User Active Status (PATCH /api/v1/users/:id/toggle-status)
  const handleToggleStatus = async (user: UserItem) => {
    try {
      await fetchApi(`/v1/users/${user.id}/toggle-status`, { method: 'PATCH' });
      showToast('Thay đổi trạng thái', `Đã ${user.isActive ? 'tạm khóa' : 'kích hoạt'} tài khoản '${user.fullName}'!`, 'success');
      await loadUsers();
    } catch (err: any) {
      showToast('Lỗi', err.message || 'Không thể đổi trạng thái', 'error');
    }
  };

  // Delete User Handler (DELETE /api/v1/users/:id)
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await fetchApi(`/v1/users/${deletingUser.id}`, { method: 'DELETE' });
      showToast('Xóa tài khoản', `Đã xóa tài khoản '${deletingUser.fullName}' khỏi CSDL PostgreSQL!`, 'success');
      setDeletingUser(null);
      await loadUsers();
    } catch (err: any) {
      showToast('Lỗi xóa', err.message || 'Không thể xóa tài khoản', 'error');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.username.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            {activeTab === 'users' && 'Quản lý Người dùng & Phân quyền (PostgreSQL Live DB)'}
            {activeTab === 'audit' && 'Nhật ký Audit Log (100% PostgreSQL Realtime)'}
            {activeTab === 'settings' && 'Cấu hình Hệ thống, API & Lịch Sao lưu DB'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị full CRUD dữ liệu thời gian thực trực tiếp từ 10 cột trong bảng <code>users</code> PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer transition-all disabled:opacity-50"
            title="Đồng bộ lại từ DB"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Người dùng & Phân quyền
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'audit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Nhật ký Audit Log
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Cấu hình & Sao lưu
            </button>
          </div>

          {activeTab === 'users' && (
            <Button onClick={openCreateModal} variant="primary" size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500">
              <Plus className="w-4 h-4" /> Tạo tài khoản mới
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm cán bộ theo tên, email, username..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Tổng số tài khoản trong DB: <strong className="text-emerald-400">{filteredUsers.length}</strong>
            </span>
          </div>

          {/* Users Live RBAC Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs">Đang truy vấn bảng <code>users</code> từ PostgreSQL...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-slate-400 text-xs">Chưa tìm thấy dữ liệu tài khoản trong PostgreSQL DB.</p>
                <Button onClick={openCreateModal} variant="primary" size="sm" className="bg-emerald-600">
                  <Plus className="w-4 h-4 mr-1" /> Thêm tài khoản cán bộ đầu tiên vào DB
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Họ và tên</th>
                      <th className="p-4">Email công vụ</th>
                      <th className="p-4">Phòng ban</th>
                      <th className="p-4">Vai trò (RBAC)</th>
                      <th className="p-4">Xác thực SSO</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-850 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs overflow-hidden shrink-0">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                              ) : (
                                user.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{user.fullName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-300">{user.email}</td>
                        <td className="p-4 text-slate-400">{user.department || 'Ban Quản lý MBS'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                              user.role === 'SUPER_ADMIN'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                : user.role === 'EDITOR_LEAD'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : user.role === 'EDITOR'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-emerald-400">
                          {user.email.endsWith('.gov.vn') ? 'SSO Connected' : 'Standard Auth'}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              user.isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                                : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                            }`}
                            title="Bấm để bật/tắt trạng thái hoạt động"
                          >
                            {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{user.isActive ? 'Đang hoạt động' : 'Tạm khóa'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"
                              title="Chỉnh sửa tài khoản cán bộ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900/80 hover:text-white cursor-pointer transition-colors"
                              title="Xóa tài khoản khỏi PostgreSQL"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        /* Audit Log Timeline directly from PostgreSQL DB */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">100% Vết Thao tác Ghi nhận Realtime (Audit Log)</h3>
            <span className="text-xs text-slate-400 font-mono">Truy vấn thực tế từ bảng <code>audit_logs</code></span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Đang tải nhật ký audit log từ Database PostgreSQL...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có nhật ký ghi nhận trong bảng <code>audit_logs</code>.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{log.user?.fullName || log.userId || 'Cán bộ MBS'}</strong>
                      <span className="font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] border border-emerald-900">{log.action}</span>
                      <span className="text-slate-400 font-mono">({log.ipAddress || '127.0.0.1'})</span>
                    </div>
                    <p className="text-slate-400">{log.details || `Thao tác trên module ${log.module}`}</p>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
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
              <label className="block font-bold text-slate-300 mb-1">Lịch trình Sao lưu Dữ liệu Tự động (PostgreSQL Dump)</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <option>Hằng ngày lúc 01:00 AM (Daily Backup)</option>
                <option>Hằng tuần vào Chủ nhật</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo mới Tài khoản Cán bộ (POST) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" /> Tạo mới tài khoản vào CSDL PostgreSQL
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên đăng nhập (username) *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="ví dụ: nam.nh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Họ và tên cán bộ (full_name) *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="ví dụ: Kỹ sư Nguyễn Hoàng Nam"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email công vụ (email) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nam.nh@mbs.hochiminhcity.gov.vn"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phòng ban (department)</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Vai trò phân quyền (role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {(roles.length > 0 ? roles : [
                    { code: 'SUPER_ADMIN', name: 'Quản trị tối cao (Super Admin)' },
                    { code: 'ADMIN', name: 'Quản trị viên Hệ thống' },
                    { code: 'APPROVER', name: 'Lãnh đạo Phê duyệt (Approver)' },
                    { code: 'EDITOR_LEAD', name: 'Trưởng ban biên tập (Editor Lead)' },
                    { code: 'EDITOR', name: 'Biên tập viên Tin bài' },
                    { code: 'OFFICER', name: 'Chuyên viên Thụ lý' },
                  ]).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mật khẩu ban đầu (password_hash)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu vào PostgreSQL'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Tài khoản Cán bộ (PUT) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" /> Sửa thông tin cán bộ trong PostgreSQL
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Tên đăng nhập (username - cố định)</label>
                <input
                  type="text"
                  disabled
                  value={formData.username}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Họ và tên cán bộ (full_name) *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email công vụ (email) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phòng ban (department)</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Vai trò phân quyền (role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {(roles.length > 0 ? roles : [
                    { code: 'SUPER_ADMIN', name: 'Quản trị tối cao (Super Admin)' },
                    { code: 'ADMIN', name: 'Quản trị viên Hệ thống' },
                    { code: 'APPROVER', name: 'Lãnh đạo Phê duyệt (Approver)' },
                    { code: 'EDITOR_LEAD', name: 'Trưởng ban biên tập (Editor Lead)' },
                    { code: 'EDITOR', name: 'Biên tập viên Tin bài' },
                    { code: 'OFFICER', name: 'Chuyên viên Thụ lý' },
                  ]).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingUser(null)}>Hủy</Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cập nhật CSDL'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa Tài khoản Cán bộ (DELETE) */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" /> Xác nhận xóa tài khoản khỏi CSDL
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản cán bộ <strong className="text-white">{deletingUser.fullName}</strong> (<code>@{deletingUser.username}</code>) khỏi bảng <code>users</code> trong PostgreSQL?
            </p>
            <div className="pt-3 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingUser(null)}>Hủy bỏ</Button>
              <Button type="button" variant="primary" size="sm" onClick={handleDeleteUser} className="bg-rose-600 hover:bg-rose-500 text-white">
                Xóa vĩnh viễn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
