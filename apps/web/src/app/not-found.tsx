import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-full text-sm mb-4">
        Lỗi 404
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Trang không tồn tại</h1>
      <p className="text-slate-600 max-w-md mb-6">
        Địa chỉ trang bạn tìm kiếm không có sẵn hoặc đã được di chuyển sang mục khác trên Cổng thông tin MBS.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-md transition-all"
      >
        Trở về Trang chủ
      </a>
    </div>
  );
}
