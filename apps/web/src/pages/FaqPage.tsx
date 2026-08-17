import React, { useState } from 'react';
import { HelpCircle, Search, MessageSquare, Send, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Accordion } from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

export interface FaqPageProps {
  onNavigate: (path: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [questionSent, setQuestionSent] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Quy trình tiếp nhận rác',
    question: '',
  });

  const faqs = [
    {
      id: 'faq-1',
      topic: 'Quy trình tiếp nhận rác',
      title: 'Doanh nghiệp vận chuyển rác cần những điều kiện gì để được vào đổ rác tại bãi Đa Phước?',
      content: 'Doanh nghiệp cần có: (1) Giấy phép kinh doanh dịch vụ thu gom, vận chuyển chất thải rắn do cơ quan thẩm quyền cấp; (2) Phương tiện chuyên dùng (xe ép rác kín, có gắn định vị GPS và camera hành trình đạt chuẩn); (3) Hợp đồng dịch vụ tiếp nhận xử lý rác đã ký kết với Ban Quản lý MBS và đơn vị xử lý; (4) Giấy đăng ký xe và sổ đăng kiểm còn hạn sử dụng.'
    },
    {
      id: 'faq-2',
      topic: 'Môi trường & Mùi hôi',
      title: 'Ban Quản lý MBS áp dụng các biện pháp gì để kiểm soát mùi hôi tại các bãi rác?',
      content: 'Ban Quản lý MBS chỉ đạo thực hiện đồng bộ: (1) Phủ bạt HDPE dầy 1.5mm chống thấm và giữ khí mùi đối với 100% diện tích ô chôn lấp tạm ngưng tiếp nhận; (2) Lắp đặt giàn phun xịt tự động chế phẩm vi sinh khử mùi sinh học liên tục 24/7; (3) Thu gom triệt để và xử lý nước rỉ rác qua hệ thống lọc MBR + RO đạt cột A QCVN 40:2011; (4) Vận hành 18 trạm quan trắc tự động liên tục truyền dữ liệu về Sở TN&MT.'
    },
    {
      id: 'faq-3',
      topic: 'Dự án đốt rác phát điện',
      title: 'Tiến độ chuyển đổi công nghệ đốt rác phát điện (Waste-to-Energy) của TP.HCM ra sao?',
      content: 'Theo định hướng của Thành ủy và UBND TP.HCM, thành phố phấn đấu đến năm 2030 xử lý 100% chất thải rắn sinh hoạt bằng công nghệ đốt rác phát điện và tái chế. Hiện tại, các nhà máy đốt rác phát điện tại Khu Đa Phước và Khu Phước Hiệp (công suất từ 1.000 - 2.000 tấn/ngày mỗi nhà máy) đang hoàn tất giai đoạn hiệu chỉnh lắp đặt thiết bị và đốt thử nghiệm kỹ thuật.'
    },
    {
      id: 'faq-4',
      topic: 'Dịch vụ công & Hồ sơ',
      title: 'Thời gian giải quyết hồ sơ cấp Giấy phép tiếp nhận chất thải rắn sinh hoạt là bao lâu?',
      content: 'Theo quy chế Dịch vụ công trực tuyến của Ban Quản lý MBS, thời gian giải quyết cấp phép trực tuyến là 10 ngày làm việc (kể từ ngày nhận đủ hồ sơ hợp lệ trên Cổng DVC). Doanh nghiệp có thể theo dõi tiến độ giải quyết trực tiếp qua Mã biên nhận điện tử hoặc nhận thông báo qua SMS/Email.'
    },
    {
      id: 'faq-5',
      topic: 'Phân loại rác tại nguồn',
      title: 'Người dân và cơ sở sản xuất cần phân loại rác thải như thế nào theo Luật BVMT 2020?',
      content: 'Chất thải rắn sinh hoạt từ hộ gia đình, cá nhân được phân chia thành 03 nhóm chính: (1) Chất thải rắn có khả năng tái sử dụng, tái chế; (2) Chất thải thực phẩm (rác hữu cơ, thức ăn thừa); (3) Chất thải rắn sinh hoạt khác. Ban Quản lý MBS phối hợp với các quận/huyện tiếp nhận và xử lý riêng biệt theo từng dòng công nghệ phù hợp.'
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchTopic = selectedTopic === 'Tất cả' || item.topic === selectedTopic;
    const matchQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTopic && matchQuery;
  });

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.name || !questionForm.phone || !questionForm.question) {
      showToast('Thiếu thông tin', 'Vui lòng nhập họ tên, số điện thoại và nội dung câu hỏi.', 'warning');
      return;
    }
    setQuestionSent(true);
    showToast('Đã gửi câu hỏi', 'Ban Quản lý MBS sẽ giải đáp qua email/điện thoại trong 48h.', 'success');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Hỏi đáp - FAQ' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Header */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            HỎI ĐÁP & HƯỚNG DẪN QUY CHUẨN MÔI TRƯỜNG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giải đáp các thắc mắc thường gặp của người dân và doanh nghiệp về quản lý, xử lý chất thải TP.HCM
          </p>
        </div>

        {/* Search & Topic filter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi giải đáp (VD: đốt rác phát điện, bãi Đa Phước, điều kiện tiếp nhận...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['Tất cả', 'Quy trình tiếp nhận rác', 'Môi trường & Mùi hôi', 'Dự án đốt rác phát điện', 'Dịch vụ công & Hồ sơ', 'Phân loại rác tại nguồn'].map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items (Accordion) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-3">
              CÂU HỎI & GIẢI ĐÁP PHỔ BIẾN ({filteredFaqs.length})
            </h3>

            <Accordion
              items={filteredFaqs.map((faq) => ({
                id: faq.id,
                title: faq.title,
                content: (
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                      Chủ đề: {faq.topic}
                    </span>
                    <p>{faq.content}</p>
                  </div>
                ),
              }))}
            />
          </div>
        </div>

        {/* Question Submission Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              Gửi câu hỏi mới tới Ban Quản lý MBS
            </h3>
            <p className="text-xs text-slate-500">Chưa tìm thấy thông tin bạn cần? Hãy gửi câu hỏi trực tiếp cho đội ngũ chuyên viên giải đáp.</p>
          </div>

          {questionSent ? (
            <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Đã gửi câu hỏi thành công!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Cảm ơn bạn. Bộ phận chuyên môn sẽ tổng hợp và phản hồi giải đáp qua số điện thoại hoặc email bạn đã cung cấp.
              </p>
              <Button variant="outline" size="sm" onClick={() => setQuestionSent(false)}>
                Gửi câu hỏi khác
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={questionForm.name}
                    onChange={(e) => setQuestionForm({ ...questionForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="VD: Nguyễn Văn B"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={questionForm.phone}
                    onChange={(e) => setQuestionForm({ ...questionForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="VD: 0987 654 321"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề câu hỏi</label>
                  <select
                    value={questionForm.topic}
                    onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    <option>Quy trình tiếp nhận rác</option>
                    <option>Môi trường & Mùi hôi</option>
                    <option>Dự án đốt rác phát điện</option>
                    <option>Dịch vụ công & Hồ sơ</option>
                    <option>Chủ đề khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung câu hỏi *</label>
                <textarea
                  required
                  rows={4}
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Nhập nội dung thắc mắc hoặc kiến nghị cần giải đáp..."
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="md" className="gap-2 font-bold">
                  <Send className="w-4 h-4" />
                  <span>Gửi câu hỏi giải đáp</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
