import React, { useState } from 'react';
import {
  Inbox,
  Search,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Mail,
  Send,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { useToast } from '../../components/ui/toast';
import { MOCK_APPLICATIONS } from '../../lib/mock-data';

export interface AdminSubmissionsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminSubmissionsPage: React.FC<AdminSubmissionsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [assignedOfficer, setAssignedOfficer] = useState('Kỹ sư Nguyễn Hoàng Nam');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleUpdateStep = (newStep: number) => {
    showToast('Cập nhật tiến độ', `Hồ sơ ${selectedApp?.trackingCode} đã chuyển sang Bước ${newStep} & tự động gửi Email/SMS!`, 'success');
  };

  const handleAssign = () => {
    showToast('Phân công thành công', `Đã phân công cán bộ ${assignedOfficer} thụ lý hồ sơ ${selectedApp?.trackingCode}`, 'info');
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-sky-400" />
            Quản lý Tiếp nhận Hồ sơ Dịch vụ công Trực tuyến
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phân công chuyên viên thụ lý, cập nhật quy trình 4 bước và kích hoạt gửi Email/SMS tự động
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Submissions List Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Danh sách Hồ sơ đã Tiếp nhận ({MOCK_APPLICATIONS.length})</h3>
            </div>

            <div className="divide-y divide-slate-800">
              {MOCK_APPLICATIONS.map((app) => (
                <div
                  key={app.trackingCode}
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 hover:bg-slate-850 cursor-pointer transition-colors ${selectedApp?.trackingCode === app.trackingCode ? 'bg-slate-850 border-l-4 border-emerald-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                          {app.trackingCode}
                        </span>
                        <Badge variant="success" size="sm">
                          Bước {app.currentStep}/4
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{app.serviceName}</h4>
                      <p className="text-xs text-slate-400">Người nộp: <strong>{app.applicantName}</strong> ({app.applicantPhone})</p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Detail & Stepper Update Control Panel */}
        <div className="space-y-6">
          {selectedApp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl sticky top-20">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Đang xem hồ sơ</span>
                <h3 className="text-base font-bold text-white font-mono">{selectedApp.trackingCode}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedApp.serviceName}</p>
              </div>

              {/* Workflow Stepper Control */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cập nhật Bước Xử lý</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button onClick={() => handleUpdateStep(1)} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-slate-300 cursor-pointer">
                    1. Tiếp nhận
                  </button>
                  <button onClick={() => handleUpdateStep(2)} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-amber-400 cursor-pointer">
                    2. Thẩm định
                  </button>
                  <button onClick={() => handleUpdateStep(3)} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-sky-400 cursor-pointer">
                    3. Trình duyệt
                  </button>
                  <button onClick={() => handleUpdateStep(4)} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-emerald-400 cursor-pointer">
                    4. Hoàn tất
                  </button>
                </div>
              </div>

              {/* Officer Assign Action */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cán bộ thụ lý:</span>
                  <strong className="text-white">{selectedApp.assignedOfficer || 'Chưa phân công'}</strong>
                </div>
                <Button onClick={() => setIsAssignModalOpen(true)} variant="outline" size="sm" className="w-full bg-slate-900 border-slate-800 text-xs text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" /> Phân công chuyên viên
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Chọn một hồ sơ từ danh sách bên trái để xem chi tiết & cập nhật tiến độ
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Phân công Cán bộ Thụ lý">
        <div className="space-y-4 text-xs">
          <label className="block font-bold text-slate-700">Chọn chuyên viên phụ trách:</label>
          <select
            value={assignedOfficer}
            onChange={(e) => setAssignedOfficer(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option>Kỹ sư Nguyễn Hoàng Nam (Phòng QLMT)</option>
            <option>ThS. Lê Văn Phúc (Phòng Kỹ thuật)</option>
            <option>Chuyên viên Trần Thị Mai (Văn phòng Ban)</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" onClick={handleAssign}>Xác nhận phân công</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
