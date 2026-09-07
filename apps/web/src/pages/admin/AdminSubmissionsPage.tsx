import React, { useState, useEffect } from 'react';
import {
  Inbox,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  UserPlus,
  X,
  MapPin,
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  XCircle,
  Trash2,
  Lock,
  User
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { fetchApi } from '../../services/api-client';

export interface AdminSubmissionsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminSubmissionsPage: React.FC<AdminSubmissionsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Submissions State (ONLY Public Service Submissions)
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');

  // CSDL Officers List from DB
  const [dbOfficers, setDbOfficers] = useState<any[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  // Active Simulated Account for RBAC testing
  const [activeAccount, setActiveAccount] = useState<string>('Kỹ sư Nguyễn Hoàng Nam');

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch CSDL officers list for modal dropdown
  const loadDbOfficers = async () => {
    try {
      const res = await fetchApi<{ data: any[] }>('/v1/users/assignees');
      if (res && res.data && res.data.length > 0) {
        setDbOfficers(res.data);
        const defaultVal = `${res.data[0].fullName} (${res.data[0].department || 'Ban Quản lý'})`;
        setSelectedOfficer(defaultVal);
      }
    } catch (e) {
      setDbOfficers([
        { id: '1', fullName: 'Kỹ sư Nguyễn Hoàng Nam', department: 'Phòng Quản lý Môi trường' },
        { id: '2', fullName: 'ThS. Lê Thanh Hải', department: 'Phòng Giám sát Môi trường' },
        { id: '3', fullName: 'CN. Phạm Quốc Bảo', department: 'Tổ Trực ban 24/7' },
        { id: '4', fullName: 'Lưu Chữ Khang', department: 'Ban Giám đốc MBS' },
      ]);
    }
  };

  // Fetch Public Service Submissions ONLY from PostgreSQL CSDL via API
  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ data: any[] }>('/v1/submissions');
      const serviceList = (res?.data || []).map((item) => ({
        id: item.id,
        code: item.trackingCode,
        title: item.serviceName,
        applicant: `${item.applicantName} (${item.applicantPhone})`,
        facility: item.department || 'Bộ phận Một cửa MBS',
        currentStep: item.currentStep || 1,
        assignedOfficer: item.assignedOfficer || 'Chưa phân công',
        department: item.department || 'Bộ phận Một cửa',
        status: item.status || 'TIEP_NHAN',
        statusText: item.statusText || 'Đã tiếp nhận hồ sơ',
        rejectionReason: item.status === 'TU_CHOI' ? item.statusText || item.notes : '',
        createdAt: new Date(item.submissionDate || item.createdAt).toLocaleString('vi-VN'),
        officialResponse: item.notes || '',
        content: item.serviceName,
        rawDate: item.submissionDate || item.createdAt,
      })).sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

      setSubmissions(serviceList);

      if (serviceList.length > 0 && !selectedSubId) {
        setSelectedSubId(serviceList[0].id);
      }
    } catch (error: any) {
      showToast('Lỗi kết nối', 'Không thể tải hồ sơ dịch vụ công từ CSDL PostgreSQL', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDbOfficers();
    loadSubmissions();
  }, []);

  const currentSub = submissions.find((item) => item.id === selectedSubId) || submissions[0] || {};

  // Permission Check Logic:
  const isSuperAdmin = activeAccount.includes('Super Admin') || activeAccount.includes('Admin');
  const isAssignedOfficer =
    isSuperAdmin ||
    currentSub.assignedOfficer === 'Chưa phân công' ||
    (currentSub.assignedOfficer &&
      activeAccount.toLowerCase().includes(currentSub.assignedOfficer.split(' (')[0].toLowerCase())) ||
    (currentSub.assignedOfficer &&
      currentSub.assignedOfficer.toLowerCase().includes(activeAccount.split(' (')[0].toLowerCase()));

  const isRejected = currentSub.status === 'TU_CHOI' || currentSub.statusText?.includes('Từ chối');

  // Action: Assign Officer (Syncs to PostgreSQL DB)
  const handleConfirmAssign = async () => {
    if (!currentSub.id) return;
    const officerName = selectedOfficer.split(' (')[0];

    try {
      await fetchApi(`/v1/submissions/${currentSub.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          assignedOfficer: officerName,
          currentStep: currentSub.currentStep === 1 ? 2 : currentSub.currentStep,
          statusText: `Đã phân công ${officerName} thụ lý`,
        }),
      });

      setIsAssignModalOpen(false);
      showToast('Phân công thành công!', `Đã giao hồ sơ ${currentSub.code} cho ${officerName}`, 'success');
      loadSubmissions();
    } catch (error: any) {
      showToast('Lỗi cập nhật', error.message || 'Không thể lưu vào CSDL', 'error');
    }
  };

  // Action: Change Step (Syncs to PostgreSQL DB)
  const handleSetStep = async (stepNumber: number) => {
    if (!currentSub.id) return;
    if (!isAssignedOfficer) {
      showToast('Giới hạn quyền', `Chỉ cán bộ được phân công (${currentSub.assignedOfficer}) mới có quyền chuyển bước`, 'warning');
      return;
    }

    const statusText =
      stepNumber === 1
        ? 'Đã tiếp nhận hồ sơ'
        : stepNumber === 2
        ? 'Đang thẩm định hồ sơ kỹ thuật'
        : stepNumber === 3
        ? 'Đang trình Lãnh đạo phê duyệt'
        : 'Đã hoàn tất thủ tục hành chính';

    try {
      await fetchApi(`/v1/submissions/${currentSub.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentStep: stepNumber,
          statusText,
        }),
      });

      showToast('Cập nhật tiến độ', `Hồ sơ ${currentSub.code} đã chuyển sang Bước ${stepNumber}/4`, 'info');
      loadSubmissions();
    } catch (error: any) {
      showToast('Lỗi cập nhật', error.message || 'Không thể lưu vào CSDL', 'error');
    }
  };

  // Action: Approve & Complete
  const handleApprovePublish = async () => {
    if (!currentSub.id) return;
    if (!isAssignedOfficer) {
      showToast('Giới hạn quyền', `Chỉ cán bộ được phân công mới có quyền phê duyệt`, 'warning');
      return;
    }

    try {
      await fetchApi(`/v1/submissions/${currentSub.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentStep: 4,
          status: 'HOAN_TAT',
          statusText: 'Đã hoàn tất phê duyệt dịch vụ công',
          notes: currentSub.officialResponse || 'Đã kiểm tra hồ sơ và phê duyệt hoàn tất.',
        }),
      });

      showToast('Duyệt thành công!', `Đã hoàn tất phê duyệt hồ sơ dịch vụ công ${currentSub.code}`, 'success');
      loadSubmissions();
    } catch (error: any) {
      showToast('Lỗi phê duyệt', error.message || 'Không thể lưu vào CSDL', 'error');
    }
  };

  // Action: Confirm Rejection with Reason
  const handleConfirmReject = async () => {
    if (!currentSub.id || !rejectionReason.trim()) {
      showToast('Cảnh báo', 'Vui lòng nhập lý do từ chối hồ sơ', 'warning');
      return;
    }

    try {
      const rejectNote = `Từ chối hồ sơ: ${rejectionReason.trim()}`;
      await fetchApi(`/v1/submissions/${currentSub.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'TU_CHOI',
          statusText: rejectNote,
          notes: rejectNote,
        }),
      });

      setIsRejectModalOpen(false);
      setRejectionReason('');
      showToast('Đã từ chối hồ sơ', `Hồ sơ ${currentSub.code} đã chuyển sang trạng thái Từ chối. Nút xóa đơn đã sẵn sàng!`, 'warning');
      loadSubmissions();
    } catch (error: any) {
      showToast('Lỗi từ chối', error.message || 'Không thể từ chối hồ sơ', 'error');
    }
  };

  // Action: Delete Ticket Permanently from DB
  const handleDeleteTicket = async () => {
    if (!currentSub.id) return;
    if (!window.confirm(`XÁC NHẬN XÓA VĨNH VIỄN:\n\nBạn có chắc chắn muốn xóa hồ sơ ${currentSub.code} khỏi CSDL PostgreSQL không?\n\nHành động này sẽ XÓA VĨNH VIỄN và không tự tái tạo lại!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetchApi(`/v1/submissions/${currentSub.id}`, {
        method: 'DELETE',
      });

      showToast('Đã xóa vĩnh viễn', `Hồ sơ ${currentSub.code} đã được xóa sạch khỏi CSDL PostgreSQL`, 'success');
      setSelectedSubId('');
      loadSubmissions();
    } catch (error: any) {
      showToast('Lỗi xóa hồ sơ', error.message || 'Không thể xóa hồ sơ', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Account Switcher Toolbar for Permission Testing */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <User className="w-4 h-4 text-sky-400" />
          <span className="font-bold">Tài khoản đang đăng nhập:</span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-800 font-bold">
            {activeAccount}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 mr-1">Chuyển tài khoản:</span>
          {['Kỹ sư Nguyễn Hoàng Nam', 'Đoàn Anh Khang', 'Lưu Chữ Khang (Super Admin)'].map((acc) => (
            <button
              key={acc}
              type="button"
              onClick={() => setActiveAccount(acc)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeAccount === acc
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {acc.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-sky-400" />
            Quản lý Tiếp nhận Hồ sơ Dịch vụ công Trực tuyến
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý hồ sơ cấp phép môi trường, kiểm định hệ thống xử lý nước thải & thủ tục hành chính Cổng Dịch vụ công MBS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadSubmissions}
            variant="outline"
            size="sm"
            isLoading={isLoading}
            className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới CSDL
          </Button>

          <Badge variant="outline" className="border-sky-800 text-sky-300 bg-sky-950/60 font-mono text-xs px-3 py-1">
            Hồ sơ Dịch vụ công: {submissions.length}
          </Badge>
        </div>
      </div>

      {/* Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Submissions List (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Danh sách Hồ sơ Dịch vụ công ({submissions.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Đang tải danh sách hồ sơ dịch vụ công từ CSDL PostgreSQL...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Chưa có hồ sơ dịch vụ công nào trong CSDL.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const isSelected = sub.id === selectedSubId;
                const isSubRejected = sub.status === 'TU_CHOI' || sub.statusText?.includes('Từ chối');

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative group ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/80 shadow-lg ring-1 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded-lg border border-sky-800">
                        {sub.code}
                      </span>
                      {isSubRejected ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                          🔴 Bị từ chối
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                          Bước {sub.currentStep}/4
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {sub.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Người nộp: <strong className="text-slate-300">{sub.applicant}</strong></span>
                    </p>

                    {isSelected && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Ticket Detail & Action Panel (7 Cols) */}
        {currentSub && currentSub.id ? (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            {/* Header Info */}
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">ĐANG XEM HỒ SƠ DỊCH VỤ CÔNG</div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-black text-sky-400 font-mono tracking-tight">{currentSub.code}</h2>
                <Badge variant={isRejected ? 'danger' : currentSub.currentStep === 4 ? 'success' : 'warning'} size="sm">
                  {currentSub.statusText}
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-white leading-relaxed">{currentSub.title}</h3>
              <p className="text-xs text-slate-400">
                Người nộp: <strong className="text-slate-200">{currentSub.applicant}</strong> — Ngày nộp: <span className="font-mono text-slate-300">{currentSub.createdAt}</span>
              </p>
            </div>

            {/* Permission Alert Banner when not assigned */}
            {!isAssignedOfficer && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-xs text-amber-200 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Quyền hạn hạn chế:</strong> Hồ sơ này hiện được giao cho{' '}
                  <strong className="text-white">{currentSub.assignedOfficer}</strong>. Bạn đang xem dưới tài khoản{' '}
                  <strong className="text-white">{activeAccount}</strong> nên chỉ có quyền xem nội dung.
                </span>
              </div>
            )}

            {/* Step 1 to 4 Progress Updater */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                CẬP NHẬT BƯỚC XỬ LÝ
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { num: 1, label: '1. Tiếp nhận' },
                  { num: 2, label: '2. Thẩm định' },
                  { num: 3, label: '3. Trình duyệt' },
                  { num: 4, label: '4. Hoàn tất' },
                ].map((step) => {
                  const isActive = currentSub.currentStep === step.num && !isRejected;
                  const isPassed = currentSub.currentStep > step.num && !isRejected;
                  return (
                    <button
                      key={step.num}
                      type="button"
                      disabled={!isAssignedOfficer || isRejected}
                      onClick={() => handleSetStep(step.num)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isRejected
                          ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600 border border-slate-800'
                          : isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                          : isPassed
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Officer Assignment Bar */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300 space-y-1">
                <span className="text-slate-500 block">Cán bộ thụ lý (CSDL):</span>
                <strong className="text-white text-sm font-bold block">{currentSub.assignedOfficer}</strong>
                <span className="text-[11px] text-sky-400 block">{currentSub.department}</span>
              </div>

              <Button
                onClick={() => setIsAssignModalOpen(true)}
                variant="outline"
                size="sm"
                className="bg-slate-900 border-slate-700 text-slate-200 hover:text-white gap-2 font-bold cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4 text-sky-400" /> Phân công chuyên viên
              </Button>
            </div>

            {/* Response Textarea & Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">Nội dung Ghi chú / Trả lời Hồ sơ:</label>
                {isAssignedOfficer ? (
                  <span className="text-[10px] text-sky-400 font-bold bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    ✓ Có quyền chỉnh sửa
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    🔒 Chỉ đọc (Chờ phân công)
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                disabled={!isAssignedOfficer || isRejected}
                value={currentSub.officialResponse || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSubmissions((prev) =>
                    prev.map((s) => (s.id === selectedSubId ? { ...s, officialResponse: val } : s))
                  );
                }}
                placeholder={
                  isAssignedOfficer
                    ? 'Nhập nội dung phản hồi hoặc yêu cầu bổ sung hồ sơ...'
                    : 'Chỉ cán bộ được phân công mới có quyền soạn thảo nội dung phản hồi...'
                }
                className={`w-full bg-slate-950 border rounded-xl p-3 text-xs text-white focus:outline-none ${
                  isAssignedOfficer && !isRejected
                    ? 'border-slate-800 focus:border-sky-500'
                    : 'border-slate-850 opacity-60 cursor-not-allowed'
                }`}
              />

              {/* Dynamic Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-850">
                <div className="flex items-center gap-2">
                  {isRejected ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteTicket}
                      isLoading={isDeleting}
                      className="bg-rose-700 hover:bg-rose-600 text-white font-bold gap-1.5 cursor-pointer shadow-md animate-in fade-in"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa đơn vĩnh viễn
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isAssignedOfficer}
                      onClick={() => setIsRejectModalOpen(true)}
                      className="bg-slate-950 border-rose-800 text-rose-300 hover:bg-rose-950 hover:text-rose-200 gap-1.5 font-bold cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" /> Từ chối đơn
                    </Button>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={!isAssignedOfficer || isRejected}
                  onClick={handleApprovePublish}
                  className="bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold gap-1.5 cursor-pointer shadow-lg disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4" /> Hoàn tất Phê duyệt Hồ sơ
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
            Vui lòng chọn một hồ sơ dịch vụ công từ danh sách bên trái.
          </div>
        )}
      </div>

      {/* POPUP MODAL 1: Phân công Cán bộ Thụ lý */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Phân công Cán bộ Thụ lý
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Chọn chuyên viên phụ trách:</span>
                <span className="text-[10px] text-sky-700 font-mono font-bold">Lấy từ CSDL PostgreSQL</span>
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {dbOfficers.map((officer: any) => {
                  const val = `${officer.fullName} (${officer.department || 'Ban Quản lý'})`;
                  return (
                    <option key={officer.id || officer.username} value={val}>
                      {officer.fullName} — {officer.department || officer.role}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssignModalOpen(false)}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAssign}
                className="bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs cursor-pointer"
              >
                Xác nhận phân công
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Từ chối Hồ sơ & Ghi Lý do */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-400" /> Từ chối Hồ sơ & Ghi lý do
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mã hồ sơ: <strong className="text-sky-400 font-mono">{currentSub.code}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Lý do từ chối (Bắt buộc) *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="VD: Hồ sơ thiếu tài liệu thẩm định kỹ thuật, thông tin doanh nghiệp chưa khớp CSDL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
                className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Xác nhận Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
