import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  BookOpen,
  Upload,
  Copy,
  Check,
  Search,
  FileText,
  Eye,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  FileUp,
  ExternalLink,
  Edit,
  Star,
  Layers,
  Filter,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  Sparkles,
  Database,
  HardDrive,
  Plus,
  Settings,
  FolderPlus,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { useToast } from '../../components/ui/toast';
import { normalizeMediaUrl } from '../../lib/utils';

export interface AdminMediaPageProps {
  onNavigate: (path: string) => void;
  subTab?: 'media' | 'emagazine';
}

interface MediaItem {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  caption?: string;
  isFeatured?: boolean;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  relativeUrl: string;
  storageDriver: string;
  createdAt: string;
}

interface CategoryStat {
  category: string;
  count: number;
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ onNavigate, subTab = 'media' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'media' | 'emagazine'>(subTab);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    return (
      localStorage.getItem('mbs_admin_token') ||
      localStorage.getItem('mbs_access_token') ||
      localStorage.getItem('mbs_token') ||
      localStorage.getItem('token')
    );
  };

  // API State
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tất cả');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dynamic Categories & Category Management Modal State
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Upload Modal State (with Metadata & Custom Category)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Khu Đa Phước');
  const [uploadNewCategory, setUploadNewCategory] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadIsFeatured, setUploadIsFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Khu Đa Phước');
  const [editNewCategory, setEditNewCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Preview & Delete Modal State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/v1/media/categories`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setCategoriesList(json.data);
      }

      // Fetch category stats
      const statsRes = await fetch(`${BASE_URL}/v1/media/categories/stats`);
      const statsJson = await statsRes.json();
      if (statsJson.data && Array.isArray(statsJson.data)) {
        setCategoryStats(statsJson.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      let url = `${BASE_URL}/v1/media?search=${encodeURIComponent(searchQuery)}`;
      if (selectedCategoryFilter !== 'Tất cả') {
        url += `&category=${encodeURIComponent(selectedCategoryFilter)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.data && data.data.items) {
        setMediaList(data.data.items.map((item: any) => ({
          ...item,
          url: normalizeMediaUrl(item.url || item.relativeUrl),
        })));
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      showToast('Lỗi tải thư viện', 'Không thể kết nối đến máy chủ API media', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMedia();
  }, [searchQuery, selectedCategoryFilter]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Đã sao chép URL', 'Đường dẫn hình ảnh đã được chép vào bộ nhớ tạm', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selection Checkbox Helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === mediaList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mediaList.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CATEGORY MANAGEMENT HANDLERS
  const handleAddNewCategory = async () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      showToast('Tên danh mục trống', 'Vui lòng nhập tên danh mục hợp lệ', 'error');
      return;
    }
    if (categoriesList.includes(trimmed)) {
      showToast('Danh mục đã tồn tại', `Danh mục "${trimmed}" đã có sẵn trong hệ thống`, 'error');
      return;
    }

    setCategoriesList((prev) => [...prev, trimmed]);
    setCategoryStats((prev) => [...prev, { category: trimmed, count: 0 }]);
    setNewCategoryInput('');
    showToast('Đã tạo danh mục mới', `Danh mục "${trimmed}" đã được khởi tạo thành công`, 'success');
  };

  const handleRenameCategorySubmit = async (oldCategory: string) => {
    const trimmed = renameInputValue.trim();
    if (!trimmed || trimmed === oldCategory) {
      setEditingCategory(null);
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/v1/media/categories/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ oldCategory, newCategory: trimmed }),
      });

      if (res.ok) {
        showToast(
          'Đã đổi tên danh mục!',
          `Danh mục "${oldCategory}" đã đổi thành "${trimmed}"`,
          'success'
        );
        setEditingCategory(null);
        fetchCategories();
        fetchMedia();
      } else {
        const result = await res.json();
        showToast('Lỗi đổi tên', result.detail || 'Không thể đổi tên danh mục', 'error');
      }
    } catch (err) {
      console.error('Rename category error:', err);
      showToast('Lỗi kết nối', 'Không thể kết nối máy chủ', 'error');
    }
  };

  const handleDeleteCategorySubmit = async (categoryToDelete: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/v1/media/categories`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ category: categoryToDelete }),
      });

      if (res.ok) {
        showToast(
          'Đã xóa danh mục!',
          `Danh mục "${categoryToDelete}" đã được xóa khỏi CSDL`,
          'success'
        );
        setDeletingCategory(null);
        fetchCategories();
        fetchMedia();
      } else {
        const result = await res.json();
        showToast('Lỗi xóa danh mục', result.detail || 'Không thể xóa danh mục', 'error');
      }
    } catch (err) {
      console.error('Delete category error:', err);
      showToast('Lỗi kết nối', 'Không thể kết nối máy chủ', 'error');
    }
  };

  // Toggle Featured Quick Action
  const handleToggleFeatured = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = getAuthToken();
      const newStatus = !item.isFeatured;
      const res = await fetch(`${BASE_URL}/v1/media/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isFeatured: newStatus }),
      });

      if (res.ok) {
        showToast(
          newStatus ? 'Đã ghim nổi bật!' : 'Đã bỏ ghim',
          `Hình ảnh "${item.title || item.originalName}" đã được cập nhật trạng thái ghim`,
          'success'
        );
        fetchMedia();
      }
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditItem(item);
    setEditTitle(item.title || item.originalName);
    setEditCategory(item.category || 'Khu Đa Phước');
    setEditNewCategory('');
    setEditDescription(item.description || '');
    setEditCaption(item.caption || '');
    setEditIsFeatured(item.isFeatured || false);
  };

  // Submit Edit Metadata
  const handleSaveEdit = async () => {
    if (!editItem) return;

    const finalCategory =
      editCategory === 'CREATE_NEW' ? editNewCategory.trim() : editCategory;

    if (!finalCategory) {
      showToast('Vui lòng nhập tên danh mục', 'Tên danh mục mới không được để trống', 'error');
      return;
    }

    try {
      setIsSavingEdit(true);
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/v1/media/${editItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: editTitle,
          category: finalCategory,
          description: editDescription,
          caption: editCaption,
          isFeatured: editIsFeatured,
        }),
      });

      if (res.ok) {
        showToast('Cập nhật thành công!', 'Thông tin hình ảnh đã được lưu vào CSDL', 'success');
        setEditItem(null);
        fetchCategories();
        fetchMedia();
      } else {
        const result = await res.json();
        showToast('Cập nhật thất bại', result.detail || 'Không thể cập nhật metadata', 'error');
      }
    } catch (err) {
      console.error('Error updating media metadata:', err);
      showToast('Lỗi kết nối', 'Không thể kết nối máy chủ', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Upload File Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const invalidFiles = filesArray.filter((f) => f.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        showToast('Dung lượng vượt quá giới hạn', 'Mỗi tệp ảnh tải lên phải nhỏ hơn 10MB', 'error');
        return;
      }
      setSelectedFiles(filesArray);
      if (!uploadTitle && filesArray.length === 1) {
        setUploadTitle(filesArray[0].name.split('.')[0]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const invalidFiles = filesArray.filter((f) => f.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        showToast('Dung lượng vượt quá giới hạn', 'Mỗi tệp ảnh tải lên phải nhỏ hơn 10MB', 'error');
        return;
      }
      setSelectedFiles(filesArray);
      if (!uploadTitle && filesArray.length === 1) {
        setUploadTitle(filesArray[0].name.split('.')[0]);
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    const finalCategory =
      uploadCategory === 'CREATE_NEW' ? uploadNewCategory.trim() : uploadCategory;

    if (!finalCategory) {
      showToast('Vui lòng nhập danh mục', 'Tên danh mục không được để trống', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('title', uploadTitle || selectedFiles[0].name);
      formData.append('category', finalCategory);
      formData.append('description', uploadDescription);
      formData.append('caption', uploadCaption);
      formData.append('isFeatured', String(uploadIsFeatured));

      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/v1/media/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        showToast(
          'Tải lên thành công!',
          `Đã tải lên ${selectedFiles.length} hình ảnh kèm danh mục "${finalCategory}" vào CSDL`,
          'success'
        );
        setSelectedFiles([]);
        setUploadTitle('');
        setUploadDescription('');
        setUploadCaption('');
        setUploadNewCategory('');
        setUploadIsFeatured(false);
        setIsUploadOpen(false);
        fetchCategories();
        fetchMedia();
      } else {
        showToast('Tải lên thất bại', result.detail || 'Không thể tải ảnh lên máy chủ', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Lỗi tải lên', 'Có lỗi xảy ra khi kết nối máy chủ', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Single Delete
  const handleDeleteMedia = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/v1/media/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        showToast('Đã xóa hình ảnh', 'Tệp ảnh đã được xóa khỏi hệ thống', 'success');
        setDeleteTarget(null);
        fetchCategories();
        fetchMedia();
      } else {
        const result = await res.json();
        showToast('Xóa thất bại', result.detail || 'Không thể xóa tệp ảnh', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Lỗi kết nối', 'Không thể xóa hình ảnh', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsDeleting(true);
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/v1/media/batch-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        showToast('Đã xóa hàng loạt!', `Đã xóa vĩnh viễn ${selectedIds.length} tệp ảnh`, 'success');
        setSelectedIds([]);
        setIsBatchDeleteOpen(false);
        fetchCategories();
        fetchMedia();
      } else {
        const result = await res.json();
        showToast('Xóa thất bại', result.detail || 'Không thể xóa danh sách ảnh đã chọn', 'error');
      }
    } catch (error) {
      console.error('Batch delete error:', error);
      showToast('Lỗi kết nối', 'Không thể xóa hàng loạt', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate Dashboard Stats
  const totalStorageBytes = mediaList.reduce((acc, item) => acc + (item.size || 0), 0);
  const featuredCount = mediaList.filter((item) => item.isFeatured).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-teal-400" />
            {activeTab === 'media'
              ? 'Quản lý Kho Đa phương tiện Enterprise'
              : 'Quản lý Ấn phẩm E-Magazine Sách lật'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị kho ảnh, tự do tùy chỉnh danh mục/album & đồng bộ hiển thị lên Cổng thông tin Công khai
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kho Thư viện Ảnh
            </button>
            <button
              onClick={() => setActiveTab('emagazine')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'emagazine'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ấn phẩm E-Magazine
            </button>
          </div>

          <Button
            onClick={() => setIsCategoryModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 bg-slate-900 border-slate-700 text-teal-300 hover:bg-slate-800"
          >
            <Tag className="w-4 h-4 text-amber-400" /> Quản lý Danh mục
          </Button>

          <Button
            onClick={() => setIsUploadOpen(true)}
            variant="primary"
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg"
          >
            <Upload className="w-4 h-4" /> Tải ảnh mới kèm Danh mục
          </Button>
        </div>
      </div>

      {activeTab === 'media' ? (
        <>
          {/* Executive Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="p-3 bg-teal-950 text-teal-400 rounded-xl border border-teal-800/80">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tổng số tệp CSDL</span>
                <strong className="text-lg font-black text-white font-mono">{mediaList.length}</strong>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/80">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dung lượng sử dụng</span>
                <strong className="text-lg font-black text-emerald-400 font-mono">
                  {formatFileSize(totalStorageBytes)}
                </strong>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="p-3 bg-amber-950 text-amber-400 rounded-xl border border-amber-800/80">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Ghim nổi bật</span>
                <strong className="text-lg font-black text-amber-300 font-mono">{featuredCount}</strong>
              </div>
            </div>

            <div
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-slate-900 border border-slate-800 hover:border-teal-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg cursor-pointer transition-all group"
            >
              <div className="p-3 bg-indigo-950 text-indigo-400 group-hover:text-teal-300 rounded-xl border border-indigo-800/80">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block group-hover:text-teal-300">
                  Danh mục tùy chỉnh ⚙️
                </span>
                <strong className="text-lg font-black text-indigo-300 font-mono">
                  {categoriesList.length}
                </strong>
              </div>
            </div>
          </div>

          {/* Bulk Action Toolbar (When Items Selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-800/80 p-3.5 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3 text-xs font-bold text-white">
                <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-mono">
                  Đã chọn {selectedIds.length} tệp
                </span>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  Bỏ chọn tất cả
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsBatchDeleteOpen(true)}
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 text-xs"
                >
                  <Trash2 className="w-4 h-4" /> Xóa {selectedIds.length} tệp đã chọn
                </Button>
              </div>
            </div>
          )}

          {/* Search, Dynamic Category Filter Pills & View Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, tên tệp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Dynamic Category Pills + Manage Button */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto py-1">
              <button
                onClick={() => setSelectedCategoryFilter('Tất cả')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategoryFilter === 'Tất cả'
                    ? 'bg-teal-950 text-teal-300 border-teal-600 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Tất cả danh mục
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategoryFilter === cat
                      ? 'bg-teal-950 text-teal-300 border-teal-600 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 hover:bg-amber-900/80 shrink-0 flex items-center gap-1"
                title="Quản lý danh mục"
              >
                <Settings className="w-3.5 h-3.5" /> Quản lý
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleSelectAll}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                title="Chọn tất cả"
              >
                {selectedIds.length === mediaList.length && mediaList.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-teal-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-teal-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
                title="Dạng Thẻ Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-teal-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
                title="Dạng Bảng Table"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Main Content Display */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-xs font-medium">Đang tải danh sách kho hình ảnh CSDL...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
              <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Chưa có hình ảnh nào trong danh mục</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Nhấp vào nút "Tải ảnh mới kèm Danh mục" phía trên để đưa dữ liệu mới lên hệ thống.
              </p>
              <Button onClick={() => setIsUploadOpen(true)} variant="outline" size="sm" className="gap-1.5">
                <Upload className="w-4 h-4 text-teal-400" /> Tải tệp ngay
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID CARD VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {mediaList.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-slate-900 border ${
                      isSelected ? 'border-teal-500 ring-2 ring-teal-500/50' : 'border-slate-800'
                    } rounded-2xl overflow-hidden shadow-xl group hover:border-teal-500 transition-all flex flex-col justify-between`}
                  >
                    {/* Top Image Preview Box */}
                    <div
                      className="relative overflow-hidden bg-slate-950 h-44 cursor-pointer"
                      onClick={() => setPreviewItem(item)}
                    >
                      {item.mimeType.includes('pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 p-4 text-center">
                          <FileText className="w-12 h-12 mb-2" />
                          <span className="text-xs font-bold truncate max-w-full">{item.title || item.originalName}</span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || item.originalName}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      )}

                      {/* Top Checkbox & Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectItem(item.id);
                          }}
                          className="pointer-events-auto p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleToggleFeatured(item, e)}
                          className={`pointer-events-auto p-1.5 rounded-lg backdrop-blur-md transition-colors border ${
                            item.isFeatured
                              ? 'bg-amber-950/90 text-amber-300 border-amber-600 font-bold'
                              : 'bg-slate-950/80 text-slate-400 border-slate-700 hover:text-amber-300'
                          }`}
                          title={item.isFeatured ? 'Đã ghim nổi bật' : 'Bấm để ghim nổi bật'}
                        >
                          <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => openEditModal(item, e)}
                          className="p-2 bg-slate-900/90 text-teal-300 rounded-full hover:bg-teal-600 hover:text-white transition-colors shadow"
                          title="Sửa thông tin & Danh mục"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewItem(item);
                          }}
                          className="p-2 bg-slate-900/90 text-white rounded-full hover:bg-teal-600 transition-colors shadow"
                          title="Xem trước"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                          className="p-2 bg-slate-900/90 text-rose-400 rounded-full hover:bg-rose-600 hover:text-white transition-colors shadow"
                          title="Xóa tệp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Info */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-400 uppercase bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/80 truncate max-w-[140px]">
                          {item.category || 'Khu Đa Phước'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatFileSize(item.size)}
                        </span>
                      </div>

                      <h4
                        className="text-xs font-bold text-white line-clamp-1 cursor-pointer hover:text-teal-400 transition-colors"
                        onClick={() => setPreviewItem(item)}
                        title={item.title || item.originalName}
                      >
                        {item.title || item.originalName}
                      </h4>

                      {item.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          onClick={() => handleCopyUrl(item.url, item.id)}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs bg-slate-950 border-slate-800 text-slate-200 gap-1.5"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === item.id ? 'Đã chép' : 'Sao chép URL'}</span>
                        </Button>
                        <Button
                          onClick={(e) => openEditModal(item, e)}
                          variant="outline"
                          size="sm"
                          className="shrink-0 p-2 text-slate-300 hover:text-white bg-slate-950 border-slate-800"
                          title="Sửa Danh mục"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3 text-center w-10">
                        <button onClick={toggleSelectAll}>
                          {selectedIds.length === mediaList.length && mediaList.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-teal-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="p-3 w-16">Xem</th>
                      <th className="p-3">Tiêu đề / Tên tệp</th>
                      <th className="p-3">Danh mục</th>
                      <th className="p-3">Dung lượng</th>
                      <th className="p-3 text-center">Nổi bật</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {mediaList.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-teal-950/20' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <button onClick={() => toggleSelectItem(item.id)}>
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-teal-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                          </td>
                          <td className="p-3">
                            <img
                              src={item.url}
                              alt={item.originalName}
                              className="w-10 h-10 object-cover rounded-lg bg-slate-950 cursor-pointer"
                              onClick={() => setPreviewItem(item)}
                            />
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-white block line-clamp-1">
                              {item.title || item.originalName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{item.filename}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-bold text-teal-400 uppercase bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                              {item.category || 'Khu Đa Phước'}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{formatFileSize(item.size)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={(e) => handleToggleFeatured(item, e)}
                              className={`p-1.5 rounded-lg border ${
                                item.isFeatured
                                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                                  : 'bg-slate-950 text-slate-500 border-slate-800'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleCopyUrl(item.url, item.id)}
                              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                              title="Sao chép URL"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={(e) => openEditModal(item, e)}
                              className="p-1.5 bg-slate-950 hover:bg-teal-950 text-teal-400 rounded-lg border border-slate-800"
                              title="Sửa metadata & Danh mục"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 bg-slate-950 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-800"
                              title="Xóa tệp"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* E-Magazine View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Danh sách Bản tin Nội bộ & Kỷ yếu Số</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Bản tin Tháng 02/2026
                </span>
                <h4 className="text-sm font-bold text-white">
                  Ấn phẩm Thông tin Khoa học & Môi trường MBS Số 24
                </h4>
                <p className="text-xs text-slate-400">Định dạng PDF • 32 Trang • Tự động kích hoạt sách lật 3D</p>
              </div>

              <Button onClick={() => setIsFlipbookOpen(true)} variant="primary" size="sm" className="gap-1 text-xs shrink-0">
                <Eye className="w-3.5 h-3.5" /> Xem Flipbook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ DANH MỤC (CATEGORY MANAGER MODAL) */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          setDeletingCategory(null);
        }}
        title="Quản lý Danh mục / Album Đa phương tiện"
        maxWidth="lg"
      >
        <div className="space-y-5 text-xs">
          {/* Add New Category Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-teal-400" /> Thêm danh mục mới vào CSDL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập tên danh mục mới (ví dụ: Sự kiện 2026, Hoạt động Đoàn...)"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <Button
                onClick={handleAddNewCategory}
                variant="primary"
                size="sm"
                className="shrink-0 gap-1 bg-teal-600 hover:bg-teal-500 text-white"
              >
                <Plus className="w-4 h-4" /> Thêm
              </Button>
            </div>
          </div>

          {/* Categories List Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Danh sách danh mục hiện có ({categoriesList.length})
            </h4>

            <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 divide-y divide-slate-800/80">
              {categoriesList.map((catName) => {
                const statObj = categoryStats.find((s) => s.category === catName);
                const count = statObj ? statObj.count : mediaList.filter((m) => m.category === catName).length;
                const isEditingThis = editingCategory === catName;

                return (
                  <div
                    key={catName}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                  >
                    {isEditingThis ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={renameInputValue}
                          onChange={(e) => setRenameInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameCategorySubmit(catName)}
                          className="w-full bg-slate-900 border border-teal-500 rounded-lg px-2.5 py-1 text-xs text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameCategorySubmit(catName)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs shrink-0"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs shrink-0"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate">
                          <Tag className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-bold text-white text-xs truncate">{catName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                            {count} tệp
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingCategory(catName);
                              setRenameInputValue(catName);
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-teal-950 text-teal-400 rounded-lg border border-slate-800 transition-colors"
                            title="Đổi tên danh mục"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(catName)}
                            className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-800 transition-colors"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
                setDeletingCategory(null);
              }}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE CATEGORY MODAL */}
      {deletingCategory && (
        <Modal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          title={`Xác nhận xóa danh mục "${deletingCategory}"`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400 bg-rose-950/40 p-3.5 rounded-xl border border-rose-900/60">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="font-medium">
                Bạn có chắc chắn muốn xóa danh mục <strong className="text-white">"{deletingCategory}"</strong>? Tất cả hình ảnh thuộc danh mục này sẽ tự động chuyển sang danh mục mặc định.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingCategory(null)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDeleteCategorySubmit(deletingCategory)}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Đồng ý xóa danh mục
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL TẢI ẢNH MỚI KÈM CUSTOM CATEGORY */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadOpen(false);
            setSelectedFiles([]);
          }
        }}
        title="Tải lên Hình ảnh / Ấn phẩm Mới Kèm Metadata"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/60 hover:bg-slate-950 space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
              className="hidden"
            />
            <div className="w-12 h-12 bg-teal-950/60 text-teal-400 rounded-full flex items-center justify-center mx-auto border border-teal-800">
              <FileUp className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">Kéo thả tệp ảnh vào đây hoặc nhấp để duyệt</h4>
            <p className="text-[11px] text-slate-400">Hỗ trợ JPG, PNG, WEBP, GIF, SVG, PDF (Tối đa 10MB/tệp)</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-teal-400 font-bold">
              Đã chọn {selectedFiles.length} tệp: {selectedFiles.map((f) => f.name).join(', ')}
            </div>
          )}

          {/* Metadata Inputs */}
          <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Tiêu đề hiển thị</label>
              <input
                type="text"
                placeholder="Nhập tiêu đề minh họa hình ảnh..."
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Dynamic Category Selector with "+ Thêm danh mục mới" */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Phân loại Danh mục / Album</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CREATE_NEW" className="font-bold text-amber-400">
                  + Tạo danh mục mới...
                </option>
              </select>

              {uploadCategory === 'CREATE_NEW' && (
                <div className="mt-2 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục mới của bạn (ví dụ: Sự kiện 2026, Hoạt động Đoàn...)"
                    value={uploadNewCategory}
                    onChange={(e) => setUploadNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mô tả nội dung</label>
              <textarea
                rows={2}
                placeholder="Nhập mô tả tóm tắt nội dung hình ảnh..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-slate-300 font-bold flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadIsFeatured}
                  onChange={(e) => setUploadIsFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-teal-600 focus:ring-teal-500"
                />
                <span>Ghim nổi bật trên Cổng thông tin Công khai</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsUploadOpen(false);
                setSelectedFiles([]);
              }}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUploadSubmit}
              disabled={selectedFiles.length === 0 || isUploading}
              className="gap-2 bg-teal-600 hover:bg-teal-500"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Bắt đầu tải lên CSDL
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL CHỈNH SỬA METADATA & DANH MỤC */}
      {editItem && (
        <Modal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          title={`Chỉnh sửa thông tin & Danh mục: ${editItem.originalName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <img
                src={editItem.url}
                alt={editItem.originalName}
                className="w-16 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
              />
              <div className="truncate">
                <span className="text-slate-400 block text-[10px]">Tên tệp gốc</span>
                <strong className="text-white font-mono block truncate">{editItem.filename}</strong>
                <span className="text-teal-400 font-mono text-[10px]">{formatFileSize(editItem.size)}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tiêu đề bài viết / Hình ảnh</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Phân loại Danh mục / Album</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CREATE_NEW" className="font-bold text-amber-400">
                  + Tạo danh mục mới...
                </option>
              </select>

              {editCategory === 'CREATE_NEW' && (
                <div className="mt-2 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục mới..."
                    value={editNewCategory}
                    onChange={(e) => setEditNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mô tả nội dung chi tiết</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Chú thích tác quyền (Caption)</label>
              <input
                type="text"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-2">
              <label className="text-slate-300 font-bold flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-teal-600 focus:ring-teal-500"
                />
                <span>Ghim nổi bật trên Cổng thông tin Công khai</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setEditItem(null)} disabled={isSavingEdit}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5"
              >
                {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Lưu thay đổi CSDL
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL PREVIEW LIGHTBOX */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={`Chi tiết hình ảnh: ${previewItem.title || previewItem.originalName}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2 min-h-[300px] max-h-[500px]">
              {previewItem.mimeType.includes('pdf') ? (
                <iframe src={previewItem.url} className="w-full h-[450px] rounded-lg" title="PDF Preview" />
              ) : (
                <img
                  src={previewItem.url}
                  alt={previewItem.title || previewItem.originalName}
                  className="max-h-[460px] object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Tên tệp</span>
                <span className="font-bold text-white truncate block">{previewItem.filename}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dung lượng</span>
                <span className="font-mono text-emerald-400 font-bold">{formatFileSize(previewItem.size)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Danh mục</span>
                <span className="text-teal-400 font-bold">{previewItem.category || 'Khu Đa Phước'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nổi bật</span>
                <span className="text-amber-400 font-bold uppercase">
                  {previewItem.isFeatured ? 'ĐÃ GHIM' : 'BÌNH THƯỜNG'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={previewItem.url}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(previewItem.url, previewItem.id)}
                className="shrink-0 gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Sao chép URL
              </Button>
              <a
                href={previewItem.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors shrink-0"
                title="Mở tab mới"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL CONFIRM SINGLE DELETE */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xác nhận xóa tệp đa phương tiện"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-400 bg-rose-950/40 p-3.5 rounded-xl border border-rose-900/60">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-xs font-medium">
                Bạn có chắc chắn muốn xóa tệp <strong className="text-white">{deleteTarget.title || deleteTarget.originalName}</strong>? Hành động này sẽ xóa vĩnh viễn khỏi CSDL và máy chủ.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteMedia}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Xóa vĩnh viễn
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL CONFIRM BATCH DELETE */}
      {isBatchDeleteOpen && (
        <Modal
          isOpen={isBatchDeleteOpen}
          onClose={() => setIsBatchDeleteOpen(false)}
          title={`Xác nhận xóa hàng loạt ${selectedIds.length} tệp đa phương tiện`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-400 bg-rose-950/40 p-3.5 rounded-xl border border-rose-900/60">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-xs font-medium">
                Bạn có chắc chắn muốn xóa <strong className="text-white">{selectedIds.length} tệp đã chọn</strong>? Tất cả các tệp này sẽ bị xóa khỏi CSDL và ổ đĩa máy chủ không thể khôi phục.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsBatchDeleteOpen(false)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Đồng ý xóa {selectedIds.length} tệp
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Flipbook Preview Modal */}
      <Modal
        isOpen={isFlipbookOpen}
        onClose={() => setIsFlipbookOpen(false)}
        title="Xem trước Ấn phẩm Sách lật Điện tử 3D (Interactive Flipbook)"
        maxWidth="4xl"
      >
        <div className="space-y-4 text-center">
          <div className="p-12 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 font-serif shadow-inner">
            <h3 className="text-xl font-bold text-emerald-400">ẤN PHẨM THÔNG TIN KHOA HỌC & MÔI TRƯỜNG MBS</h3>
            <p className="text-xs text-slate-400 mt-2">
              Bản tin số hóa tương tác đa phương tiện • Ban Quản lý MBS TP.HCM
            </p>
            <div className="w-32 h-1 bg-emerald-500 mx-auto my-6"></div>
            <p className="text-sm italic">Trang 1 / 32 • Bấm kéo góc trang để lật sách</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
