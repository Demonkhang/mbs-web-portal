import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, Trash2, Edit3, Save, Sparkles, Layers, Lock, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import { fetchApi } from '../../services/api-client';

export interface PermissionItem {
  code: string;
  title: string;
  description: string;
}

export interface DomainCatalog {
  domain: string;
  title: string;
  description: string;
  permissions: PermissionItem[];
}

export interface RoleDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  badgeClass?: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
}

const BADGE_COLOR_OPTIONS = [
  { name: 'Xanh Ngọc (Emerald)', value: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  { name: 'Tím Quản trị (Purple)', value: 'bg-purple-950 text-purple-300 border-purple-800' },
  { name: 'Đỏ Tối cao (Rose)', value: 'bg-rose-950 text-rose-300 border-rose-800' },
  { name: 'Cam Thụ lý (Amber)', value: 'bg-amber-950 text-amber-300 border-amber-800' },
  { name: 'Xanh Dương (Sky)', value: 'bg-sky-950 text-sky-300 border-sky-800' },
  { name: 'Xanh Xám (Teal)', value: 'bg-teal-950 text-teal-300 border-teal-800' },
  { name: 'Xám Mặc định (Slate)', value: 'bg-slate-800 text-slate-300 border-slate-700' },
];

export const AdminRolesPermissionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [catalog, setCatalog] = useState<DomainCatalog[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBadge, setNewRoleBadge] = useState(BADGE_COLOR_OPTIONS[0].value);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  useEffect(() => {
    loadCatalogAndRoles();
  }, []);

  const loadCatalogAndRoles = async () => {
    try {
      setIsLoading(true);
      const [catalogRes, rolesRes] = await Promise.all([
        fetchApi<any>('/v1/roles/permissions-catalog'),
        fetchApi<any>('/v1/roles'),
      ]);

      const catalogData: DomainCatalog[] = Array.isArray(catalogRes?.data)
        ? catalogRes.data
        : Array.isArray(catalogRes)
        ? catalogRes
        : [];
      const rolesData: RoleDefinition[] = Array.isArray(rolesRes?.data)
        ? rolesRes.data
        : Array.isArray(rolesRes)
        ? rolesRes
        : [];

      setCatalog(catalogData);
      setRoles(rolesData);
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0]);
        setActivePermissions(rolesData[0].permissions || []);
      }
    } catch (err: any) {
      showToast('Lỗi tải ma trận phân quyền', err.message || 'Không thể lấy dữ liệu vai trò', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setActivePermissions(role.permissions || []);
  };

  const handleTogglePermission = (code: string) => {
    if (activePermissions.includes(code)) {
      setActivePermissions(activePermissions.filter((p) => p !== code));
    } else {
      setActivePermissions([...activePermissions, code]);
    }
  };

  const handleToggleDomainAll = (domainPermissions: PermissionItem[]) => {
    const codes = domainPermissions.map((p) => p.code);
    const hasAll = codes.every((c) => activePermissions.includes(c));

    if (hasAll) {
      setActivePermissions(activePermissions.filter((p) => !codes.includes(p)));
    } else {
      const merged = Array.from(new Set([...activePermissions, ...codes]));
      setActivePermissions(merged);
    }
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      const res = await fetchApi<any>(`/v1/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          permissions: activePermissions,
        }),
      });

      const updated: RoleDefinition = res?.data || res;
      setRoles(roles.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRole(updated);
      showToast('Cập nhật thành công', `Đã lưu ma trận phân quyền cho vai trò ${updated.name}`, 'success');
    } catch (err: any) {
      showToast('Lỗi lưu phân quyền', err.message || 'Không thể lưu vai trò', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode.trim() || !newRoleName.trim()) {
      showToast('Thiếu thông tin', 'Vui lòng nhập Mã và Tên vai trò mới', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetchApi<any>('/v1/roles', {
        method: 'POST',
        body: JSON.stringify({
          code: newRoleCode.trim().toUpperCase(),
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
          badgeClass: newRoleBadge,
          permissions: newRolePermissions,
        }),
      });

      const created: RoleDefinition = res?.data || res;
      setRoles([...roles, created]);
      setSelectedRole(created);
      setActivePermissions(created.permissions || []);
      setIsCreateModalOpen(false);

      // Reset form
      setNewRoleCode('');
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePermissions([]);

      showToast('Tạo vai trò thành công', `Đã tạo vai trò tùy chỉnh '${created.name}'`, 'success');
    } catch (err: any) {
      showToast('Lỗi tạo vai trò', err.message || 'Không thể tạo vai trò mới', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomRole = async (role: RoleDefinition, e: React.MouseEvent) => {
    e.stopPropagation();
    if (role.isSystem) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò tùy chỉnh '${role.name}' (${role.code})?`)) return;

    try {
      await fetchApi(`/v1/roles/${role.id}`, { method: 'DELETE' });
      const nextRoles = roles.filter((r) => r.id !== role.id);
      setRoles(nextRoles);
      if (selectedRole?.id === role.id && nextRoles.length > 0) {
        setSelectedRole(nextRoles[0]);
        setActivePermissions(nextRoles[0].permissions || []);
      }
      showToast('Xóa vai trò thành công', `Đã xóa vai trò ${role.name}`, 'success');
    } catch (err: any) {
      showToast('Lỗi xóa vai trò', err.message || 'Không thể xóa vai trò', 'error');
    }
  };

  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  const totalCatalogPermissions = safeCatalog.reduce((acc, cat) => acc + (cat.permissions?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Đang tải Ma trận Phân quyền & Danh mục Lĩnh vực...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                Quản lý Phân quyền & Vai trò (Dynamic RBAC)
              </h1>
              <p className="text-xs text-slate-400">
                Ma trận phân quyền chi tiết theo 6 Lĩnh vực chuyên môn & Tạo Vai trò tùy chỉnh động
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Vai trò Tùy chỉnh Mới</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role Selector Tabs */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Danh sách Vai trò ({roles.length})
            </span>
            <span className="text-[10px] text-slate-500 italic">Chọn vai trò để điều chỉnh quyền</span>
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const permCount = role.permissions?.length || 0;

              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-600"></div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            role.badgeClass || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {role.name}
                        </span>
                        {role.isSystem ? (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Hệ thống
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                            Tùy chỉnh
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{role.description || 'Chưa có mô tả'}</p>
                    </div>

                    {!role.isSystem && (
                      <button
                        onClick={(e) => handleDeleteCustomRole(role, e)}
                        title="Xóa vai trò tùy chỉnh này"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-[10px] text-slate-500">{role.code}</span>
                    <span className="font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-900/60">
                      {permCount}/{totalCatalogPermissions} quyền
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix Editor */}
        <div className="lg:col-span-8 space-y-4">
          {selectedRole ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-6">
              {/* Matrix Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedRole.badgeClass}`}>
                      {selectedRole.name}
                    </span>
                    <span className="text-xs font-mono text-slate-400">({selectedRole.code})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Đang chọn: <strong className="text-emerald-400">{activePermissions.length}</strong> / {totalCatalogPermissions} quyền trong ma trận
                  </p>
                </div>

                <button
                  onClick={handleSaveMatrix}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu thay đổi Phân quyền</span>
                    </>
                  )}
                </button>
              </div>

              {/* Permission Catalog Domains List */}
              <div className="space-y-6">
                {safeCatalog.map((domainCat) => {
                  const domainCodes = domainCat.permissions.map((p) => p.code);
                  const isAllChecked = domainCodes.every((c) => activePermissions.includes(c));
                  const isSomeChecked = domainCodes.some((c) => activePermissions.includes(c)) && !isAllChecked;

                  return (
                    <div
                      key={domainCat.domain}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4"
                    >
                      {/* Domain Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-white">{domainCat.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{domainCat.description}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleDomainAll(domainCat.permissions)}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-950 border border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          {isAllChecked ? 'Bỏ chọn toàn bộ' : 'Chọn tất cả trong lĩnh vực này'}
                        </button>
                      </div>

                      {/* Permissions Checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {domainCat.permissions.map((perm) => {
                          const isChecked = activePermissions.includes(perm.code);

                          return (
                            <div
                              key={perm.code}
                              onClick={() => handleTogglePermission(perm.code)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isChecked
                                  ? 'bg-emerald-950/30 border-emerald-600/50 ring-1 ring-emerald-500/20'
                                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-500 text-slate-950 font-bold'
                                    : 'border border-slate-700 bg-slate-950'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                                    {perm.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                    {perm.code}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{perm.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <KeyRound className="w-10 h-10 mx-auto text-slate-600 mb-3 animate-bounce" />
              <p>Vui lòng chọn một vai trò ở danh sách bên trái để bắt đầu điều chỉnh phân quyền.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Custom Role */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Tạo Vai trò Tùy chỉnh Mới</h3>
                  <p className="text-xs text-slate-400">Thiết lập thông tin vai trò và tích chọn ma trận quyền ban đầu</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Mã Vai trò (Code) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TO_TRUONG_THAM_DINH"
                    value={newRoleCode}
                    onChange={(e) => setNewRoleCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Tên Hiển thị (Role Name) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Tổ trưởng Thẩm định Hồ sơ"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">Mô tả chức năng</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả phạm vi trách nhiệm và công việc của vai trò này..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Màu Badge đại diện
                </label>
                <select
                  value={newRoleBadge}
                  onChange={(e) => setNewRoleBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {BADGE_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-lg shadow-emerald-950/60 disabled:opacity-50"
                >
                  {isSaving ? 'Đang khởi tạo...' : 'Tạo mới Vai trò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPermissionsPage;
