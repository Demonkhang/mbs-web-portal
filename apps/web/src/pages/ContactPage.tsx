import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Building2, ShieldCheck, Navigation } from 'lucide-react';
import { SITE_INFO } from '../lib/constants';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

export interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [formSent, setFormSent] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    org: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.message) {
      showToast('Thiếu thông tin', 'Vui lòng điền họ tên, số điện thoại và nội dung tin nhắn.', 'warning');
      return;
    }
    setFormSent(true);
    showToast('Gửi liên hệ thành công', 'Ban Quản lý MBS sẽ phản hồi trong thời gian sớm nhất.', 'success');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Liên hệ & Bản đồ' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Page Title */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            THÔNG TIN LIÊN HỆ & BẢN ĐỒ VỊ TRÍ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Trụ sở chính cơ quan Ban Quản lý MBS và các Trạm điều hành giám sát hiện trường 24/7
          </p>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Headquarters */}
          <div className="bg-white rounded-2xl p-6 border-2 border-emerald-600 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                TRỤ SỞ CHÍNH
              </span>
              <h3 className="text-base font-bold text-slate-900">Ban Quản lý các Khu LHXLCT TP.HCM</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{SITE_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-mono font-bold text-slate-900">{SITE_INFO.hotline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-mono">{SITE_INFO.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Thứ Hai - Thứ Sáu: 07:30 - 17:00</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Tiếp nhận hồ sơ DVC & Công văn</span>
            </div>
          </div>

          {/* Station 1: Da Phuoc */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                TRẠM HIỆN TRƯỜNG 24/7
              </span>
              <h3 className="text-base font-bold text-slate-900">Trạm Giám sát Đa Phước (Bình Chánh)</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>QL50, Xã Đa Phước, Huyện Bình Chánh, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="font-mono font-bold text-slate-900">028 3778 1234</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="text-emerald-700 font-bold">Trực ban tiếp nhận rác 24/7</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Kiểm soát cân xe & Quan trắc tự động</span>
            </div>
          </div>

          {/* Station 2: Phuoc Hiep */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-teal-100 text-teal-800">
                TRẠM HIỆN TRƯỜNG 24/7
              </span>
              <h3 className="text-base font-bold text-slate-900">Trạm Giám sát Phước Hiệp (Củ Chi)</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>Ấp 4, Xã Phước Hiệp, Huyện Củ Chi, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-mono font-bold text-slate-900">028 3792 5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="text-emerald-700 font-bold">Trực ban tiếp nhận rác 24/7</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Kiểm soát phân loại rác & Công nghệ tái chế</span>
            </div>
          </div>
        </div>

        {/* Contact Form & Simulated Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                GỬI THƯ LIÊN HỆ & CÔNG TÁC
              </h3>
              <p className="text-xs text-slate-500">Ban Biên tập và Văn phòng sẽ tiếp nhận và chuyển các phòng chuyên môn xử lý.</p>
            </div>

            {formSent ? (
              <div className="p-8 text-center bg-emerald-50 rounded-xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Gửi thư liên hệ thành công!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Cảm ơn Quý cơ quan, tổ chức đã liên hệ. Văn phòng Ban Quản lý MBS sẽ hồi đáp qua thông tin liên lạc được cung cấp.
                </p>
                <Button variant="outline" size="sm" onClick={() => setFormSent(false)}>
                  Gửi thư khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: Trần Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cơ quan / Doanh nghiệp</label>
                    <input
                      type="text"
                      value={contactForm.org}
                      onChange={(e) => setContactForm({ ...contactForm, org: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: Công ty Môi trường Xanh"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: 0908 123 456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Thư điện tử (Email)</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: email@domain.vn"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề liên hệ *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="VD: Đề nghị phối hợp khảo sát công nghệ xử lý chất thải"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Nội dung trao đổi, đề xuất công tác..."
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" size="md" className="gap-2 font-bold">
                    <Send className="w-4 h-4" />
                    <span>Gửi tin nhắn liên hệ</span>
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Map Simulation & Directions (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase border-b border-slate-100 pb-3">
                BẢN ĐỒ VỊ TRÍ CƠ QUAN
              </h3>

              {/* Styled Vector/Visual Map Preview */}
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-64 relative flex items-center justify-center text-center p-6 shadow-inner">
                {/* Background Map Graphic Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="relative z-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto ring-4 ring-emerald-400/40 animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Trụ sở Ban Quản lý MBS</h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    {SITE_INFO.address}
                  </p>
                </div>
              </div>

              {/* Directions Guide */}
              <div className="space-y-2 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Navigation className="w-4 h-4 text-emerald-700" />
                  <span>Chỉ dẫn đường đi:</span>
                </div>
                <p className="leading-relaxed">
                  Từ Trung tâm Quận 1 theo hướng đường Nguyễn Thị Minh Khai rẽ vào Trụ sở Sở Tài nguyên và Môi trường TP.HCM. Bãi đỗ xe ô tô và xe máy dành cho khách liên hệ công tác được bố trí tại cổng bảo vệ chính.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">Đường dây nóng hỗ trợ khẩn cấp:</span>
              <strong className="text-base font-black text-emerald-800 font-mono">1900 8888 68</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
