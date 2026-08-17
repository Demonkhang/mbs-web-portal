import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Tổng quan Hệ thống Quản trị (CMS Dashboard)</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Tổng bài viết</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">1,248</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Văn bản đã ban hành</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">452</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Hồ sơ DVC đã giải quyết</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">98.5%</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Phản ánh chưa xử lý</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">3</div>
        </div>
      </div>
    </div>
  );
}
