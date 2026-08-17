import React, { useState } from 'react';
import { AlertTriangle, Send, Search, CheckCircle2, Clock, MapPin, Camera, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export interface FeedbackPageProps {
  onNavigate: (path: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Search state
  const [searchTicket, setSearchTicket] = useState('PA-2026-4821');
  const [ticketResult, setTicketResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    facility: 'Khu LHXLCT Đa Phước (Bình Chánh)',
    category: 'Mùi hôi phát tán khu dân cư',
    location: '',
    timeOccurrence: 'Ban đêm (19h00 - 23h00)',
    content: '',
    agree: true,
  });

  const resolvedFeedbacks = [
    {
      code: 'PA-2026-4821',
      date: '14/02/2026',
      facility: 'Khu LHXLCT Đa Phước',
      issue: 'Phản ánh mùi hôi phát sinh vào khoảng 20h00 tại xã Phong Phú, Huyện Bình Chánh',
      status: 'Đã xử lý & Phản hồi',
      response: 'Ban Quản lý MBS đã cử Tổ công tác kiểm tra đột xuất tại ô chôn lấp số 3 và trạm xử lý nước rỉ rác. Đã yêu cầu đơn vị vận hành tăng cường gấp đôi tần suất phun xịt chế phẩm vi sinh khử mùi và phủ bạt HDPE dầy 1.5mm tại các diện tích hở. Kết quả đo kiểm AQI sau đó đạt chuẩn QCVN 05:2023.',
      officer: 'Đội Giám sát Hiện trường Đa Phước'
    },
    {
      code: 'PA-2026-4790',
      date: '10/02/2026',
      facility: 'Khu LHXLCT Phước Hiệp',
      issue: 'Xe chở rác rò rỉ nước rỉ rác trên Quốc lộ 22 hướng về bãi rác',
      status: 'Đã xử lý & Phản hồi',
      response: 'Ban Quản lý MBS đã trích xuất camera giám sát hành trình, xác định xe BKS 51C-987.xx vi phạm gioăng cao su thùng chứa; đã lập biên bản đình chỉ tiếp nhận phương tiện 07 ngày và yêu cầu đơn vị thu gom khắc phục sửa chữa kín khít.',
      officer: 'Phòng Giám sát Môi trường'
    },
    {
      code: 'PA-2026-4655',
      date: '02/02/2026',
      facility: 'Khu LHXLCT Đa Phước',
      issue: 'Đề nghị tăng cường cây xanh cách ly tại ranh giới khu xử lý chất thải',
      status: 'Đã xử lý & Phản hồi',
      response: 'Đã hoàn thành trồng bổ sung 2.500 cây keo lai và cây dầu rái tại dải phân cách sinh thái phía Đông Bắc, bảo đảm vành đai xanh cách ly 500m theo đúng quy hoạch được duyệt.',
      officer: 'Phòng Quản lý Kỹ thuật'
    }
  ];

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.content) {
      showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường có dấu sao (*)', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const code = `PA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(code);
      showToast('Tiếp nhận phản ánh thành công!', `Mã phiếu: ${code}`, 'success');
    }, 1200);
  };

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const found = resolvedFeedbacks.find((item) => item.code.toLowerCase() === searchTicket.trim().toLowerCase());
    if (found) {
      setTicketResult(found);
      showToast('Tìm thấy phản ánh', `Mã phản ánh: ${found.code}`, 'success');
    } else {
      setTicketResult({
        code: searchTicket.toUpperCase(),
        date: '16/02/2026',
        facility: 'Khu LHXLCT Đa Phước',
        issue: 'Phản ánh mùi hôi nồng độ cao',
        status: 'Đang xác minh hiện trường',
        response: 'Cán bộ trực ban thanh tra môi trường đã tiếp nhận thông tin và đang phối hợp với Tổ công tác đo kiểm khí thải thực địa.',
        officer: 'Tổ Trực ban 24/7'
      });
      showToast('Hồ sơ đang xử lý', 'Phản ánh đang trong quá trình xác minh hiện trường', 'info');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Cổng phản ánh & Kiến nghị môi trường' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Page Title */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            CỔNG TIẾP NHẬN PHẢN ÁNH - KIẾN NGHỊ MÔI TRƯỜNG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kênh tiếp nhận trực tuyến 24/7 về mùi hôi, nước rỉ rác, phương tiện thu gom và sự cố môi trường tại các Khu liên hợp xử lý chất thải TP.HCM
          </p>
        </div>

        {/* 3 Tabs */}
        <Tabs
          tabs={[
            { id: 'create', label: '1. Gửi phản ánh mới' },
            { id: 'track', label: '2. Tra cứu kết quả giải quyết' },
            { id: 'resolved', label: '3. Công khai kết quả xử lý' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* TAB 1: GỬI PHẢN ÁNH */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {submittedTicket ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Gửi phản ánh thành công!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  Cảm ơn Quý công dân đã chung tay bảo vệ môi trường thành phố. Tổ trực ban Giám sát Môi trường Ban Quản lý MBS sẽ xác minh và phản hồi kết quả trong thời gian sớm nhất.
                </p>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl inline-block">
                  <span className="text-xs text-slate-500 block">MÃ PHẢN ÁNH CỦA BẠN</span>
                  <strong className="text-2xl font-black text-emerald-800 font-mono">{submittedTicket}</strong>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        facility: 'Khu LHXLCT Đa Phước (Bình Chánh)',
                        category: 'Mùi hôi phát tán khu dân cư',
                        location: '',
                        timeOccurrence: 'Ban đêm (19h00 - 23h00)',
                        content: '',
                        agree: true,
                      });
                    }}
                  >
                    Gửi phản ánh khác
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 uppercase">
                    Thông tin phản ánh hiện trường
                  </h3>
                  <p className="text-xs text-slate-500">Mọi thông tin danh tính của người phản ánh đều được bảo mật tuyệt đối theo quy định pháp luật.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: Trần Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: 0908 123 456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email nhận kết quả</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="VD: email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Khu vực phản ánh *</label>
                    <select
                      value={formData.facility}
                      onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option>Khu LHXLCT Đa Phước (Bình Chánh)</option>
                      <option>Khu LHXLCT Phước Hiệp (Củ Chi)</option>
                      <option>Tuyến đường vận chuyển rác</option>
                      <option>Trạm trung chuyển rác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Loại sự cố / Vấn đề *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option>Mùi hôi phát tán khu dân cư</option>
                      <option>Rò rỉ nước rỉ rác</option>
                      <option>Xe chở rác không che chắn kín</option>
                      <option>Khói bụi / Nguy cơ cháy nổ</option>
                      <option>Vấn đề môi trường khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Khung giờ xuất hiện *</label>
                    <select
                      value={formData.timeOccurrence}
                      onChange={(e) => setFormData({ ...formData, timeOccurrence: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option>Ban đêm (19h00 - 23h00)</option>
                      <option>Sáng sớm (04h00 - 07h00)</option>
                      <option>Giữa trưa (11h00 - 14h00)</option>
                      <option>Cả ngày liên tục</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Địa điểm cụ thể ghi nhận *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="VD: Khu dân cư xã Phong Phú, gần cầu Ông Thìn, cách bãi rác 1.5km..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung phản ánh chi tiết *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Mô tả chi tiết mức độ nồng độ mùi hôi, hướng gió, thời lượng kéo dài..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh / Video minh chứng đính kèm</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">Kéo thả hoặc nhấn để chọn tệp hình ảnh / video</span>
                    <span className="text-[11px] text-slate-400">Định dạng JPG, PNG, MP4 tối đa 50MB</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>Cam kết thông tin trung thực, khách quan nhằm phục vụ công tác thanh kiểm tra môi trường.</span>
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="gap-2 font-bold shadow-md">
                    <Send className="w-4 h-4" />
                    <span>Gửi phản ánh môi trường</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRA CỨU TIẾN ĐỘ PHẢN ÁNH */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="max-w-2xl mx-auto text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900">TRA CỨU TÌNH TRẠNG XỬ LÝ PHẢN ÁNH</h3>
                <p className="text-xs sm:text-sm text-slate-500">Nhập mã phản ánh (dạng PA-2026-xxxx) đã nhận khi nộp đơn</p>
              </div>

              <form onSubmit={handleSearchTicket} className="max-w-md mx-auto flex gap-2 pt-2">
                <input
                  type="text"
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                  placeholder="VD: PA-2026-4821"
                  className="flex-1 px-4 py-2 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Button type="submit" variant="primary" size="md" className="font-bold">
                  Tra cứu
                </Button>
              </form>
            </div>

            {ticketResult && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                      {ticketResult.code}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 pt-1">{ticketResult.issue}</h4>
                  </div>
                  <Badge variant={ticketResult.status.includes('Đã xử lý') ? 'success' : 'warning'}>
                    {ticketResult.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                  <div><strong>Khu vực:</strong> {ticketResult.facility}</div>
                  <div><strong>Ngày tiếp nhận:</strong> <span className="font-mono">{ticketResult.date}</span></div>
                  <div className="sm:col-span-2"><strong>Đơn vị xác minh:</strong> {ticketResult.officer}</div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs sm:text-sm">
                  <strong className="text-emerald-900 block font-bold">KẾT QUẢ XỬ LÝ & PHẢN HỒI CHÍNH THỨC:</strong>
                  <p className="text-slate-800 leading-relaxed text-justify">
                    {ticketResult.response}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CÔNG KHAI KẾT QUẢ XỬ LÝ */}
        {activeTab === 'resolved' && (
          <div className="space-y-4">
            {resolvedFeedbacks.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                      {item.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    <span className="text-xs text-emerald-700 font-semibold">• {item.facility}</span>
                  </div>
                  <Badge variant="success">{item.status}</Badge>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Phản ánh: {item.issue}
                </p>

                <div className="p-4 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 space-y-1">
                  <strong className="text-emerald-800 block text-xs">Biện pháp xử lý của Ban Quản lý MBS:</strong>
                  <p className="leading-relaxed text-justify">{item.response}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
