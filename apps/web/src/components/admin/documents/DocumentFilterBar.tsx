import React from 'react';
import { Search, PieChart as PieIcon, RotateCcw, SlidersHorizontal } from 'lucide-react';

export interface DocumentFilterBarProps {
  searchKeyword: string;
  onSearchKeywordChange: (val: string) => void;
  filterDocType: string;
  onFilterDocTypeChange: (val: string) => void;
  filterAgency: string;
  onFilterAgencyChange: (val: string) => void;
  filterYear: string;
  onFilterYearChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onOpenAnalyticsModal: () => void;
  onResetFilters: () => void;
  onOpenNewDoc?: () => void;
  documentTypes: string[];
  issuingAgencies: string[];
  availableYears: string[];
}

export const DocumentFilterBar: React.FC<DocumentFilterBarProps> = ({
  searchKeyword,
  onSearchKeywordChange,
  filterDocType,
  onFilterDocTypeChange,
  filterAgency,
  onFilterAgencyChange,
  filterYear,
  onFilterYearChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  onOpenAnalyticsModal,
  onResetFilters,
  documentTypes,
  issuingAgencies,
  availableYears,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-2xl space-y-4 backdrop-blur-md">
      {/* Top Row: Search input + Analytics Modal Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            placeholder="Tìm kiếm nhanh theo số hiệu, trích yếu, người ký..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none bg-slate-950 text-white placeholder-slate-500 transition-all shadow-inner"
          />
        </div>

        {/* Analytics Button - Styled in Dark Teal (No White Background) */}
        <button
          onClick={onOpenAnalyticsModal}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-300 hover:text-teal-100 transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 cursor-pointer shrink-0 active:scale-98"
        >
          <PieIcon className="w-4 h-4 text-teal-400 shrink-0" />
          <span>📊 Thống kê & Phân tích</span>
        </button>
      </div>

      {/* Bottom Row: Multi-Criteria Filter Dropdowns & Reset */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium shrink-0 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden md:inline">Bộ lọc:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Doc Type Filter */}
          <select
            value={filterDocType}
            onChange={(e) => onFilterDocTypeChange(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-teal-500 focus:outline-none font-medium cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <option value="Tất cả">Tất cả loại văn bản</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Agency Filter */}
          <select
            value={filterAgency}
            onChange={(e) => onFilterAgencyChange(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-teal-500 focus:outline-none font-medium cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <option value="Tất cả">Tất cả cơ quan ban hành</option>
            {issuingAgencies.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={filterYear}
            onChange={(e) => onFilterYearChange(e.target.value)}
            className="min-w-[110px] px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-teal-500 focus:outline-none font-medium cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <option value="Tất cả">Tất cả năm</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Năm {yr}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="min-w-[140px] px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-teal-500 focus:outline-none font-medium cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="PENDING_REVIEW">Chờ duyệt</option>
            <option value="SCHEDULED">Hẹn giờ xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="REJECTED">Bị trả lại</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="min-w-[170px] px-3 py-2 text-xs rounded-xl border border-teal-800/80 bg-teal-950/40 text-teal-300 focus:border-teal-400 focus:outline-none font-bold cursor-pointer hover:bg-teal-950/60 transition-colors"
          >
            <option value="newest">Sắp xếp: Mới nhất (Hàng 1)</option>
            <option value="oldest">Sắp xếp: Cũ nhất</option>
            <option value="code_asc">Số hiệu (A - Z)</option>
            <option value="code_desc">Số hiệu (Z - A)</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={onResetFilters}
          type="button"
          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer shrink-0"
          title="Đặt lại tất cả bộ lọc"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


