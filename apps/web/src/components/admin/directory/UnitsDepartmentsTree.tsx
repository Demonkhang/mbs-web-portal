import React from 'react';
import { Building2, Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';

export interface UnitsDepartmentsTreeProps {
  units: any[];
  departments: any[];
  staffs: any[];
  onAddUnit: () => void;
  onEditUnit: (unit: any) => void;
  onDeleteUnit: (unit: any) => void;
  onAddDept: (unitId?: string) => void;
  onEditDept: (dept: any) => void;
  onDeleteDept: (dept: any) => void;
}

export const UnitsDepartmentsTree: React.FC<UnitsDepartmentsTreeProps> = ({
  units,
  departments,
  staffs,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddDept,
  onEditDept,
  onDeleteDept,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Unit List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Danh sách Đơn vị & Cơ quan Trực thuộc</span>
            </h3>
            <Button variant="primary" size="sm" onClick={onAddUnit} className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Thêm Đơn vị
            </Button>
          </div>

          <div className="space-y-4">
            {units.map((unit) => {
              const unitDepts = departments.filter((d) => d.unitId === unit.id);
              const unitStaffCount = staffs.filter((s) => s.unitId === unit.id).length;

              return (
                <div
                  key={unit.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {unit.code}
                        </span>
                        <h4 className="text-sm font-bold text-white">{unit.name}</h4>
                        {!unit.isActive && (
                          <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                            Ẩn
                          </span>
                        )}
                      </div>
                      {unit.address && (
                        <p className="text-xs text-slate-400 mt-1">{unit.address}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                        {unit.phone && <span>📞 {unit.phone}</span>}
                        {unit.email && <span>✉️ {unit.email}</span>}
                        <span className="text-emerald-400 font-bold">👥 {unitStaffCount} Cán bộ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onAddDept(unit.id)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg text-xs flex items-center gap-1"
                        title="Thêm phòng ban thuộc đơn vị này"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm phòng
                      </button>
                      <button
                        onClick={() => onEditUnit(unit)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteUnit(unit)}
                        className="p-1.5 bg-slate-900 hover:bg-rose-950 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Nested Departments */}
                  {unitDepts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Phòng ban trực thuộc ({unitDepts.length}):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unitDepts.map((dept) => (
                          <div
                            key={dept.id}
                            className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-200">{dept.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Mã: {dept.code} {dept.phone ? `| 📞 ${dept.phone}` : ''}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onEditDept(dept)}
                                className="p-1 text-slate-400 hover:text-emerald-400"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteDept(dept)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right 1 Col: Summary Stats & Guide */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Thống kê CSDL Danh bạ</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Tổng số Đơn vị:</span>
              <span className="text-base font-black text-emerald-400 font-mono">{units.length}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Tổng số Phòng ban:</span>
              <span className="text-base font-black text-emerald-400 font-mono">{departments.length}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Tổng số Cán bộ:</span>
              <span className="text-base font-black text-emerald-400 font-mono">{staffs.length}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Cán bộ đang Hiển thị:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {staffs.filter((s) => s.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
