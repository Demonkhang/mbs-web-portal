import React, { useState } from 'react';
import { AlertTriangle, Upload, CheckCircle2, MapPin, Phone, User, Mail, Send, Camera } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    facility: 'Khu LHXLCT Đa Phước (Bình Chánh)',
    category: 'o-nhiem-mui',
    location: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.senderName || !formData.senderPhone || !formData.description) {
      showToast('Thiếu thông tin', 'Vui lòng điền các trường bắt buộc (*)', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticket = `PA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCode(ticket);
      showToast('Đã tiếp nhận phản ánh!', `Mã phản ánh: ${ticket}`, 'success');
    }, 1200);
  };

  const handleReset = () => {
    setSubmittedCode(null);
    setFormData({
      title: '',
      senderName: '',
      senderPhone: '',
      senderEmail: '',
      facility: 'Khu LHXLCT Đa Phước (Bình Chánh)',
      category: 'o-nhiem-mui',
      location: '',
      description: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Gửi phản ánh - Kiến nghị vi phạm môi trường" maxWidth="xl">
      {submittedCode ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Gửi phản ánh thành công!</h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Ban Quản lý MBS đã tiếp nhận thông tin phản ánh của Quý công dân. Cán bộ trực ban thanh tra môi trường sẽ tiến hành xác minh và phản hồi kết quả trong vòng 24 - 48 giờ.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl inline-block text-center font-mono">
            <span className="text-xs text-slate-500 block">MÃ TRA CỨU TIẾN ĐỘ XỬ LÝ</span>
            <strong className="text-xl font-black text-emerald-800 tracking-wider">{submittedCode}</strong>
          </div>
          <div>
            <Button variant="primary" onClick={handleReset} className="w-full sm:w-auto px-8">
              Đóng cửa sổ
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Cổng tiếp nhận thông tin phản ánh về mùi hôi, nước rỉ rác, phương tiện thu gom không bảo đảm vệ sinh tại các Khu liên hợp xử lý rác TP.HCM.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên người gửi *</label>
              <input
                type="text"
                required
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại liên lạc *</label>
              <input
                type="tel"
                required
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="VD: 0912345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khu vực / Khu liên hợp *</label>
              <select
                value={formData.facility}
                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option>Khu LHXLCT Đa Phước (Bình Chánh)</option>
                <option>Khu LHXLCT Phước Hiệp (Tây Bắc Củ Chi)</option>
                <option>Tuyến đường vận chuyển rác thải</option>
                <option>Trạm trung chuyển rác</option>
                <option>Khu vực giáp ranh khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vấn đề phản ánh *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="o-nhiem-mui">Phát sinh mùi hôi nồng độ cao</option>
                <option value="nuoc-ri-rac">Rò rỉ nước rỉ rác ra nguồn nước</option>
                <option value="tieng-on-khoi-bui">Tiếng ồn / Khói bụi / Cháy</option>
                <option value="xe-van-chuyen">Xe chở rác làm rơi vãi trên đường</option>
                <option value="khac">Vấn đề môi trường khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề phản ánh ngắn gọn *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="VD: Mùi hôi xuất hiện vào khung giờ 19h-21h tại xã Phong Phú"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung chi tiết & Thời điểm xảy ra *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Mô tả cụ thể vị trí, thời gian xuất hiện, mức độ ảnh hưởng..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh chụp / Video hiện trường (nếu có)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-xs text-slate-600 block">Kéo thả hoặc nhấn để chọn tệp hình ảnh / video</span>
              <span className="text-[10px] text-slate-400">PNG, JPG, MP4 tối đa 50MB</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="gap-1.5">
              <Send className="w-4 h-4" />
              <span>Gửi phản ánh ngay</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
