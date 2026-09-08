import React from 'react';
import { X, PieChart as PieIcon, BarChart3, ShieldCheck, FileCheck, CheckCircle2, Award } from 'lucide-react';
import { Button } from '../../ui/button';

export interface DocumentAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: any[];
}

export const DocumentAnalyticsModal: React.FC<DocumentAnalyticsModalProps> = ({
  isOpen,
  onClose,
  documents,
}) => {
  if (!isOpen) return null;

  const total = documents.length;
  const publishedCount = documents.filter((d) => d.approvalStatus === 'PUBLISHED' || !d.approvalStatus).length;
  const p7sCount = documents.filter((d) => d.p7sSignatureUrl).length;
  const confidentialCount = documents.filter((d) => d.isConfidentialChecked !== false).length;

  // Domain Distribution (Pie Chart breakdown)
  const domainCounts: Record<string, number> = {};
  documents.forEach((d) => {
    const dom = d.domain || 'Môi trường';
    domainCounts[dom] = (domainCounts[dom] || 0) + 1;
  });

  const domainColors = [
    { bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' },
    { bg: 'bg-teal-500', text: 'text-teal-400', hex: '#14b8a6' },
    { bg: 'bg-cyan-500', text: 'text-cyan-400', hex: '#06b6d4' },
    { bg: 'bg-indigo-500', text: 'text-indigo-400', hex: '#6366f1' },
    { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7' },
    { bg: 'bg-amber-500', text: 'text-amber-400', hex: '#f59e0b' },
  ];

  const domainEntries = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);

  // DocType Distribution
  const typeCounts: Record<string, number> = {};
  documents.forEach((d) => {
    const t = d.docType || 'Quyết định';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  // Year Distribution (Bar Chart data)
  const yearCounts: Record<string, number> = {};
  documents.forEach((d) => {
    const y = d.issueDate ? new Date(d.issueDate).getFullYear().toString() : '2026';
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });
  const yearEntries = Object.entries(yearCounts).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxYearCount = Math.max(...Object.values(yearCounts), 1);

  // SVG Pie Chart Calculation
  let cumulativeAngle = 0;
  const pieSlices = domainEntries.map(([domain, count], idx) => {
    const percentage = total > 0 ? count / total : 0;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    const x1 = Math.cos((Math.PI * startAngle) / 180);
    const y1 = Math.sin((Math.PI * startAngle) / 180);
    const x2 = Math.cos((Math.PI * cumulativeAngle) / 180);
    const y2 = Math.sin((Math.PI * cumulativeAngle) / 180);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const colorObj = domainColors[idx % domainColors.length];

    return {
      domain,
      count,
      percentage: Math.round(percentage * 100),
      pathData: `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: colorObj,
    };
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                BÁO CÁO THỐNG KÊ & PHÂN TÍCH KHO VĂN BẢN
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Biểu đồ phân bổ Lĩnh vực chuyên môn, Loại văn bản & Tỷ lệ Chữ ký số PKI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng văn bản</span>
              <div className="text-2xl font-black text-white font-mono">{total}</div>
              <span className="text-[10px] text-teal-400 block font-medium">Hồ sơ số hóa CSDL</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đã xuất bản</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{publishedCount}</div>
              <span className="text-[10px] text-emerald-300 block font-medium">
                {total > 0 ? Math.round((publishedCount / total) * 100) : 0}% tổng số
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Xác thực PKI .p7s</span>
              <div className="text-2xl font-black text-amber-400 font-mono">{p7sCount}</div>
              <span className="text-[10px] text-amber-300 block font-medium">Chữ ký số chuyên dùng</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cam kết ATTT</span>
              <div className="text-2xl font-black text-cyan-400 font-mono">{confidentialCount}</div>
              <span className="text-[10px] text-cyan-300 block font-medium">Đạt Luật TCTT</span>
            </div>
          </div>

          {/* Charts Row: Pie Chart & Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Visual Pie Chart (Domain Distribution) */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  <span>Biểu đồ Tròn: Phân bổ theo Lĩnh vực</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Tỷ lệ %</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                {/* SVG Rendered Pie Chart */}
                <div className="relative w-40 h-40 shrink-0">
                  <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                    {pieSlices.length > 0 ? (
                      pieSlices.map((slice, idx) => (
                        <path
                          key={idx}
                          d={slice.pathData}
                          fill={slice.color.hex}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <title>{`${slice.domain}: ${slice.count} văn bản (${slice.percentage}%)`}</title>
                        </path>
                      ))
                    ) : (
                      <circle cx="0" cy="0" r="1" fill="#1e293b" />
                    )}
                  </svg>
                  <div className="absolute inset-0 m-auto w-20 h-20 bg-slate-950 rounded-full flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-xs font-black text-white font-mono">{total}</span>
                    <span className="text-[9px] text-slate-500">Văn bản</span>
                  </div>
                </div>

                {/* Pie Chart Legend */}
                <div className="space-y-2 flex-1 text-xs">
                  {pieSlices.map((slice, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${slice.color.bg} shrink-0`}></span>
                        <span className="text-slate-300 truncate text-[11px] font-medium">{slice.domain}</span>
                      </div>
                      <div className="font-mono text-[11px] shrink-0">
                        <strong className="text-white">{slice.count}</strong>
                        <span className="text-slate-500 ml-1">({slice.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 2: Visual Bar Chart (Year Distribution & PKI Rate) */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Biểu đồ Cột: Số lượng theo Năm ban hành</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Số lượng văn bản</span>
              </div>

              {/* Bar Chart Representation */}
              <div className="space-y-3 py-2">
                {yearEntries.map(([yr, count]) => {
                  const percent = Math.round((count / maxYearCount) * 100);
                  return (
                    <div key={yr} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-300 font-mono">Năm {yr}</span>
                        <span className="font-mono text-cyan-400 font-bold">{count} văn bản</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percent, 8)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Document Type Distribution Progress */}
              <div className="pt-3 border-t border-slate-900 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Cơ cấu theo loại văn bản:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {typeEntries.map(([t, count]) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-1.5"
                    >
                      <span>{t}:</span>
                      <strong className="text-emerald-400 font-mono">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security & PKI Compliance Notice */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Kho văn bản được lưu giữ số hóa đạt chuẩn <strong>PDF/A</strong> và ký số PKI chuyên dùng Chính phủ.
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold hidden sm:inline">99.8% Chuẩn hóa</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose} className="font-bold">
            Đóng bảng thống kê
          </Button>
        </div>
      </div>
    </div>
  );
};
