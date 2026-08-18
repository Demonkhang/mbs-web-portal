import React, { useState, useEffect } from 'react';
import { Search, FilePlus2, Download, SearchCheck, ArrowRight, Building2, User } from 'lucide-react';
import { MOCK_SERVICES } from '../lib/mock-data';
import { PublicService, ApplicationRecord } from '../lib/types';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import { StepperStatus } from '../components/shared/StepperStatus';
import { OnlineSubmissionWizard } from '../components/shared/OnlineSubmissionWizard';
import { useToast } from '../components/ui/toast';
import { fetchApi } from '../services/api-client';

export interface PublicServicesPageProps {
  onNavigate: (path: string) => void;
  defaultTab?: string;
}

export const PublicServicesPage: React.FC<PublicServicesPageProps> = ({ onNavigate, defaultTab = 'services' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchService, setSearchService] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');

  // Online wizard state
  const [wizardService, setWizardService] = useState<PublicService | null>(null);

  // Application tracker state
  const [trackingCodeInput, setTrackingCodeInput] = useState('MBS-2026-8891');
  const [searchedRecord, setSearchedRecord] = useState<ApplicationRecord | null>(null);
  const [isSearchingApp, setIsSearchingApp] = useState(false);

  // Forms from DB
  const [formsList, setFormsList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch forms from PostgreSQL DB API
    fetchApi<{ data: any[] }>('/v1/submissions/forms')
      .then((res) => {
        if (res && res.data) setFormsList(res.data);
      })
      .catch(() => {});
  }, []);

  const filteredServices = MOCK_SERVICES.filter((s) => {
    const matchQuery =
      !searchService.trim() ||
      s.title.toLowerCase().includes(searchService.toLowerCase()) ||
      s.code.toLowerCase().includes(searchService.toLowerCase()) ||
      s.description.toLowerCase().includes(searchService.toLowerCase());
    const matchLevel = selectedLevel === 'all' || s.level.toString() === selectedLevel;
    const matchTarget = selectedTarget === 'all' || s.targetAudience.includes(selectedTarget);
    return matchQuery && matchLevel && matchTarget;
  });

  const handleSearchApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) {
      showToast('Vui lòng nhập mã biên nhận', 'Ví dụ: MBS-2026-8891 hoặc MBS-2026-9042', 'warning');
      return;
    }
    setIsSearchingApp(true);
    try {
      const res = await fetchApi<{ data: any }>(`/v1/submissions/track/${trackingCodeInput.trim()}`);
      if (res && res.data) {
        setSearchedRecord(res.data);
        showToast('Tra cứu thành công', `Tìm thấy hồ sơ ${res.data.trackingCode}`, 'success');
      } else {
        setSearchedRecord(null);
        showToast('Không tìm thấy hồ sơ', 'Vui lòng kiểm tra lại chính xác mã số biên nhận.', 'danger');
      }
    } catch (err: any) {
      setSearchedRecord(null);
      showToast('Lỗi tra cứu', err.message || 'Mã biên nhận không hợp lệ trong CSDL.', 'danger');
    } finally {
      setIsSearchingApp(false);
    }
  };

  const handleWizardSuccess = (newCode: string) => {
    setWizardService(null);
    setActiveTab('tracking');
    setTrackingCodeInput(newCode);
    setSearchedRecord({
      trackingCode: newCode,
      serviceName: wizardService?.title || 'Đề nghị cấp phép tiếp nhận chất thải',
      applicantName: 'Doanh nghiệp / Cá nhân Nộp hồ sơ',
      applicantPhone: '0908 123 456',
      applicantEmail: 'contact@mbs.hochiminhcity.gov.vn',
      submissionDate: new Date().toLocaleDateString('vi-VN'),
      expectedDate: '14 ngày làm việc',
      status: 'tiep-nhan',
      currentStep: 1,
      assignedOfficer: 'Hệ thống Một cửa điện tử',
      department: 'Phòng Quản lý Kỹ thuật MBS',
      statusText: 'Hồ sơ đã lưu thành công vào CSDL PostgreSQL và chuyển đến chuyên viên thụ lý.',
      history: [
        {
          time: new Date().toLocaleString('vi-VN'),
          title: 'Tiếp nhận hồ sơ trực tuyến',
          description: 'Hồ sơ đã gửi thành công qua Cổng Dịch vụ công.',
          officer: 'Hệ thống Một cửa điện tử',
          status: 'completed',
        },
      ],
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Dịch vụ công trực tuyến' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Page Title */}
        <div className="border-b-2 border-emerald-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hệ thống tiếp nhận, xử lý và trả kết quả hồ sơ cấp phép chuyên ngành xử lý chất thải (CSDL PostgreSQL)
          </p>
        </div>

        {/* Wizard Modal View */}
        {wizardService ? (
          <OnlineSubmissionWizard
            service={wizardService}
            onSuccess={handleWizardSuccess}
            onCancel={() => setWizardService(null)}
          />
        ) : (
          <div className="space-y-6">
            {/* 3 Main Tabs */}
            <Tabs
              tabs={[
                { id: 'services', label: 'Danh mục thủ tục DVC (Mức 3 & 4)' },
                { id: 'tracking', label: 'Tra cứu tiến độ hồ sơ theo mã' },
                { id: 'forms', label: 'Kho biểu mẫu & Hướng dẫn kê khai' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* TAB 1: SERVICES LIST */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                {/* Filter bar */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      placeholder="Tìm kiếm tên thủ tục, mã thủ tục (VD: TTHC-MBS-01, cấp phép...)"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="all">Tất cả Mức độ DVC</option>
                      <option value="3">Dịch vụ công Mức độ 3</option>
                      <option value="4">Dịch vụ công Mức độ 4 (Toàn trình)</option>
                    </select>

                    <select
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="all">Tất cả Đối tượng áp dụng</option>
                      <option value="Doanh nghiệp">Doanh nghiệp</option>
                      <option value="Cá nhân">Người dân / Hộ gia đình</option>
                    </select>
                  </div>
                </div>

                {/* Services List Cards */}
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {service.code}
                          </span>
                          <Badge variant="gov">DVC Mức độ {service.level}</Badge>
                          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                            {service.targetAudience}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {service.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-6 text-xs text-slate-500 pt-1 flex-wrap">
                          <span>Thời hạn giải quyết: <strong className="text-slate-800">{service.duration}</strong></span>
                          <span>Phí/Lệ phí: <strong className="text-emerald-700">{service.fee}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setWizardService(service)}
                          className="gap-1.5 justify-center text-xs"
                        >
                          <FilePlus2 className="w-4 h-4" /> Nộp hồ sơ trực tuyến
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate(`/dich-vu-cong/${service.id}`)}
                          className="gap-1.5 justify-center text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Xem hướng dẫn thủ tục <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TRACKING */}
            {activeTab === 'tracking' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="max-w-2xl mx-auto space-y-4 text-center">
                  <h3 className="text-lg font-black text-slate-900 uppercase">TRA CỨU TIẾN ĐỘ GIẢI QUYẾT HỒ SƠ</h3>
                  <p className="text-xs text-slate-500">
                    Nhập mã số biên nhận điện tử để tra cứu tiến độ xử lý và thông tin chuyên viên thụ lý từ CSDL PostgreSQL
                  </p>

                  <form onSubmit={handleSearchApplication} className="flex gap-2">
                    <input
                      type="text"
                      value={trackingCodeInput}
                      onChange={(e) => setTrackingCodeInput(e.target.value)}
                      placeholder="Mã biên nhận (VD: MBS-2026-8891)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Button type="submit" variant="primary" disabled={isSearchingApp} className="gap-1.5 shrink-0">
                      <SearchCheck className="w-4 h-4" /> {isSearchingApp ? 'Đang tra cứu...' : 'Tra cứu hồ sơ'}
                    </Button>
                  </form>
                </div>

                {searchedRecord && (
                  <div className="border-t border-slate-200 pt-6 space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block">Mã biên nhận:</span>
                        <strong className="text-emerald-800 font-mono text-sm">{searchedRecord.trackingCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Chuyên viên thụ lý:</span>
                        <strong className="text-slate-800">{searchedRecord.assignedOfficer}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Ngày tiếp nhận:</span>
                        <strong className="text-slate-800">{searchedRecord.submissionDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Ngày hẹn trả kết quả:</span>
                        <strong className="text-emerald-700">{searchedRecord.expectedDate}</strong>
                      </div>
                    </div>

                    {/* Stepper Status Visual */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <StepperStatus currentStep={searchedRecord.currentStep} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FORMS */}
            {activeTab === 'forms' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase pb-3 border-b border-slate-100">
                  DANH SÁCH BIỂU MẪU ĐƠN KÊ KHAI (CSDL POSTGRESQL)
                </h3>

                <div className="space-y-3">
                  {formsList.map((form) => (
                    <div
                      key={form.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:border-emerald-500 transition-colors"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{form.title}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">Mã biểu mẫu: {form.code}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showToast('Đang tải về', `Tải về biểu mẫu ${form.code}`, 'info')}
                        className="text-xs gap-1 border-slate-300 hover:bg-white"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" /> Tải mẫu WORD (.docx)
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
