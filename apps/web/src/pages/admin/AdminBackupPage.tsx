import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  HardDrive,
  Clock,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Lock,
  Search,
  Zap,
} from 'lucide-react';

interface SystemBackupItem {
  id: string;
  filename: string;
  filepath: string;
  fileSize: number;
  triggerType: 'AUTO_UPDATE' | 'SCHEDULED' | 'MANUAL';
  description: string | null;
  checksum: string;
  recordCount: number;
  status: string;
  createdById: string | null;
  createdAt: string;
}

interface BackupStats {
  totalCount: number;
  totalSizeBytes: number;
  totalSizeMb: string;
  lastBackupAt: string | null;
  autoBackupEnabled: boolean;
}

export const AdminBackupPage: React.FC = () => {
  const [backups, setBackups] = useState<SystemBackupItem[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<SystemBackupItem | null>(null);
  const [confirmText, setConfirmText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/backups');
      const json = await res.json();
      if (json.data) {
        setBackups(json.data.backups || []);
        setStats(json.data.stats || null);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách sao lưu:', err);
      showToast('error', 'Không thể kết nối tới máy chủ backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/v1/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: 'MANUAL',
          description: 'Tạo bản sao lưu snapshot thủ công từ Dashboard',
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast('success', `Đã tạo thành công bản sao lưu ${json.data.filename}`);
        fetchBackups();
      } else {
        showToast('error', json.detail || 'Lỗi khi tạo bản sao lưu');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối máy chủ');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupForRestore) return;
    if (confirmText.trim().toUpperCase() !== 'RESTORE') {
      showToast('error', 'Vui lòng gõ chữ RESTORE để xác nhận phục hồi.');
      return;
    }

    setRestoringId(selectedBackupForRestore.id);
    try {
      const res = await fetch(`/api/v1/backups/restore/${selectedBackupForRestore.id}`, {
        method: 'POST',
      });

      const json = await res.json();
      if (res.ok) {
        showToast('success', `Đã phục hồi thành công CSDL về bản sao lưu ${selectedBackupForRestore.filename}`);
        setSelectedBackupForRestore(null);
        setConfirmText('');
        fetchBackups();
      } else {
        showToast('error', json.detail || 'Lỗi khi phục hồi dữ liệu');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối máy chủ khi phục hồi');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản sao lưu "${filename}" khỏi hệ thống?`)) return;

    try {
      const res = await fetch(`/api/v1/backups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', `Đã xóa bản sao lưu ${filename}`);
        fetchBackups();
      } else {
        const json = await res.json();
        showToast('error', json.detail || 'Không thể xóa bản sao lưu');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối máy chủ');
    }
  };

  const handleDownload = (id: string) => {
    window.open(`/api/v1/backups/download/${id}`, '_blank');
  };

  const filteredBackups = backups.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'ALL' || item.triggerType === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/50 backdrop-blur-md'
              : 'bg-rose-950/90 text-rose-200 border-rose-700/50 backdrop-blur-md'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Sao lưu & Phục hồi Dữ liệu Hệ thống</h1>
          </div>
          <p className="text-sm text-slate-400">
            Hệ thống quản lý bản snapshot CSDL PostgreSQL tự động trước cập nhật & 1-Click Phục hồi (Tiêu chuẩn QĐ 05/2024/QĐ-UBND)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium shadow-lg shadow-teal-900/20 border border-teal-500/30 transition-all disabled:opacity-50"
          >
            {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Tạo Bản Sao Lưu Ngay</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng bản sao lưu</span>
            <FileCode className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats?.totalCount || 0} <span className="text-xs font-normal text-slate-400">bản snapshot</span></div>
          <p className="text-xs text-slate-500 mt-1">Giới hạn tối đa 30 bản xoay vòng</p>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dung lượng sử dụng</span>
            <HardDrive className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats?.totalSizeMb || '0.00'} <span className="text-xs font-normal text-slate-400">MB</span></div>
          <p className="text-xs text-slate-500 mt-1">Nén dữ liệu JSON + SHA-256</p>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tự động khi cập nhật</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-lg font-bold text-emerald-400">Đang kích hoạt</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Snapshot tự động trước mọi cập nhật</p>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lần sao lưu gần nhất</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate">
            {stats?.lastBackupAt ? new Date(stats.lastBackupAt).toLocaleString('vi-VN') : 'Chưa có'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Trạng thái: Hoàn hảo (100% Verified)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên file hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Loại sao lưu:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="ALL">Tất cả loại hình</option>
            <option value="AUTO_UPDATE">AUTO_UPDATE (Khi Cập nhật)</option>
            <option value="MANUAL">MANUAL (Thủ công)</option>
            <option value="SCHEDULED">SCHEDULED (Định kỳ)</option>
          </select>
        </div>
      </div>

      {/* Backups Data Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tệp Sao Lưu & Lý Do</th>
                <th className="px-4 py-4">Loại Hình</th>
                <th className="px-4 py-4">Dung Lượng / Bản Ghi</th>
                <th className="px-4 py-4">Mã Checksum (SHA-256)</th>
                <th className="px-4 py-4">Thời Gian Tạo</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                    <span>Đang tải danh sách sao lưu hệ thống...</span>
                  </td>
                </tr>
              ) : filteredBackups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Chưa tìm thấy bản sao lưu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBackups.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-slate-200 text-xs flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span className="truncate max-w-xs" title={item.filename}>{item.filename}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5 italic">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.triggerType === 'AUTO_UPDATE' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ⚡ AUTO_UPDATE
                        </span>
                      )}
                      {item.triggerType === 'MANUAL' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          🖐️ MANUAL
                        </span>
                      )}
                      {item.triggerType === 'SCHEDULED' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          🕒 SCHEDULED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs">
                      <div className="font-medium text-slate-200">{formatFileSize(item.fileSize)}</div>
                      <div className="text-slate-500">{item.recordCount.toLocaleString()} bản ghi</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800" title={item.checksum}>
                        {item.checksum.substring(0, 14)}...
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 transition-colors"
                          title="Tải tệp JSON"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedBackupForRestore(item)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                          title="Phục hồi CSDL về mốc này"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.filename)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Xóa bản sao lưu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Modal */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Xác nhận Phục hồi CSDL</h3>
                <p className="text-xs text-rose-400 font-medium">Cảnh báo: Hành động này không thể hoàn tất nếu có sự cố!</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tệp Sao Lưu:</span>
                <span className="font-mono text-slate-200 font-bold">{selectedBackupForRestore.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian tạo:</span>
                <span className="text-slate-200">{new Date(selectedBackupForRestore.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số bản ghi khôi phục:</span>
                <span className="text-teal-400 font-bold">{selectedBackupForRestore.recordCount.toLocaleString()} bản ghi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mã SHA-256 Checksum:</span>
                <span className="font-mono text-slate-400 text-[10px]">{selectedBackupForRestore.checksum}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Toàn bộ dữ liệu hiện tại trong CSDL sẽ được khôi phục về trạng thái snapshot này. Nhập từ khóa <span className="font-bold text-rose-400">RESTORE</span> bên dưới để xác nhận:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập chữ RESTORE để xác nhận"
              className="w-full px-4 py-2.5 bg-slate-950 border border-rose-500/40 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedBackupForRestore(null);
                  setConfirmText('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleRestore}
                disabled={confirmText.trim().toUpperCase() !== 'RESTORE' || restoringId !== null}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-900/30 transition-all disabled:opacity-40"
              >
                {restoringId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>Phục Hồi Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
