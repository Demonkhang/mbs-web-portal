import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold text-emerald-400 mb-8">MBS CMS Admin</div>
          <nav className="space-y-2">
            <a href="/admin/dashboard" className="block px-4 py-2.5 rounded-lg bg-emerald-700 text-white font-medium">Dashboard</a>
            <a href="/admin/posts" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300">Bài viết</a>
            <a href="/admin/categories" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300">Chuyên mục</a>
            <a href="/admin/documents" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300">Văn bản</a>
            <a href="/admin/submissions" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300">Hồ sơ DVC</a>
            <a href="/admin/users" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300">Người dùng</a>
            <a href="/admin/audit-logs" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300">Nhật ký hệ thống</a>
          </nav>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
