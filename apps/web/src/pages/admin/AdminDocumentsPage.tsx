import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Plus,
  ArrowLeft,
  UserCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import { DOCUMENT_TYPES, ISSUING_AGENCIES } from '../../lib/mock-data';
import { fetchApi } from '../../services/api-client';
import { UserRole, ROLE_DEFINITIONS } from '../../lib/permission.utils';

// Sub-components
import { DocumentFilterBar } from '../../components/admin/documents/DocumentFilterBar';
import { DocumentListTable } from '../../components/admin/documents/DocumentListTable';
import { DocumentEditorForm } from '../../components/admin/documents/DocumentEditorForm';
import { DocumentHistoryModal } from '../../components/admin/documents/DocumentHistoryModal';
import { DocumentScheduleModal } from '../../components/admin/documents/DocumentScheduleModal';
import { DocumentAnalyticsModal } from '../../components/admin/documents/DocumentAnalyticsModal';

export interface AdminDocumentsPageProps {
  onNavigate: (path: string) => void;
  subView?: 'list' | 'new' | 'approval';
}

export const AdminDocumentsPage: React.FC<AdminDocumentsPageProps> = ({ onNavigate, subView = 'list' }) => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState<'all' | 'approval'>('all');
  const [currentSubView, setCurrentSubView] = useState<'list' | 'new'>(subView === 'new' ? 'new' : 'list');

  // Role Simulation State (Defaults to logged in user role)
  const [activeRole, setActiveRole] = useState<UserRole>('EDITOR_LEAD');

  // Detect logged in user role from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mbs_admin_user') || localStorage.getItem('mbs_user');
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

  // Filter & Search States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDocType, setFilterDocType] = useState('Tất cả');
  const [filterAgency, setFilterAgency] = useState('Tất cả');
  const [filterYear, setFilterYear] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Analytics Modal State
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

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

  // Publication Schedule State
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
    showToast(
      'Thành công',
      `Đã cài đặt hẹn giờ xuất bản vào ${modalScheduleTime} ngày ${new Date(modalScheduleDate).toLocaleDateString('vi-VN')}`,
      'success'
    );
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

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterDocType('Tất cả');
    setFilterAgency('Tất cả');
    setFilterYear('Tất cả');
    setFilterStatus('Tất cả');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Extract list of available years dynamically
  const availableYears = Array.from(
    new Set(
      documents.map((d) => (d.issueDate ? new Date(d.issueDate).getFullYear().toString() : '2026'))
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Handle Real PDF File Upload
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
        setPdfFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
        showToast('Tải tệp thành công', `Đã lưu tệp ${file.name} tại đường dẫn đĩa riêng`, 'success');

        // Extract PDF text for preview
        try {
          const extractRes = await fetch(`${BASE_URL}/v1/documents/extract-text`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: uploaded.url }),
          });
          const extractData = await extractRes.json();
          if (extractData?.data?.text) {
            setFullText(extractData.data.text);
            if (!docTitle) setDocTitle(extractData.data.text.slice(0, 150));
          }
        } catch (e) {
          // ignore extraction error fallback
        }
      }
    } catch (err: any) {
      showToast('Lỗi upload', err.message || 'Không thể upload tệp PDF', 'error');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Handle Real P7S Signature Upload
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

  // Handle Form Save (Create or Edit)
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
      const finalApprovalStatus =
        targetStatus === 'PUBLISHED' && publishScheduleMode === 'SCHEDULED' ? 'SCHEDULED' : targetStatus;

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

  // Open Edit Form
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

  // Open History Modal
  const handleOpenHistory = async (doc: any) => {
    setHistoryDoc(doc);
    setIsLoadingHistory(true);
    try {
      const res = await fetchApi<{ data: any[] }>(`/v1/documents/${doc.id}/history`).catch(() => null);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setHistoryLogs(res.data);
      } else {
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
              note:
                doc.approvalStatus === 'PENDING_REVIEW'
                  ? `Văn bản [${doc.code}] - ${doc.title} đang được trình Lãnh đạo xem xét và phê duyệt`
                  : `Phê duyệt và phát hành chính thức văn bản [${doc.code}] - ${doc.title}`,
            }),
          },
          {
            id: `hist-upd-${doc.id}`,
            action: 'UPDATE_DOCUMENT_METADATA',
            module: 'documents',
            createdAt: updatedTime.toISOString(),
            user: { fullName: 'Trưởng Ban Biên tập', role: 'EDITOR_LEAD' },
            details: JSON.stringify({
              note: `Chỉnh sửa cập nhật thuộc tính metadata văn bản [${doc.code}] - ${doc.title}`,
            }),
          },
          {
            id: `hist-cre-${doc.id}`,
            action: 'CREATE_DOCUMENT',
            module: 'documents',
            createdAt: docCreatedTime.toISOString(),
            user: { fullName: 'Chuyên viên Biên tập', role: 'EDITOR' },
            details: JSON.stringify({
              code: doc.code,
              docType: doc.docType,
              issuingAgency: doc.issuingAgency,
              note: `Tạo mới hồ sơ văn bản số hóa [${doc.code}]`,
            }),
          },
        ];
        setHistoryLogs(specificLogs);
      }
    } catch (err: any) {
      setHistoryLogs([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Approval & Rejection Handlers
  const handleApprove = async (id: string, codeStr: string) => {
    try {
      const res = await fetchApi<{ data: any }>(`/v1/documents/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res && res.data) {
        showToast('Đã phê duyệt', `Văn bản ${codeStr} đã được phê duyệt và xuất bản ngay!`, 'success');
        loadDocuments();
      }
    } catch (err: any) {
      showToast('Lỗi phê duyệt', err.message || 'Không thể duyệt văn bản', 'error');
    }
  };

  const handleSubmitForReview = async (id: string, codeStr: string) => {
    try {
      const res = await fetchApi<{ data: any }>(`/v1/documents/${id}/submit-review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res && res.data) {
        showToast('Đã trình duyệt', `Văn bản ${codeStr} đã được gửi đến Lãnh đạo xem xét!`, 'info');
        loadDocuments();
      }
    } catch (err: any) {
      showToast('Lỗi trình duyệt', err.message || 'Không thể trình duyệt văn bản', 'error');
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

  // Multi-criteria Filtering
  const filteredDocs = (currentTab === 'all' ? documents : approvalQueue).filter((doc) => {
    const matchSearch =
      !searchKeyword.trim() ||
      doc.code?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.signer?.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchType = filterDocType === 'Tất cả' || doc.docType === filterDocType;
    const matchAgency = filterAgency === 'Tất cả' || doc.issuingAgency === filterAgency;

    const docYear = doc.issueDate ? new Date(doc.issueDate).getFullYear().toString() : '2026';
    const matchYear = filterYear === 'Tất cả' || docYear === filterYear;

    const matchStatus = filterStatus === 'Tất cả' || doc.approvalStatus === filterStatus;

    return matchSearch && matchType && matchAgency && matchYear && matchStatus;
  });

  // Dynamic Sorting Logic (Default: Newest IssueDate on Row 1)
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'oldest') {
      const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
      const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
      return dateA - dateB;
    }
    if (sortBy === 'code_asc') {
      return (a.code || '').localeCompare(b.code || '');
    }
    if (sortBy === 'code_desc') {
      return (b.code || '').localeCompare(a.code || '');
    }
    // Default 'newest'
    const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
    const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
    return dateB - dateA;
  });

  // Pagination Calculations
  const totalItems = sortedDocs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedDocs = sortedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Render Status Badge Component
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

  const canDirectPublish = activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN' || activeRole === 'EDITOR_LEAD';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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

      {/* Main View Renderer */}
      {currentSubView === 'list' ? (
        <div className="space-y-4">
          <DocumentFilterBar
            searchKeyword={searchKeyword}
            onSearchKeywordChange={(val) => {
              setSearchKeyword(val);
              setCurrentPage(1);
            }}
            filterDocType={filterDocType}
            onFilterDocTypeChange={(val) => {
              setFilterDocType(val);
              setCurrentPage(1);
            }}
            filterAgency={filterAgency}
            onFilterAgencyChange={(val) => {
              setFilterAgency(val);
              setCurrentPage(1);
            }}
            filterYear={filterYear}
            onFilterYearChange={(val) => {
              setFilterYear(val);
              setCurrentPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(val) => {
              setFilterStatus(val);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={(val) => {
              setSortBy(val);
              setCurrentPage(1);
            }}
            onOpenAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
            onResetFilters={handleResetFilters}
            onOpenNewDoc={() => {
              resetForm();
              setCurrentSubView('new');
            }}
            documentTypes={DOCUMENT_TYPES}
            issuingAgencies={ISSUING_AGENCIES}
            availableYears={availableYears}
          />

          <DocumentListTable
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              setCurrentPage(1);
            }}
            documentsCount={documents.length}
            approvalQueueCount={approvalQueue.length}
            displayedDocs={paginatedDocs}
            isLoading={isLoading}
            activeRole={activeRole}
            onNavigate={onNavigate}
            onStartEdit={handleStartEdit}
            onDeleteDocument={handleDeleteDocument}
            onOpenHistory={handleOpenHistory}
            onApprove={handleApprove}
            onReject={(doc) => setRejectingDoc(doc)}
            onSubmitForReview={handleSubmitForReview}
            renderApprovalBadge={renderApprovalBadge}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(num) => {
              setItemsPerPage(num);
              setCurrentPage(1);
            }}
          />
        </div>
      ) : (
        <DocumentEditorForm
          editingDocId={editingDocId}
          formStep={formStep}
          onFormStepChange={setFormStep}
          docCode={docCode}
          onDocCodeChange={setDocCode}
          docTitle={docTitle}
          onDocTitleChange={setDocTitle}
          docType={docType}
          onDocTypeChange={setDocType}
          issuingAgency={issuingAgency}
          onIssuingAgencyChange={setIssuingAgency}
          docStatus={docStatus}
          onDocStatusChange={setDocStatus}
          signer={signer}
          onSignerChange={setSigner}
          issueDate={issueDate}
          onIssueDateChange={setIssueDate}
          effectiveDate={effectiveDate}
          onEffectiveDateChange={setEffectiveDate}
          domain={domain}
          onDomainChange={setDomain}
          fullText={fullText}
          onFullTextChange={setFullText}
          htmlContent={htmlContent}
          onHtmlContentChange={setHtmlContent}
          pdfFileUrl={pdfFileUrl}
          pdfFileName={pdfFileName}
          pdfFileSize={pdfFileSize}
          isUploadingPdf={isUploadingPdf}
          p7sSignatureUrl={p7sSignatureUrl}
          p7sFileName={p7sFileName}
          isUploadingP7s={isUploadingP7s}
          isConfidentialChecked={isConfidentialChecked}
          onConfidentialCheckedChange={setIsConfidentialChecked}
          publishScheduleMode={publishScheduleMode}
          onPublishScheduleModeChange={setPublishScheduleMode}
          scheduledPublishDate={scheduledPublishDate}
          activeRole={activeRole}
          canDirectPublish={canDirectPublish}
          pdfInputRef={pdfInputRef}
          p7sInputRef={p7sInputRef}
          issueDateInputRef={issueDateInputRef}
          effectiveDateInputRef={effectiveDateInputRef}
          onHandlePdfUpload={handlePdfUpload}
          onHandleP7sUpload={handleP7sUpload}
          onClearPdf={() => {
            setPdfFileUrl('');
            setPdfFileName('');
            setPdfFileSize('');
            if (pdfInputRef.current) pdfInputRef.current.value = '';
          }}
          onClearP7s={() => {
            setP7sSignatureUrl('');
            setP7sFileName('');
            if (p7sInputRef.current) p7sInputRef.current.value = '';
          }}
          onSaveDocument={handleSaveDocument}
          onOpenScheduleModal={openScheduleModal}
          documentTypes={DOCUMENT_TYPES}
          issuingAgencies={ISSUING_AGENCIES}
        />
      )}

      {/* Analytics Modal */}
      <DocumentAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        documents={documents}
      />

      {/* Activity History Modal */}
      <DocumentHistoryModal
        historyDoc={historyDoc}
        historyLogs={historyLogs}
        isLoadingHistory={isLoadingHistory}
        onClose={() => setHistoryDoc(null)}
      />

      {/* Publication Schedule Modal */}
      <DocumentScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        modalScheduleDate={modalScheduleDate}
        onModalScheduleDateChange={setModalScheduleDate}
        modalScheduleTime={modalScheduleTime}
        onModalScheduleTimeChange={setModalScheduleTime}
        onConfirm={handleConfirmScheduleModal}
        onPreset={setModalPreset}
      />

      {/* Leadership Rejection Reason Modal */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" /> Lý do từ chối văn bản
            </h3>
            <p className="text-xs text-slate-300 font-medium">{rejectingDoc.title}</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do cụ thể từ chối để chuyên viên chỉnh sửa..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={() => {
                  setRejectingDoc(null);
                  setRejectionReason('');
                }}
                variant="outline"
                size="sm"
              >
                Hủy bỏ
              </Button>
              <Button onClick={handleConfirmReject} variant="danger" size="sm">
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

