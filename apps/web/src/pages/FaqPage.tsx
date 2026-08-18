import React, { useState, useEffect, useMemo } from 'react';
import { Search, Send, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Accordion } from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';
import { fetchApi } from '../services/api-client';

export interface FaqPageProps {
  onNavigate: (path: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [questionSent, setQuestionSent] = useState(false);

  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [questionForm, setQuestionForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Quy trình tiếp nhận rác',
    question: '',
  });

  useEffect(() => {
    setIsLoading(true);
    // Fetch published FAQs from PostgreSQL DB API
    fetchApi<{ data: any[] }>('/v1/inquiries/faq')
      .then((res) => {
        if (res && res.data) {
          setFaqs(res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách FAQ:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchTopic = selectedTopic === 'Tất cả' || item.category === selectedTopic || item.topic === selectedTopic;
      const matchQuery =
        !searchQuery.trim() ||
        item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTopic && matchQuery;
    });
  }, [faqs, selectedTopic, searchQuery]);

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.name || !questionForm.phone || !questionForm.question) {
      showToast('Thiếu thông tin', 'Vui lòng nhập họ tên, số điện thoại và nội dung câu hỏi.', 'warning');
      return;
    }

    try {
      await fetchApi('/v1/inquiries/feedback', {
        method: 'POST',
        body: JSON.stringify({
          title: `[HỎI ĐÁP FAQ] ${questionForm.topic}`,
          senderName: questionForm.name,
          senderPhone: questionForm.phone,
          location: questionForm.email || 'N/A',
          photoUrl: '',
        }),
      });

      setQuestionSent(true);
      showToast('Đã gửi câu hỏi', 'Ban Quản lý MBS đã tiếp nhận và sẽ giải đáp qua email/điện thoại.', 'success');
    } catch (err: any) {
      showToast('Lỗi gửi câu hỏi', err.message || 'Không thể gửi câu hỏi', 'error');
    }
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
            Giải đáp các thắc mắc thường gặp của người dân và doanh nghiệp về quản lý, xử lý chất thải TP.HCM (CSDL PostgreSQL)
          </p>
        </div>

        {/* Search & Topic filter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi giải đáp trong CSDL PostgreSQL..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['Tất cả', 'Dịch vụ công', 'Xử lý rác thải', 'Môi trường & Mùi hôi', 'Phân loại rác tại nguồn'].map((topic) => (
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
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-3">
              CÂU HỎI & GIẢI ĐÁP PHỔ BIẾN ({filteredFaqs.length})
            </h3>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Đang tải danh sách câu hỏi FAQ từ CSDL PostgreSQL...
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Chưa có câu hỏi nào trong CSDL phù hợp với tìm kiếm của bạn.
              </div>
            ) : (
              <Accordion
                items={filteredFaqs.map((faq) => ({
                  id: faq.id,
                  title: faq.question || faq.title,
                  content: (
                    <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                        Chủ đề: {faq.category || faq.topic || 'Chung'}
                      </span>
                      <p>{faq.answer || faq.content}</p>
                    </div>
                  ),
                }))}
              />
            )}
          </div>

          {/* Form gửi câu hỏi trực tuyến */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-3">
              GỬI CÂU HỎI TRỰC TUYẾN TỚI BAN QUẢN LÝ MBS
            </h3>

            {questionSent ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Đã gửi câu hỏi thành công!</h4>
                <p className="text-xs text-slate-600">
                  Câu hỏi của bạn đã được lưu vào CSDL. Bộ phận Tiếp dân sẽ liên hệ giải đáp trong thời gian sớm nhất.
                </p>
                <Button size="sm" variant="outline" onClick={() => setQuestionSent(false)}>
                  Gửi câu hỏi khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendQuestion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên..."
                      value={questionForm.name}
                      onChange={(e) => setQuestionForm({ ...questionForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      placeholder="Nhập số điện thoại..."
                      value={questionForm.phone}
                      onChange={(e) => setQuestionForm({ ...questionForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email liên hệ</label>
                    <input
                      type="email"
                      placeholder="Nhập email..."
                      value={questionForm.email}
                      onChange={(e) => setQuestionForm({ ...questionForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold mb-1">Nội dung câu hỏi thắc mắc *</label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả chi tiết câu hỏi của bạn..."
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  <Send className="w-4 h-4" /> Gửi câu hỏi đến Ban Quản lý MBS
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
