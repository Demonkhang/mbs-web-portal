import React from 'react';
import { Search, Eye, EyeOff, Edit, Trash2, Building2, Users, RefreshCw } from 'lucide-react';
import { Badge } from '../../ui/badge';

export interface StaffTableProps {
  staffs: any[];
  units: any[];
  departments: any[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterUnitId: string;
  onFilterUnitChange: (id: string) => void;
  filterDeptId: string;
  onFilterDeptChange: (id: string) => void;
  onToggleActive: (staff: any) => void;
  onEdit: (staff: any) => void;
  onDelete: (staff: any) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffs,
  units,
  departments,
  loading,
  searchQuery,
  onSearchChange,
  filterUnitId,
  onFilterUnitChange,
  filterDeptId,
  onFilterDeptChange,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  const filteredStaffs = staffs.filter((staff) => {
    if (filterUnitId && staff.unitId !== filterUnitId) return false;
    if (filterDeptId && staff.departmentId !== filterDeptId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = staff.fullName?.toLowerCase().includes(q);
      const matchPos = staff.position?.toLowerCase().includes(q);
      const matchPhone = staff.phone?.toLowerCase().includes(q);
      const matchExt = staff.extension?.toLowerCase().includes(q);
      const matchEmail = staff.email?.toLowerCase().includes(q);
      return matchName || matchPos || matchPhone || matchExt || matchEmail;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên, chức vụ, máy lẻ, email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filterUnitId}
            onChange={(e) => onFilterUnitChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="">Tất cả Đơn vị ({units.length})</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={filterDeptId}
            onChange={(e) => onFilterDeptChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="">Tất cả Phòng ban ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs">Đang tải danh bạ cán bộ từ PostgreSQL CSDL...</p>
          </div>
        ) : filteredStaffs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Không tìm thấy cán bộ phù hợp</p>
            <p className="text-xs">Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm cán bộ mới"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Cán bộ / Nhân sự</th>
                  <th className="p-4">Chức danh / Vị trí</th>
                  <th className="p-4">Đơn vị & Phòng ban</th>
                  <th className="p-4">SĐT / Máy lẻ</th>
                  <th className="p-4">Email công vụ</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStaffs.map((staff) => (
                  <tr
                    key={staff.id}
                    className={`hover:bg-slate-850/80 transition-colors ${
                      !staff.isActive ? 'opacity-50 bg-slate-950/40' : ''
                    }`}
                  >
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      {staff.avatarUrl ? (
                        <img
                          src={staff.avatarUrl}
                          alt={staff.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {staff.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-sm">{staff.fullName}</div>
                        {staff.duties && (
                          <div className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs mt-0.5">
                            {staff.duties}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">{staff.position}</td>
                    <td className="p-4 space-y-1">
                      {staff.unit && (
                        <div className="text-white font-medium text-[11px] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{staff.unit.name}</span>
                        </div>
                      )}
                      {staff.department && (
                        <div className="text-slate-400 text-[10px]">
                          {staff.department.name}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      {staff.extension && (
                        <span className="font-bold text-emerald-400 mr-2">Ext: {staff.extension}</span>
                      )}
                      <span className="text-slate-300">{staff.phone || '--'}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{staff.email || '--'}</td>
                    <td className="p-4">
                      {staff.isActive ? (
                        <Badge variant="success" size="sm" className="bg-emerald-950 border-emerald-700 text-emerald-400">
                          Hiển thị Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm" className="border-slate-700 text-slate-500 bg-slate-950">
                          Đang tạm ẩn
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleActive(staff)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            staff.isActive
                              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400'
                              : 'bg-emerald-950 border-emerald-800 text-emerald-400'
                          }`}
                          title={staff.isActive ? 'Tạm ẩn khỏi Front-end' : 'Kích hoạt hiển thị'}
                        >
                          {staff.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onEdit(staff)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition-all"
                          title="Chỉnh sửa cán bộ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(staff)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 border border-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                          title="Xóa khỏi CSDL"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
};
