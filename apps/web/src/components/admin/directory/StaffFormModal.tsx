import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';

export interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStaff: any | null;
  units: any[];
  departments: any[];
  onSave: (formData: any) => Promise<void>;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  editingStaff,
  units,
  departments,
  onSave,
}) => {
  const [form, setForm] = useState({
    unitId: '',
    departmentId: '',
    fullName: '',
    position: '',
    phone: '',
    extension: '',
    email: '',
    avatarUrl: '',
    duties: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingStaff) {
      setForm({
        unitId: editingStaff.unitId || '',
        departmentId: editingStaff.departmentId || '',
        fullName: editingStaff.fullName || '',
        position: editingStaff.position || '',
        phone: editingStaff.phone || '',
        extension: editingStaff.extension || '',
        email: editingStaff.email || '',
        avatarUrl: editingStaff.avatarUrl || '',
        duties: editingStaff.duties || '',
        sortOrder: editingStaff.sortOrder || 0,
        isActive: editingStaff.isActive !== false,
      });
    } else {
      setForm({
        unitId: units[0]?.id || '',
        departmentId: departments[0]?.id || '',
        fullName: '',
        position: '',
        phone: '',
        extension: '',
        email: '',
        avatarUrl: '',
        duties: '',
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [editingStaff, units, departments, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Users className="w-5 h-5 text-emerald-600" />
          <span>{editingStaff ? 'Chỉnh sửa Cán bộ Danh bạ' : 'Thêm mới Cán bộ vào CSDL'}</span>
        </div>
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Họ và tên cán bộ <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="VD: Nguyễn Văn Minh"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Chức danh / Vị trí <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="VD: Trưởng ban Quản lý / Chánh Văn phòng"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Đơn vị trực thuộc</label>
            <select
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
            >
              <option value="">-- Chọn Đơn vị --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Phòng ban chuyên môn</label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
            >
              <option value="">-- Chọn Phòng ban --</option>
              {departments
                .filter((d) => !form.unitId || d.unitId === form.unitId)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Số máy lẻ (Extension)</label>
            <input
              type="text"
              value={form.extension}
              onChange={(e) => setForm({ ...form, extension: e.target.value })}
              placeholder="VD: 101, 202"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Số điện thoại liên hệ</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="VD: 028 3822 5566"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Thư điện tử công vụ</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="VD: minhnv.mbs@tphcm.gov.vn"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">URL Ảnh đại diện (Nếu có)</label>
          <input
            type="text"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            placeholder="https://..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Mô tả Phân công Nhiệm vụ chính</label>
          <textarea
            rows={3}
            value={form.duties}
            onChange={(e) => setForm({ ...form, duties: e.target.value })}
            placeholder="Mô tả ngắn gọn chức năng, quyền hạn và mảng chỉ đạo..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Hiển thị trên Cổng thông tin Front-end (Public)</span>
          </label>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingStaff ? 'Lưu cập nhật' : 'Thêm mới Cán bộ'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
