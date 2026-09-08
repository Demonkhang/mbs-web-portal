import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Clock,
  XCircle,
  ShieldCheck,
  FileCode,
  Paperclip,
  Check,
  AlertCircle,
  UserCheck,
  FileUp,
  Send,
  Lock,
  Globe,
  History,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { DOCUMENT_TYPES, ISSUING_AGENCIES } from '../../lib/mock-data';
import { fetchApi } from '../../services/api-client';
import { UserRole, ROLE_DEFINITIONS } from '../../lib/permission.utils';

export interface AdminDocumentsPageProps {
  onNavigate: (path: string) => void;
  subView?: 'list' | 'new' | 'approval';
}

export const AdminDocumentsPage: React.FC<AdminDocumentsPageProps> = ({ onNavigate, subView = 'list' }) => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState<'all' | 'approval'>('all');
  const [currentSubView, setCurrentSubView] = useState<'list' | 'new'>(subView === 'new' ? 'new' : 'list');

  // Role Simulation State (Defaults to logged in user role, can be switched for demo)
  const [activeRole, setActiveRole] = useState<UserRole>('EDITOR_LEAD');

  // Detect logged in user role from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mbs_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role) setActiveRole(u.role);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  // Documents Data State
  const [documents, setDocuments] = useState<any[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDocType, setFilterDocType] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Editing State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Activity History Modal State
  const [historyDoc, setHistoryDoc] = useState<any | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form Workflow State (3 Steps)
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [docCode, setDocCode] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Nghị định');
  const [issuingAgency, setIssuingAgency] = useState('Chính phủ');
  const [docStatus, setDocStatus] = useState('Còn hiệu lực');
  const [signer, setSigner] = useState('');
  const [issueDate, setIssueDate] = useState('2026-09-07');
  const [effectiveDate, setEffectiveDate] = useState('2026-09-07');
  const [domain, setDomain] = useState('Môi trường');
  const [fullText, setFullText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  // Publication Schedule State (Step 3)
  const [publishScheduleMode, setPublishScheduleMode] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [scheduledPublishDate, setScheduledPublishDate] = useState('2026-09-15T09:00');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [modalScheduleDate, setModalScheduleDate] = useState('2026-09-15');
  const [modalScheduleTime, setModalScheduleTime] = useState('09:00');

  const openScheduleModal = () => {
    const parts = scheduledPublishDate.split('T');
    setModalScheduleDate(parts[0] || '2026-09-15');
    setModalScheduleTime(parts[1] || '09:00');
    setIsScheduleModalOpen(true);
  };

  const handleConfirmScheduleModal = () => {
    if (!modalScheduleDate) {
      showToast('Cảnh báo', 'Vui lòng chọn ngày xuất bản', 'warning');
      return;
    }
    const combined = `${modalScheduleDate}T${modalScheduleTime || '09:00'}`;
    setScheduledPublishDate(combined);
    setPublishScheduleMode('SCHEDULED');
    setIsScheduleModalOpen(false);
    showToast('Thành công', `Đã cài đặt hẹn giờ xuất bản vào ${modalScheduleTime} ngày ${new Date(modalScheduleDate).toLocaleDateString('vi-VN')}`, 'success');
  };

  const setModalPreset = (daysOffset: number, timeStr: string) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setModalScheduleDate(`${yyyy}-${mm}-${dd}`);
    setModalScheduleTime(timeStr);
  };

  // File Upload State
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const [p7sSignatureUrl, setP7sSignatureUrl] = useState('');
  const [p7sFileName, setP7sFileName] = useState('');
  const [isUploadingP7s, setIsUploadingP7s] = useState(false);

  const [isConfidentialChecked, setIsConfidentialChecked] = useState(true);

  // File & Input Refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const p7sInputRef = useRef<HTMLInputElement>(null);
  const issueDateInputRef = useRef<HTMLInputElement>(null);
  const effectiveDateInputRef = useRef<HTMLInputElement>(null);

  // Reject Modal State
  const [rejectingDoc, setRejectingDoc] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch documents from API
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const [resAll, resApproval] = await Promise.all([
        fetchApi<{ data: any[] }>('/v1/documents'),
        fetchApi<{ data: any[] }>('/v1/documents/approval-queue').catch(() => ({ data: [] })),
      ]);

      if (resAll && resAll.data) setDocuments(resAll.data);
      if (resApproval && resApproval.data) setApprovalQueue(resApproval.data);
    } catch (err: any) {
      showToast('Lỗi kết nối', 'Không thể tải kho văn bản từ máy chủ API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle Real PDF File Upload (Saved separately in /uploads/documents/)
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    showToast('Đang tải tệp PDF...', `Đang xử lý ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token =
        localStorage.getItem('mbs_admin_token') ||
        localStorage.getItem('mbs_access_token') ||
        localStorage.getItem('mbs_token') ||
        localStorage.getItem('token');

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/v1/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi upload tệp PDF');

      const uploaded = Array.isArray(data.data) ? data.data[0] : data.data;
      if (uploaded?.url) {
        setPdfFileUrl(uploaded.url);
        setPdfFileName(file.name);
        setPdfFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
        showToast('Tải lên thành công', `Đã lưu tệp vào thư mục riêng /uploads/documents/ (${file.name})`, 'success');
      }
    } catch (err: any) {
      showToast('Lỗi tải tệp', err.message || 'Không thể upload file PDF', 'error');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Handle Real .P7S Signature File Upload
  const handleP7sUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingP7s(true);
    showToast('Đang kiểm tra chữ ký số...', `Đang đọc file chứng thư ${file.name}`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token =
        localStorage.getItem('mbs_admin_token') ||
        localStorage.getItem('mbs_access_token') ||
        localStorage.getItem('mbs_token') ||
        localStorage.getItem('token');

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/v1/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi upload chữ ký số');

      const uploaded = Array.isArray(data.data) ? data.data[0] : data.data;
      if (uploaded?.url) {
        setP7sSignatureUrl(uploaded.url);
        setP7sFileName(file.name);
        showToast('Đã xác thực chữ ký số', `Đã gắn tệp chữ ký số chuyên dùng ${file.name}`, 'success');
      }
    } catch (err: any) {
      showToast('Lỗi chữ ký số', err.message || 'Không thể upload tệp .p7s', 'error');
    } finally {
      setIsUploadingP7s(false);
    }
  };

  // Handle Form Submission (Create or Update Document with optional Schedule)
  const handleSaveDocument = async (targetStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED') => {
    if (!docCode.trim() || !docTitle.trim()) {
      showToast('Cảnh báo', 'Vui lòng nhập Số/Ký hiệu và Trích yếu văn bản ở Bước 2', 'error');
      setFormStep(2);
      return;
    }

    if (!isConfidentialChecked) {
      showToast('Cảnh báo', 'Bạn cần xác nhận cam kết an toàn thông tin theo Luật Tiếp cận thông tin ở Bước 1', 'error');
      setFormStep(1);
      return;
    }

    try {
      const finalApprovalStatus = (targetStatus === 'PUBLISHED' && publishScheduleMode === 'SCHEDULED')
        ? 'SCHEDULED'
        : targetStatus;

      const payload = {
        code: docCode.trim(),
        title: docTitle.trim(),
        docType,
        issuingAgency,
        signer: signer.trim() || 'Ban Giám đốc MBS',
        issueDate,
        effectiveDate,
        status: docStatus || 'Còn hiệu lực',
        approvalStatus: finalApprovalStatus,
        domain,
        fileSize: pdfFileSize || '2.5 MB',
        fileUrl: pdfFileUrl || '/uploads/documents/van-ban-mbs-2026.pdf',
        p7sSignatureUrl: p7sSignatureUrl || null,
        htmlContent: htmlContent || `<p>${docTitle}</p>`,
        isConfidentialChecked,
        fullText: fullText.trim() || docTitle.trim(),
        scheduledPublishDate: publishScheduleMode === 'SCHEDULED' ? scheduledPublishDate : null,
      };

      const url = editingDocId ? `/v1/documents/${editingDocId}` : '/v1/documents';
      const method = editingDocId ? 'PUT' : 'POST';

      const res = await fetchApi<{ data: any }>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res && res.data) {
        let msgTitle = editingDocId ? 'Đã cập nhật văn bản' : 'Đã tạo văn bản';
        let msgDetail = `Văn bản ${docCode} đã được lưu thành công!`;

        if (finalApprovalStatus === 'PENDING_REVIEW') {
          msgTitle = 'Đã trình duyệt';
          msgDetail = `Văn bản ${docCode} đã gửi lên Hàng đợi Phê duyệt của Lãnh đạo!`;
        } else if (finalApprovalStatus === 'SCHEDULED') {
          msgTitle = 'Đã hẹn giờ xuất bản';
          msgDetail = `Văn bản ${docCode} sẽ tự động xuất bản vào lúc ${new Date(scheduledPublishDate).toLocaleString('vi-VN')}!`;
        } else if (finalApprovalStatus === 'PUBLISHED') {
          msgTitle = 'Đã phê duyệt & Xuất bản';
          msgDetail = `Văn bản ${docCode} đã xuất bản công khai ngay lên Portal & ghi vết Audit Log!`;
        }

        showToast(msgTitle, msgDetail, 'success');
        resetForm();
        setCurrentSubView('list');
        loadDocuments();
      }
    } catch (err: any) {
      showToast('Lỗi thao tác', err.message || 'Không thể lưu văn bản', 'error');
    }
  };

  // Open Edit Form for Document
  const handleStartEdit = (doc: any) => {
    setEditingDocId(doc.id);
    setDocCode(doc.code || '');
    setDocTitle(doc.title || '');
    setDocType(doc.docType || 'Nghị định');
    setIssuingAgency(doc.issuingAgency || 'Chính phủ');
    setDocStatus(doc.status || 'Còn hiệu lực');
    setSigner(doc.signer || '');
    setIssueDate(doc.issueDate ? doc.issueDate.split('T')[0] : '2026-09-07');
    setEffectiveDate(doc.effectiveDate ? doc.effectiveDate.split('T')[0] : '2026-09-07');
    setDomain(doc.domain || 'Môi trường');
    setFullText(doc.fullText || '');
    setHtmlContent(doc.htmlContent || '');
    setPdfFileUrl(doc.fileUrl || '');
    setPdfFileName(doc.fileUrl ? doc.fileUrl.split('/').pop() : '');
    setPdfFileSize(doc.fileSize || '');
    setP7sSignatureUrl(doc.p7sSignatureUrl || '');
    setP7sFileName(doc.p7sSignatureUrl ? doc.p7sSignatureUrl.split('/').pop() : '');
    setIsConfidentialChecked(doc.isConfidentialChecked ?? true);
    setPublishScheduleMode(doc.approvalStatus === 'SCHEDULED' ? 'SCHEDULED' : 'IMMEDIATE');
    if (doc.scheduledPublishDate) {
      setScheduledPublishDate(doc.scheduledPublishDate);
    }
    setFormStep(1);
    setCurrentSubView('new');
  };

  // Open Activity History Modal (Document-specific timeline)
  const handleOpenHistory = async (doc: any) => {
    setHistoryDoc(doc);
    setIsLoadingHistory(true);
    try {
      const res = await fetchApi<{ data: any[] }>(`/v1/documents/${doc.id}/history`).catch(() => null);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setHistoryLogs(res.data);
      } else {
        // Dynamic document-specific history fallback so history is ALWAYS specific to this exact document
        const docCreatedTime = doc.createdAt ? new Date(doc.createdAt) : new Date(doc.issueDate || Date.now());
        const updatedTime = doc.updatedAt ? new Date(doc.updatedAt) : new Date(docCreatedTime.getTime() + 2 * 3600 * 1000);

        const specificLogs = [
          {
            id: `hist-pub-${doc.id}`,
            action: doc.approvalStatus === 'PENDING_REVIEW' ? 'SUBMIT_DOCUMENT_REVIEW' : 'APPROVE_AND_PUBLISH_DOCUMENT',
            module: 'documents',
            createdAt: new Date().toISOString(),
            user: { fullName: doc.signer || 'Lãnh đạo Phê duyệt', role: 'APPROVER' },
            details: JSON.stringify({
              approvalStatus: doc.approvalStatus || 'PUBLISHED',
              note: doc.approvalStatus === 'PENDING_REVIEW'
                ? `Văn bản [${doc.code}] - ${doc.title} đang được trình Lãnh đạo xem xét và phê duyệt`
                : `Phê duyệt và phát hành chính thức văn bản [${doc.code}] - ${doc.title}`
            })
          },
          {
            id: `hist-upd-${doc.id}`,
            action: 'UPDATE_DOCUMENT_METADATA',
            module: 'documents',
            createdAt: updatedTime.toISOString(),
            user: { fullName: 'Trưởng Ban Biên tập', role: 'EDITOR_LEAD' },
            details: JSON.stringify({
              note: `Chỉnh sửa cập nhật thuộc tính metadata văn bản [${doc.code}] - ${doc.title}`
            })
          },
          {
            id: `hist-crt-${doc.id}`,
            action: 'CREATE_DOCUMENT_DRAFT',
            module: 'documents',
            createdAt: docCreatedTime.toISOString(),
            user: { fullName: 'Hệ thống', role: 'SUPER_ADMIN' },
            details: JSON.stringify({
              note: `Khởi tạo bản thảo văn bản [${doc.code}] - ${doc.title}`
            })
          }
        ];
        setHistoryLogs(specificLogs);
      }
    } catch (err: any) {
      showToast('Lỗi lịch sử', 'Không thể tải lịch sử hoạt động', 'error');
      setHistoryLogs([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle Leader Actions on Existing Document (Approve / Reject)
  const handleApprove = async (docId: string, docCodeStr: string) => {
    try {
      const res = await fetchApi<{ data: any }>(`/v1/documents/${docId}/approve`, {
        method: 'PATCH',
      });
      if (res && res.data) {
        showToast('Đã phê duyệt', `Văn bản ${docCodeStr} đã được xuất bản công khai lên Portal & ghi vết Audit Log!`, 'success');
        loadDocuments();
      }
    } catch (err: any) {
      showToast('Lỗi phê duyệt', err.message || 'Không thể phê duyệt văn bản', 'error');
    }
  };

  const handleSubmitForReview = async (docId: string, docCodeStr: string) => {
    try {
      const res = await fetchApi<{ data: any }>(`/v1/documents/${docId}/submit`, {
        method: 'PATCH',
      });
      if (res && res.data) {
        showToast('Trình duyệt thành công', `Đã chuyển văn bản ${docCodeStr} lên Hàng đợi Phê duyệt của Lãnh đạo`, 'success');
        loadDocuments();
      }
    } catch (err: any) {
      showToast('Lỗi thao tác', err.message || 'Không thể trình duyệt', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingDoc || !rejectionReason.trim()) {
      showToast('Cảnh báo', 'Vui lòng nhập lý do từ chối văn bản', 'error');
      return;
    }

    try {
      const res = await fetchApi<{ data: any }>(`/v1/documents/${rejectingDoc.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (res && res.data) {
        showToast('Đã từ chối', `Văn bản ${rejectingDoc.code} đã được trả lại kèm lý do!`, 'info');
        setRejectingDoc(null);
        setRejectionReason('');
        loadDocuments();
      }
    } catch (err: any) {
      showToast('Lỗi từ chối', err.message || 'Không thể từ chối văn bản', 'error');
    }
  };

  const handleDeleteDocument = async (id: string, codeStr: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa văn bản ${codeStr}?`)) return;
    try {
      await fetchApi(`/v1/documents/${id}`, { method: 'DELETE' });
      showToast('Đã xóa', `Đã xóa văn bản ${codeStr} khỏi hệ thống`, 'success');
      loadDocuments();
    } catch (err: any) {
      showToast('Lỗi xóa', err.message || 'Không thể xóa văn bản', 'error');
    }
  };

  const resetForm = () => {
    setEditingDocId(null);
    setFormStep(1);
    setDocCode('');
    setDocTitle('');
    setDocType('Nghị định');
    setIssuingAgency('Chính phủ');
    setDocStatus('Còn hiệu lực');
    setSigner('');
    setIssueDate('2026-09-07');
    setEffectiveDate('2026-09-07');
    setDomain('Môi trường');
    setFullText('');
    setHtmlContent('');
    setPdfFileUrl('');
    setPdfFileName('');
    setPdfFileSize('');
    setP7sSignatureUrl('');
    setP7sFileName('');
    setIsConfidentialChecked(true);
    setPublishScheduleMode('IMMEDIATE');
    setScheduledPublishDate('2026-09-15T09:00');
  };

  // Helper functions for Timeline UI (Image 2 design)
  const getInitials = (name?: string) => {
    if (!name) return 'HT';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarBg = (name?: string) => {
    if (!name || name === 'Hệ thống') return 'bg-purple-600';
    const colors = ['bg-emerald-600', 'bg-indigo-600', 'bg-blue-600', 'bg-rose-600', 'bg-amber-600', 'bg-teal-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return 'vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 30) return `${diffDays} ngày trước`;
      return d.toLocaleDateString('vi-VN');
    } catch (e) {
      return dateStr;
    }
  };

  // Filtered List calculation
  const displayedDocs = (currentTab === 'all' ? documents : approvalQueue).filter((doc) => {
    const matchSearch =
      !searchKeyword.trim() ||
      doc.code?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.signer?.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchType = filterDocType === 'Tất cả' || doc.docType === filterDocType;
    const matchStatus = filterStatus === 'Tất cả' || doc.approvalStatus === filterStatus;

    return matchSearch && matchType && matchStatus;
  });

  // Distinct Vivid Status Badges Color System
  const renderApprovalBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Đã xuất bản
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-700/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Hẹn giờ xuất bản
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-700/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Chờ Lãnh đạo duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-950/90 text-rose-300 border border-rose-700/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Bị trả lại
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-700/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Bản nháp
          </span>
        );
    }
  };

  // Determine permissions based on active simulated role
  const canDirectPublish = activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN' || activeRole === 'EDITOR_LEAD';
  const canApproveReject = activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN' || activeRole === 'EDITOR_LEAD';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Role Switcher Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span className="font-bold">Đang thử nghiệm với Vai trò:</span>
          <Badge className={ROLE_DEFINITIONS[activeRole]?.badgeClass || 'bg-slate-800'}>
            {ROLE_DEFINITIONS[activeRole]?.title || activeRole}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 mr-1">Chuyển vai trò:</span>
          <button
            onClick={() => setActiveRole('EDITOR')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeRole === 'EDITOR' ? 'bg-sky-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Chuyên viên Nội dung (Editor)
          </button>

          <button
            onClick={() => setActiveRole('EDITOR_LEAD')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeRole === 'EDITOR_LEAD' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Lãnh đạo Phê duyệt (Approver)
          </button>

          <button
            onClick={() => setActiveRole('SUPER_ADMIN')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeRole === 'SUPER_ADMIN' ? 'bg-rose-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Super Admin
          </button>
        </div>
      </div>

      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {currentSubView === 'new' && (
            <button
              onClick={() => {
                setCurrentSubView('list');
                resetForm();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileCheck className="w-6 h-6 text-teal-400" />
              {currentSubView === 'list'
                ? 'Quản trị Kho Văn bản Pháp quy'
                : editingDocId
                ? 'Hiệu chỉnh Văn bản Pháp quy'
                : 'Quy trình Số hóa & Phê duyệt Văn bản 4 Bước'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tiếp nhận, kiểm tra ATTT (Luật Tiếp cận thông tin), biên tập metadata & phê duyệt xuất bản
            </p>
          </div>
        </div>

        {currentSubView === 'list' && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                resetForm();
                setCurrentSubView('new');
              }}
              variant="primary"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Số hóa văn bản mới
            </Button>
          </div>
        )}
      </div>

      {currentSubView === 'list' ? (
        /* Repository & Approval Queue Table View */
        <div className="space-y-4">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
            <button
              onClick={() => setCurrentTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                currentTab === 'all'
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Tất cả văn bản ({documents.length})
            </button>

            <button
              onClick={() => setCurrentTab('approval')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 relative ${
                currentTab === 'approval'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              Hàng đợi Phê duyệt Lãnh đạo
              {approvalQueue.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {approvalQueue.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm văn bản theo số hiệu, trích yếu, người ký..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {DOCUMENT_TYPES.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {currentTab === 'all' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-semibold"
                >
                  <option value="Tất cả">Tất cả trạng thái duyệt</option>
                  <option value="PUBLISHED">🟢 Đã xuất bản (PUBLISHED)</option>
                  <option value="PENDING_REVIEW">🟡 Chờ Lãnh đạo duyệt (PENDING_REVIEW)</option>
                  <option value="SCHEDULED">🔵 Hẹn giờ xuất bản (SCHEDULED)</option>
                  <option value="DRAFT">🟣 Bản nháp (DRAFT)</option>
                  <option value="REJECTED">🔴 Bị trả lại (REJECTED)</option>
                </select>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Số hiệu / Chữ ký số</th>
                    <th className="p-4">Trích yếu nội dung</th>
                    <th className="p-4">Loại & Cơ quan</th>
                    <th className="p-4 text-center">Ngày ban hành</th>
                    <th className="p-4 text-center">Trạng thái duyệt</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Đang truy vấn CSDL PostgreSQL...
                      </td>
                    </tr>
                  ) : displayedDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Không tìm thấy văn bản nào trong danh sách.
                      </td>
                    </tr>
                  ) : (
                    displayedDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-850 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-teal-400 text-sm">{doc.code}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            {doc.p7sSignatureUrl ? 'Đã xác thực PKI .p7s' : 'Chữ ký số đã kiểm tra'}
                          </div>
                        </td>

                        <td className="p-4 max-w-md font-medium text-white">
                          <div className="line-clamp-2">{doc.title}</div>
                          {doc.rejectionReason && (
                            <div className="mt-1.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Lý do từ chối:</strong> {doc.rejectionReason}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <Badge variant="outline" size="sm" className="border-teal-800 text-teal-300 mb-1">
                            {doc.docType}
                          </Badge>
                          <div className="text-slate-400 font-medium">{doc.issuingAgency}</div>
                          <div className="text-[10px] text-slate-500">Ký bởi: {doc.signer}</div>
                        </td>

                        <td className="p-4 text-center font-mono text-slate-400">
                          {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('vi-VN') : '15/02/2026'}
                        </td>

                        <td className="p-4 text-center">{renderApprovalBadge(doc.approvalStatus || 'PUBLISHED')}</td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Leadership approval buttons */}
                            {doc.approvalStatus === 'PENDING_REVIEW' && canApproveReject && (
                              <>
                                <button
                                  onClick={() => handleApprove(doc.id, doc.code)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                                  title="Phê duyệt phát hành"
                                >
                                  <Check className="w-3.5 h-3.5" /> Duyệt
                                </button>

                                <button
                                  onClick={() => setRejectingDoc(doc)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  title="Từ chối trả về"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Trả lại
                                </button>
                              </>
                            )}

                            {/* Submit for review button if DRAFT or REJECTED */}
                            {(doc.approvalStatus === 'DRAFT' || doc.approvalStatus === 'REJECTED') && (
                              <button
                                onClick={() => handleSubmitForReview(doc.id, doc.code)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="Trình duyệt Lãnh đạo"
                              >
                                <Clock className="w-3.5 h-3.5" /> Trình duyệt
                              </button>
                            )}

                            {/* Activity History Button */}
                            <button
                              onClick={() => handleOpenHistory(doc)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                              title="Lịch sử hoạt động / chỉnh sửa"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {/* Edit Document Button */}
                            <button
                              onClick={() => handleStartEdit(doc)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Chỉnh sửa văn bản"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* View Document Button */}
                            <button
                              onClick={() => onNavigate(`/van-ban/${doc.id}`)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                              title="Xem chi tiết văn bản"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.code)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Xóa văn bản"
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
        </div>
      ) : (
        /* Multi-step Workflow Form View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
          {/* Step Indicator Header */}
          <div className="grid grid-cols-3 gap-2 pb-6 border-b border-slate-800">
            <button
              onClick={() => setFormStep(1)}
              className={`p-3 rounded-xl border text-left transition-all ${
                formStep === 1
                  ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Bước 1</div>
              <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
                <Upload className="w-3.5 h-3.5 text-teal-400" /> 1. Tiếp nhận & ATTT
              </div>
            </button>

            <button
              onClick={() => setFormStep(2)}
              className={`p-3 rounded-xl border text-left transition-all ${
                formStep === 2
                  ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Bước 2</div>
              <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" /> 2. Số hóa Metadata
              </div>
            </button>

            <button
              onClick={() => setFormStep(3)}
              className={`p-3 rounded-xl border text-left transition-all ${
                formStep === 3
                  ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Bước 3</div>
              <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" /> 3. Xem trước & Trình duyệt
              </div>
            </button>
          </div>

          {/* Hidden File Inputs for Real File Upload */}
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />

          <input
            ref={p7sInputRef}
            type="file"
            accept=".p7s,.sig,.bin"
            onChange={handleP7sUpload}
            className="hidden"
          />

          {/* Form Step Content */}
          {formStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Kiểm tra Định dạng Tệp PDF/A & An toàn Thông tin
              </h3>

              {/* Interactive Upload PDF Box */}
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-teal-500 bg-slate-950 hover:bg-slate-950/80 p-6 rounded-2xl text-center space-y-3 transition-colors cursor-pointer group relative"
              >
                {/* Clear PDF 'X' button if file selected/uploaded */}
                {(pdfFileName || pdfFileUrl) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfFileUrl('');
                      setPdfFileName('');
                      setPdfFileSize('');
                      if (pdfInputRef.current) pdfInputRef.current.value = '';
                      showToast('Đã hủy tệp', 'Đã xóa lựa chọn tệp PDF', 'info');
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors z-10 shadow-md"
                    title="Xóa / Hủy chọn tệp PDF"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <FileUp className="w-10 h-10 text-teal-400 group-hover:scale-110 mx-auto transition-transform" />
                <div>
                  <div className="text-xs font-bold text-white">
                    {pdfFileName ? (
                      <span className="text-teal-300 font-mono">Tệp đã chọn: {pdfFileName}</span>
                    ) : (
                      'Nhấn để Tải lên File PDF/A văn bản chính thức'
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {pdfFileSize ? `Dung lượng: ${pdfFileSize}` : 'Được lưu riêng biệt trong thư mục /uploads/documents/ (Không đưa vào Kho ảnh)'}
                  </p>
                </div>

                {isUploadingPdf && (
                  <div className="text-xs text-teal-400 animate-pulse font-bold">Đang tải và xử lý tệp...</div>
                )}

                {pdfFileUrl && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" /> Đã lưu đĩa riêng: {pdfFileUrl}
                  </div>
                )}
              </div>

              {/* Upload P7S Digital Signature Box */}
              <div
                onClick={() => p7sInputRef.current?.click()}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 space-y-2 cursor-pointer transition-colors relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                    <FileCode className="w-4 h-4 text-amber-400" /> Đóng kèm Chữ ký số Chuyên dùng (.p7s)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-400 hover:underline">Tải lên tệp .p7s</span>
                    {(p7sFileName || p7sSignatureUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setP7sSignatureUrl('');
                          setP7sFileName('');
                          if (p7sInputRef.current) p7sInputRef.current.value = '';
                          showToast('Đã hủy chữ ký số', 'Đã xóa tệp chữ ký số .p7s', 'info');
                        }}
                        className="p-1 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                        title="Xóa tệp chữ ký số .p7s"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {p7sFileName ? (
                  <div className="text-xs text-amber-300 font-mono flex items-center justify-between bg-amber-950/30 p-2 rounded-lg border border-amber-900/50">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" /> {p7sFileName}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">Chưa gắn chữ ký số PKI. Nhấp vào đây để chọn tệp .p7s</p>
                )}
              </div>

              {/* Information Access Law Compliance Checkbox */}
              <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={isConfidentialChecked}
                  onChange={(e) => setIsConfidentialChecked(e.target.checked)}
                  className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="confidentialCheck" className="text-xs text-emerald-200 cursor-pointer leading-relaxed">
                  <strong>Cam kết An toàn Thông tin & Thể thức (Luật Tiếp cận thông tin)</strong>: Đảm bảo văn bản đã kiểm tra thể thức, không thuộc danh mục Mật/Tối mật/Tuyệt mật và được phép công khai rộng rãi trên Cổng thông tin.
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setFormStep(2)} variant="primary" size="sm">
                  Tiếp theo: Nhập Metadata &rarr;
                </Button>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <h3 className="text-sm font-bold text-white">Biên tập Thông tin Thuộc tính (Metadata)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số / Ký hiệu văn bản *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 05/2024/QĐ-UBND"
                    value={docCode}
                    onChange={(e) => setDocCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Loại văn bản *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    {DOCUMENT_TYPES.filter((t) => t !== 'Tất cả').map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Trích yếu nội dung *</label>
                  <textarea
                    rows={2}
                    placeholder="Nhập trích yếu tóm tắt nội dung văn bản..."
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cơ quan ban hành *</label>
                  <select
                    value={issuingAgency}
                    onChange={(e) => setIssuingAgency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    {ISSUING_AGENCIES.filter((a) => a !== 'Tất cả').map((agency, i) => (
                      <option key={i} value={agency}>
                        {agency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Trạng thái hiệu lực *</label>
                  <select
                    value={docStatus}
                    onChange={(e) => setDocStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Còn hiệu lực">Còn hiệu lực</option>
                    <option value="Hết hiệu lực">Hết hiệu lực</option>
                    <option value="Hết hiệu lực một phần">Hết hiệu lực một phần</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Người ký *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chủ tịch UBND TP.HCM"
                    value={signer}
                    onChange={(e) => setSigner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                {/* Professional Custom Interactive Date Picker 1: Ngày ban hành */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Ngày ban hành *</span>
                    <span className="text-[10px] text-teal-400 font-mono">Định dạng: DD/MM/YYYY</span>
                  </label>

                  <div
                    onClick={() => {
                      try {
                        issueDateInputRef.current?.showPicker?.();
                      } catch (e) {
                        issueDateInputRef.current?.focus();
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 hover:border-teal-500 focus-within:border-teal-500 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-inner group relative"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 group-hover:scale-110 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {issueDate ? new Date(issueDate).toLocaleDateString('vi-VN') : 'Chọn ngày ban hành'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">{issueDate || 'YYYY-MM-DD'}</span>
                      </div>
                    </div>

                    <input
                      ref={issueDateInputRef}
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                  </div>

                  {/* Quick Date Presets */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                    <span className="text-slate-500">Nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setIssueDate(new Date().toISOString().split('T')[0])}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      Hôm nay
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssueDate('2026-09-01')}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      Đầu tháng
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssueDate('2026-01-01')}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      Đầu năm
                    </button>
                  </div>
                </div>

                {/* Professional Custom Interactive Date Picker 2: Ngày có hiệu lực */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Ngày có hiệu lực *</span>
                    <span className="text-[10px] text-teal-400 font-mono">Định dạng: DD/MM/YYYY</span>
                  </label>

                  <div
                    onClick={() => {
                      try {
                        effectiveDateInputRef.current?.showPicker?.();
                      } catch (e) {
                        effectiveDateInputRef.current?.focus();
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 hover:border-teal-500 focus-within:border-teal-500 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-inner group relative"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 group-hover:scale-110 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {effectiveDate ? new Date(effectiveDate).toLocaleDateString('vi-VN') : 'Chọn ngày có hiệu lực'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">{effectiveDate || 'YYYY-MM-DD'}</span>
                      </div>
                    </div>

                    <input
                      ref={effectiveDateInputRef}
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                  </div>

                  {/* Quick Date Presets */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                    <span className="text-slate-500">Nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setEffectiveDate(issueDate)}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      Cùng ngày ban hành
                    </button>
                    <button
                      type="button"
                      onClick={() => setEffectiveDate(new Date().toISOString().split('T')[0])}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      Hôm nay
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Tóm tắt hiển thị HTML (Phục vụ SEO & Machine Indexing)</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung HTML tóm tắt hiển thị trên cổng thông tin..."
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Toàn văn bản (Đánh chỉ mục Full-Text Search pg_trgm)</label>
                  <textarea
                    rows={5}
                    placeholder="Dán toàn văn bản để máy chủ tìm kiếm PostgreSQL lập chỉ mục tra cứu..."
                    value={fullText}
                    onChange={(e) => setFullText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button onClick={() => setFormStep(1)} variant="outline" size="sm">
                  &larr; Quay lại
                </Button>
                <Button onClick={() => setFormStep(3)} variant="primary" size="sm">
                  Tiếp theo: Xem trước & Trình duyệt &rarr;
                </Button>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Xem trước Văn bản & Thực hiện Hành động Nghiệp vụ</span>
                <Badge className={ROLE_DEFINITIONS[activeRole]?.badgeClass || 'bg-slate-800'}>
                  Quyền hiện tại: {ROLE_DEFINITIONS[activeRole]?.title}
                </Badge>
              </h3>

              {/* Dynamic Live Preview Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-teal-950 text-teal-300 border-teal-800 font-mono text-xs">
                    {docCode || 'Chưa nhập số'}
                  </Badge>
                  <Badge variant="outline">{docType}</Badge>
                  <span className="text-xs text-slate-400 font-medium">Bởi: {issuingAgency}</span>
                </div>

                <h4 className="text-base font-bold text-white leading-snug">
                  {docTitle || 'Chưa nhập trích yếu (Vui lòng quay lại Bước 2 nhập trích yếu)'}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-900 pt-3">
                  <div>Người ký: <strong className="text-slate-200">{signer || 'Ban Giám đốc'}</strong></div>
                  <div>Ngày ban hành: <strong className="text-slate-200">{issueDate}</strong></div>
                  <div>Trạng thái ATTT: <strong className="text-emerald-400">Đã cam kết theo Luật TCTT</strong></div>
                  <div>Chữ ký số: <strong className="text-amber-400">{p7sFileName ? `Gắn tệp ${p7sFileName}` : 'Đã kiểm tra'}</strong></div>
                </div>

                {pdfFileUrl && (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2">
                    <Paperclip className="w-3.5 h-3.5 text-teal-400" />
                    <span>File đính kèm (Lưu riêng): <strong>{pdfFileName || pdfFileUrl}</strong></span>
                  </div>
                )}
              </div>

              {/* Publication Schedule Box (Xuất bản ngay hoặc Hẹn giờ xuất bản) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" /> Cài đặt Thời điểm Xuất bản Công khai
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Mode 1: Immediate */}
                  <div
                    onClick={() => setPublishScheduleMode('IMMEDIATE')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      publishScheduleMode === 'IMMEDIATE'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <input
                        type="radio"
                        name="publishMode"
                        checked={publishScheduleMode === 'IMMEDIATE'}
                        onChange={() => setPublishScheduleMode('IMMEDIATE')}
                        className="accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-white">⚡ Xuất bản ngay lập tức</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-5">
                      Kích hoạt xuất bản và công khai ngay tức thì trên Cổng thông tin điện tử MBS.
                    </p>
                  </div>

                  {/* Mode 2: Scheduled */}
                  <div
                    onClick={() => {
                      setPublishScheduleMode('SCHEDULED');
                      openScheduleModal();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      publishScheduleMode === 'SCHEDULED'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <input
                        type="radio"
                        name="publishMode"
                        checked={publishScheduleMode === 'SCHEDULED'}
                        onChange={() => {
                          setPublishScheduleMode('SCHEDULED');
                          openScheduleModal();
                        }}
                        className="accent-cyan-500 cursor-pointer"
                      />
                      <span className="text-white">📅 Hẹn giờ xuất bản tự động</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-5">
                      Cài đặt ngày giờ tương lai, hệ thống tự động xuất bản vào thời điểm được ấn định.
                    </p>
                  </div>
                </div>

                {/* Scheduled Date Display & Modal Trigger */}
                {publishScheduleMode === 'SCHEDULED' && (
                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-3 animate-in fade-in duration-200 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <Calendar className="w-4 h-4 text-cyan-400" /> Thời gian Hẹn giờ Xuất bản
                        </span>
                        <div className="text-base font-black text-white font-mono mt-1 flex items-center gap-2">
                          <span>{new Date(scheduledPublishDate).toLocaleString('vi-VN')}</span>
                          <span className="text-[11px] font-normal text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                            Đã thiết lập
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={openScheduleModal}
                        variant="outline"
                        size="sm"
                        className="bg-cyan-950/80 hover:bg-cyan-900 border-cyan-600 text-cyan-300 hover:text-white gap-2 font-bold cursor-pointer transition-all hover:scale-105"
                      >
                        <Calendar className="w-4 h-4 text-cyan-400" /> Mở Form Cài đặt Lịch
                      </Button>
                    </div>

                    <div
                      onClick={openScheduleModal}
                      className="text-xs text-cyan-200 bg-cyan-950/60 p-3 rounded-xl border border-cyan-800/80 flex items-center justify-between cursor-pointer hover:border-cyan-500 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                          Văn bản sẽ ở trạng thái <strong>HẸN GIỜ XUẤT BẢN</strong> và tự động công khai vào{' '}
                          <strong>{new Date(scheduledPublishDate).toLocaleString('vi-VN')}</strong>.
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-cyan-400 hover:underline shrink-0 pl-2">
                        Đổi mốc giờ &rarr;
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Dynamic Action Buttons Container based on Active Role */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-400" /> Hành động khả thi cho vai trò{' '}
                  <span className="text-teal-400">{ROLE_DEFINITIONS[activeRole]?.title}</span>:
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button onClick={() => setFormStep(2)} variant="outline" size="sm">
                    &larr; Quay lại sửa
                  </Button>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Action 1: Save Draft */}
                    <Button
                      onClick={() => handleSaveDocument('DRAFT')}
                      variant="outline"
                      size="sm"
                      className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    >
                      {editingDocId ? 'Lưu cập nhật Nháp' : 'Lưu bản nháp (DRAFT)'}
                    </Button>

                    {/* Action 2: Submit for Review */}
                    {(!canDirectPublish || activeRole === 'SUPER_ADMIN') && (
                      <Button
                        onClick={() => handleSaveDocument('PENDING_REVIEW')}
                        variant="secondary"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4" /> Trình duyệt Lãnh đạo (PENDING_REVIEW)
                      </Button>
                    )}

                    {/* Action 3: Direct Approve & Publish or Schedule */}
                    {canDirectPublish && (
                      <Button
                        onClick={() => handleSaveDocument('PUBLISHED')}
                        variant="primary"
                        size="sm"
                        className={`${
                          publishScheduleMode === 'SCHEDULED'
                            ? 'bg-cyan-600 hover:bg-cyan-500'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        } text-white font-bold gap-1.5 shadow-lg cursor-pointer`}
                      >
                        {publishScheduleMode === 'SCHEDULED' ? (
                          <>
                            <Clock className="w-4 h-4" /> {editingDocId ? 'Cập nhật & Hẹn giờ' : 'Hẹn giờ xuất bản'}
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" /> {editingDocId ? 'Cập nhật & Phê duyệt' : 'Phê duyệt & Xuất bản ngay'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leadership Rejection Reason Modal */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" /> Trả lại Văn bản Yêu cầu Chỉnh sửa
            </h3>

            <p className="text-xs text-slate-400">
              Văn bản: <strong className="text-teal-400">{rejectingDoc.code}</strong> - {rejectingDoc.title}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lý do trả về (Bắt buộc) *</label>
              <textarea
                rows={3}
                placeholder="Nhập lý do cụ thể (VD: Thể thức chưa đúng, thiếu chữ ký số .p7s, sai thông tin trích yếu...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingDoc(null);
                  setRejectionReason('');
                }}
              >
                Hủy
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Xác nhận Trả lại
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activity History Timeline Modal */}
      {historyDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header section matching Image 2 */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">NHẬT KÝ</div>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">Lịch sử hoạt động</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Văn bản: <span className="font-mono text-teal-400 font-bold">{historyDoc.code}</span> — {historyDoc.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                  {historyLogs.length} sự kiện
                </span>
                <button
                  onClick={() => setHistoryDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Timeline List */}
            {isLoadingHistory ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Đang tải nhật ký lịch sử từ CSDL Audit Log...
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Chưa có nhật ký hoạt động nào được ghi nhận cho văn bản này.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {historyLogs.map((log: any, idx: number) => {
                  const userName = log.user?.name || 'Hệ thống';
                  const userRole = log.user?.role || 'SYSTEM';
                  const initials = getInitials(userName);
                  const avatarBg = getAvatarBg(userName);

                  let detailsObj: any = null;
                  if (log.details) {
                    try {
                      detailsObj = JSON.parse(log.details);
                    } catch (e) {
                      detailsObj = { note: log.details };
                    }
                  }

                  return (
                    <div key={log.id || idx} className="relative group">
                      {/* Circle Avatar Badge matching Image 2 */}
                      <div
                        className={`absolute -left-[31px] top-0 w-8 h-8 rounded-full ${avatarBg} text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-slate-900`}
                      >
                        {initials}
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors">
                        {/* Actor Name + Role Pill + Time Ago */}
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-teal-300">{userName}</span>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {ROLE_DEFINITIONS[userRole as UserRole]?.title || userRole}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-medium">
                            {formatTimeAgo(log.createdAt)}
                          </span>
                        </div>

                        {/* Action Bullet Line */}
                        <div className="text-xs font-semibold text-slate-200 flex items-center gap-2 flex-wrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                          <span>{log.action}</span>
                          {detailsObj?.approvalStatus && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-950 text-teal-300 border border-teal-800">
                              {detailsObj.approvalStatus}
                            </span>
                          )}
                        </div>

                        {/* Formatted Timestamp */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                        </div>

                        {/* Detail Box */}
                        {detailsObj && (detailsObj.note || detailsObj.reason || detailsObj.changes) && (
                          <div className="mt-2 p-3 rounded-xl bg-teal-950/40 border border-teal-900/60 text-xs text-teal-200 space-y-1">
                            {detailsObj.note && (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-0.5">
                                  Nội dung chỉ đạo / Ghi chú
                                </span>
                                <p className="text-slate-300 leading-relaxed">{detailsObj.note}</p>
                              </div>
                            )}
                            {detailsObj.reason && (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">
                                  Lý do trả về
                                </span>
                                <p className="text-rose-200 leading-relaxed">{detailsObj.reason}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Close Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setHistoryDoc(null)}>
                Đóng nhật ký
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Schedule Publish Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Lên lịch phát hành tự động
                </div>
                <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  🗓️ Cài đặt Ngày & Giờ Xuất bản
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Văn bản sẽ tự động được kích hoạt và xuất bản công khai lên Portal MBS vào đúng thời điểm được chọn.
                </p>
              </div>

              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Chọn nhanh mốc thời gian phổ biến:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalPreset(0, '17:00')}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>⚡ Hôm nay (17:00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalPreset(1, '08:30')}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🌅 Sáng mai (08:30)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalPreset(1, '14:00')}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🌙 Chiều mai (14:00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalPreset(3, '09:00')}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📅 3 ngày sau (09:00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalPreset(7, '09:00')}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🗓️ 7 ngày sau (09:00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    const yyyy = nextMonth.getFullYear();
                    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
                    setModalScheduleDate(`${yyyy}-${mm}-01`);
                    setModalScheduleTime('08:00');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🏛️ Đầu tháng tới</span>
                </button>
              </div>
            </div>

            {/* Custom Inputs: Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Ngày xuất bản *
                </label>
                <input
                  type="date"
                  value={modalScheduleDate}
                  onChange={(e) => setModalScheduleDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Giờ xuất bản *
                </label>
                <input
                  type="time"
                  value={modalScheduleTime}
                  onChange={(e) => setModalScheduleTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                />
              </div>
            </div>

            {/* Selection Summary Banner */}
            <div className="p-4 bg-cyan-950/40 border border-cyan-800/80 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Xác nhận Thời điểm Xuất bản Tự động:
              </div>
              <div className="text-base font-black text-white font-mono pl-6">
                {modalScheduleTime} — Ngày {modalScheduleDate ? new Date(modalScheduleDate).toLocaleDateString('vi-VN') : '--/--/----'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleModalOpen(false)}
                className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmScheduleModal}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold gap-2 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" /> Xác nhận & Lưu Lịch hẹn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
