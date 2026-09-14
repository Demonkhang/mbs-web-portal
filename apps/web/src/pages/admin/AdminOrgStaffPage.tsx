import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { fetchApi } from '../../services/api-client';

import { StaffTable } from '../../components/admin/directory/StaffTable';
import { UnitsDepartmentsTree } from '../../components/admin/directory/UnitsDepartmentsTree';
import { StaffFormModal } from '../../components/admin/directory/StaffFormModal';
import { UnitFormModal } from '../../components/admin/directory/UnitFormModal';
import { DepartmentFormModal } from '../../components/admin/directory/DepartmentFormModal';

export interface AdminOrgStaffPageProps {
  onNavigate?: (path: string) => void;
  subTab?: 'staff' | 'units' | 'org';
}

export const AdminOrgStaffPage: React.FC<AdminOrgStaffPageProps> = ({ subTab = 'staff' }) => {
  const initialTab = subTab === 'org' ? 'units' : subTab;
  const [activeTab, setActiveTab] = useState<'staff' | 'units'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [units, setUnits] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);

  // Filters for Staff list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnitId, setFilterUnitId] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [defaultDeptUnitId, setDefaultDeptUnitId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [unitsRes, deptsRes, staffRes] = await Promise.all([
        fetchApi<{ data: any[] }>('/v1/directory/units'),
        fetchApi<{ data: any[] }>('/v1/directory/departments'),
        fetchApi<{ data: any[] }>('/v1/directory/staff?includeInactive=true'),
      ]);

      setUnits(unitsRes.data || []);
      setDepartments(deptsRes.data || []);
      setStaffs(staffRes.data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể nạp dữ liệu danh bạ từ CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Staff Operations
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (formData: any) => {
    try {
      if (editingStaff) {
        await fetchApi(`/v1/directory/staff/${editingStaff.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showNotification(`Đã cập nhật thông tin cán bộ ${formData.fullName}`);
      } else {
        await fetchApi('/v1/directory/staff', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showNotification(`Đã thêm mới cán bộ ${formData.fullName} vào Danh bạ CSDL`);
      }
      setIsStaffModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu cán bộ');
    }
  };

  const handleToggleStaffActive = async (staff: any) => {
    try {
      await fetchApi(`/v1/directory/staff/${staff.id}/toggle-active`, { method: 'PATCH' });
      showNotification(`Đã ${staff.isActive ? 'tạm ẩn' : 'kích hoạt'} cán bộ ${staff.fullName}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi thay đổi trạng thái');
    }
  };

  const handleDeleteStaff = async (staff: any) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa cán bộ "${staff.fullName}" khỏi Danh bạ CSDL không?`)) return;
    try {
      await fetchApi(`/v1/directory/staff/${staff.id}`, { method: 'DELETE' });
      showNotification(`Đã xóa cán bộ ${staff.fullName} khỏi Danh bạ`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa cán bộ');
    }
  };

  // Unit Operations
  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (formData: any) => {
    try {
      if (editingUnit) {
        await fetchApi(`/v1/directory/units/${editingUnit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showNotification(`Đã cập nhật Đơn vị ${formData.name}`);
      } else {
        await fetchApi('/v1/directory/units', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showNotification(`Đã thêm mới Đơn vị ${formData.name}`);
      }
      setIsUnitModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu Đơn vị');
    }
  };

  const handleDeleteUnit = async (unit: any) => {
    if (!confirm(`Bạn có chắc muốn xóa Đơn vị "${unit.name}"?`)) return;
    try {
      await fetchApi(`/v1/directory/units/${unit.id}`, { method: 'DELETE' });
      showNotification(`Đã xóa Đơn vị ${unit.name}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa Đơn vị');
    }
  };

  // Department Operations
  const handleOpenAddDept = (unitId?: string) => {
    setEditingDept(null);
    setDefaultDeptUnitId(unitId);
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: any) => {
    setEditingDept(dept);
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (formData: any) => {
    try {
      if (editingDept) {
        await fetchApi(`/v1/directory/departments/${editingDept.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showNotification(`Đã cập nhật Phòng ban ${formData.name}`);
      } else {
        await fetchApi('/v1/directory/departments', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showNotification(`Đã thêm mới Phòng ban ${formData.name}`);
      }
      setIsDeptModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu Phòng ban');
    }
  };

  const handleDeleteDept = async (dept: any) => {
    if (!confirm(`Bạn có chắc muốn xóa Phòng ban "${dept.name}"?`)) return;
    try {
      await fetchApi(`/v1/directory/departments/${dept.id}`, { method: 'DELETE' });
      showNotification(`Đã xóa Phòng ban ${dept.name}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa Phòng ban');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Quản lý Danh bạ điện tử Cán bộ & Phòng ban</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dữ liệu đồng bộ tự động theo thời gian thực tới Front-end (Cổng thông tin - Tab Liên hệ) từ CSDL PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Làm mới dữ liệu từ CSDL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Danh bạ Cán bộ ({staffs.length})
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'units'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cơ cấu Đơn vị & Phòng ({units.length})
            </button>
          </div>

          {activeTab === 'staff' ? (
            <Button variant="primary" size="sm" onClick={handleOpenAddStaff} className="gap-1.5">
              <Plus className="w-4 h-4" /> Thêm cán bộ mới
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleOpenAddUnit} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Thêm Đơn vị
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleOpenAddDept()} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Thêm Phòng ban
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 p-4 rounded-xl flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400/70 bg-emerald-900/40 px-2 py-0.5 rounded">Tự động đồng bộ Front-end</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/90 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Staff Table View */}
      {activeTab === 'staff' && (
        <StaffTable
          staffs={staffs}
          units={units}
          departments={departments}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterUnitId={filterUnitId}
          onFilterUnitChange={setFilterUnitId}
          filterDeptId={filterDeptId}
          onFilterDeptChange={setFilterDeptId}
          onToggleActive={handleToggleStaffActive}
          onEdit={handleOpenEditStaff}
          onDelete={handleDeleteStaff}
        />
      )}

      {/* Tab 2: Units & Departments Tree View */}
      {activeTab === 'units' && (
        <UnitsDepartmentsTree
          units={units}
          departments={departments}
          staffs={staffs}
          onAddUnit={handleOpenAddUnit}
          onEditUnit={handleOpenEditUnit}
          onDeleteUnit={handleDeleteUnit}
          onAddDept={handleOpenAddDept}
          onEditDept={handleOpenEditDept}
          onDeleteDept={handleDeleteDept}
        />
      )}

      {/* Modals */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        editingStaff={editingStaff}
        units={units}
        departments={departments}
        onSave={handleSaveStaff}
      />

      <UnitFormModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        editingUnit={editingUnit}
        onSave={handleSaveUnit}
      />

      <DepartmentFormModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        editingDept={editingDept}
        units={units}
        defaultUnitId={defaultDeptUnitId}
        onSave={handleSaveDept}
      />
    </div>
  );
};
