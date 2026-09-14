import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';

export interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDept: any | null;
  units: any[];
  defaultUnitId?: string;
  onSave: (formData: any) => Promise<void>;
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  isOpen,
  onClose,
  editingDept,
  units,
  defaultUnitId,
  onSave,
}) => {
  const [form, setForm] = useState({
    unitId: '',
    code: '',
    name: '',
    phone: '',
    email: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingDept) {
      setForm({
        unitId: editingDept.unitId || '',
        code: editingDept.code || '',
        name: editingDept.name || '',
        phone: editingDept.phone || '',
        email: editingDept.email || '',
        sortOrder: editingDept.sortOrder || 0,
        isActive: editingDept.isActive !== false,
      });
    } else {
      setForm({
        unitId: defaultUnitId || units[0]?.id || '',
        code: '',
        name: '',
        phone: '',
        email: '',
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [editingDept, defaultUnitId, units, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-slate-900">{editingDept ? 'Sửa Phòng ban' : 'Thêm Phòng ban mới'}</span>}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Thuộc Đơn vị <span className="text-rose-500">*</span></label>
          <select
            required
            value={form.unitId}
            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
          >
            <option value="">-- Chọn Đơn vị --</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mã Phòng ban <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="VD: PKHTC, PQLKT"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Thứ tự sắp xếp</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Tên Phòng ban <span className="text-rose-500">*</span></label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Phòng Kế hoạch - Tài chính"
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Số điện thoại / Máy lẻ</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600"
            />
            <span>Kích hoạt Phòng ban</span>
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu Phòng ban
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
