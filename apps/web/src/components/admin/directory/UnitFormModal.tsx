import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';

export interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUnit: any | null;
  onSave: (formData: any) => Promise<void>;
}

export const UnitFormModal: React.FC<UnitFormModalProps> = ({
  isOpen,
  onClose,
  editingUnit,
  onSave,
}) => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingUnit) {
      setForm({
        code: editingUnit.code || '',
        name: editingUnit.name || '',
        address: editingUnit.address || '',
        phone: editingUnit.phone || '',
        email: editingUnit.email || '',
        sortOrder: editingUnit.sortOrder || 0,
        isActive: editingUnit.isActive !== false,
      });
    } else {
      setForm({
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [editingUnit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-slate-900">{editingUnit ? 'Sửa Đơn vị' : 'Thêm Đơn vị mới'}</span>}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mã Đơn vị <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="VD: BGD, VPB, TGD-DP"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
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
          <label className="font-bold text-slate-700">Tên Đơn vị <span className="text-rose-500">*</span></label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Ban Giám đốc MBS"
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Địa chỉ trụ sở</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="VD: Số 40 Võ Thị Sáu..."
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Số điện thoại</label>
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
            <span>Kích hoạt Đơn vị</span>
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu Đơn vị
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
