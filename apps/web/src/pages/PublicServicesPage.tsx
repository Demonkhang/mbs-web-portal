import React, { useState } from 'react';
import { Search, FilePlus2, CheckCircle2, Clock, ShieldCheck, Download, SearchCheck, ArrowRight, FileText, Building2, User, HelpCircle } from 'lucide-react';
import { MOCK_SERVICES, MOCK_APPLICATIONS } from '../lib/mock-data';
import { PublicService, ApplicationRecord } from '../lib/types';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import { StepperStatus } from '../components/shared/StepperStatus';
import { OnlineSubmissionWizard } from '../components/shared/OnlineSubmissionWizard';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

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
  const [searchedRecord, setSearchedRecord] = useState<ApplicationRecord | null>(MOCK_APPLICATIONS[0]);
  const [isSearchingApp, setIsSearchingApp] = useState(false);

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

  const handleSearchApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) {
      showToast('Vui lòng nhập mã biên nhận', 'Ví dụ: MBS-2026-8891 hoặc MBS-2026-9042', 'warning');
      return;
    }
    setIsSearchingApp(true);
    setTimeout(() => {
      setIsSearchingApp(false);
      const found = MOCK_APPLICATIONS.find(
        (app) => app.trackingCode.toLowerCase() === trackingCodeInput.trim().toLowerCase()
      );
      if (found) {
        setSearchedRecord(found);
        showToast('Tra cứu thành công', `Tìm thấy hồ sơ ${found.trackingCode}`, 'success');
      } else {
        setSearchedRecord(null);
        showToast('Không tìm thấy hồ sơ', 'Vui lòng kiểm tra lại chính xác mã số biên nhận.', 'danger');
      }
    }, 600);
  };

  const handleWizardSuccess = (newCode: string) => {
    setWizardService(null);
    setActiveTab('tracking');
    setTrackingCodeInput(newCode);
    // Create a mock new application record
    setSearchedRecord({
      trackingCode: newCode,
      serviceName: wizardService?.title || 'Đề nghị cấp phép tiếp nhận chất thải',
      applicantName: 'Công ty Cổ phần Môi trường Đô thị Sài Gòn Xanh',
      applicantPhone: '0908 123 456',
      applicantEmail: 'contact@saigonxanh-env.vn',
      submissionDate: '17/02/2026',
      expectedDate: '03/03/2026',
      status: 'tiep-nhan',
      currentStep: 1,
      assignedOfficer: 'Nguyễn Văn Hùng',
      department: 'Phòng Quản lý Kỹ thuật',
      statusText: 'Hồ sơ đã được tiếp nhận qua Cổng DVC trực tuyến, đang phân công thẩm định.',
      history: [
        {
          time: '17/02/2026 09:00',
          title: 'Tiếp nhận hồ sơ trực tuyến',
          description: 'Hồ sơ đã gửi thành công qua Cổng Dịch vụ công.',
          officer: 'Hệ thống Một cửa điện tử',
          status: 'completed'
        }
      ]
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
            Hệ thống tiếp nhận, xử lý và trả kết quả hồ sơ cấp phép chuyên ngành xử lý chất thải cấp độ 3 và toàn trình cấp độ 4
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
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
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

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option value="all">Tất cả mức độ</option>
                      <option value="4">Mức độ 4 (Toàn trình)</option>
                      <option value="3">Mức độ 3 (Một phần)</option>
                    </select>

                    <select
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option value="all">Tất cả đối tượng</option>
                      <option value="Doanh nghiệp">Doanh nghiệp</option>
                      <option value="Chủ đầu tư">Chủ đầu tư</option>
                      <option value="Tổ chức">Tổ chức / Cá nhân</option>
                    </select>
                  </div>
                </div>

                {/* Services Cards */}
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="gov">MỨC ĐỘ {service.level}</Badge>
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {service.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Đối tượng: <strong>{service.targetAudience}</strong>
                          </span>
                        </div>

                        <h3
                          onClick={() => onNavigate(`/dich-vu-cong/${service.id}`)}
                          className="text-base sm:text-lg font-black text-slate-900 hover:text-emerald-800 cursor-pointer leading-snug transition-colors"
                        >
                          {service.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Thời gian: <strong>{service.duration}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Lệ phí: <strong>{service.fee}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 col-span-2 sm:col-span-1">
                            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span className="truncate">{service.implementationAgency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex flex-row lg:flex-col items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setWizardService(service)}
                          className="w-full lg:w-44 justify-center gap-2 font-bold shadow-md"
                        >
                          <FilePlus2 className="w-4 h-4" />
                          <span>Nộp hồ sơ trực tuyến</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate(`/dich-vu-cong/${service.id}`)}
                          className="w-full lg:w-44 justify-center text-xs font-bold"
                        >
                          Xem hướng dẫn chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: APPLICATION TRACKING */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                {/* Search Form */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                  <div className="max-w-2xl mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <SearchCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      TRA CỨU TIẾN ĐỘ THỤ LÝ HỒ SƠ ĐIỆN TỬ
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Nhập mã số biên nhận điện tử được cấp khi nộp hồ sơ hoặc nhận qua tin nhắn SMS/Email
                    </p>
                  </div>

                  <form onSubmit={handleSearchApplication} className="max-w-xl mx-auto flex gap-2 pt-2">
                    <input
                      type="text"
                      value={trackingCodeInput}
                      onChange={(e) => setTrackingCodeInput(e.target.value)}
                      placeholder="Nhập mã biên nhận (VD: MBS-2026-8891, MBS-2026-9042)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs uppercase"
                    />
                    <Button type="submit" variant="primary" size="md" isLoading={isSearchingApp} className="font-bold gap-1.5 shrink-0">
                      <Search className="w-4 h-4" />
                      <span>Tra cứu</span>
                    </Button>
                  </form>

                  <div className="text-center text-xs text-slate-400">
                    Mẫu thử nghiệm sẵn có: <button type="button" onClick={() => setTrackingCodeInput('MBS-2026-8891')} className="text-emerald-700 font-mono font-bold hover:underline">MBS-2026-8891</button> • <button type="button" onClick={() => setTrackingCodeInput('MBS-2026-9042')} className="text-emerald-700 font-mono font-bold hover:underline">MBS-2026-9042</button>
                  </div>
                </div>

                {/* Tracking Result View with Stepper */}
                {searchedRecord && (
                  <div className="space-y-6">
                    {/* Stepper Status Visualizer */}
                    <StepperStatus tracking={searchedRecord} />

                    {/* Detailed Application Information Card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">
                        Chi tiết thông tin hồ sơ
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="space-y-2">
                          <p><span className="text-slate-500">Thủ tục:</span> <strong>{searchedRecord.serviceName}</strong></p>
                          <p><span className="text-slate-500">Tổ chức nộp:</span> <strong>{searchedRecord.applicantName}</strong></p>
                          <p><span className="text-slate-500">Ngày nộp hồ sơ:</span> <strong className="font-mono">{searchedRecord.submissionDate}</strong></p>
                        </div>
                        <div className="space-y-2">
                          <p><span className="text-slate-500">Hẹn trả kết quả:</span> <strong className="font-mono text-emerald-700">{searchedRecord.expectedDate}</strong></p>
                          <p><span className="text-slate-500">Chuyên viên thụ lý:</span> <strong>{searchedRecord.assignedOfficer}</strong></p>
                          <p><span className="text-slate-500">Trạng thái hiện tại:</span> <span className="text-slate-700 italic">{searchedRecord.statusText}</span></p>
                        </div>
                      </div>

                      {searchedRecord.currentStep === 4 && (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>Kết quả giải quyết điện tử (Bản số ký số hợp lệ)</span>
                          </div>
                          <Button variant="primary" size="sm" className="text-xs">
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải Giấy phép điện tử</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DOWNLOADABLE FORMS */}
            {activeTab === 'forms' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                    KHO BIỂU MẪU ĐIỆN TỬ CHUYÊN NGÀNH
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tải về các mẫu tờ khai, đơn đề nghị chuẩn hóa phục vụ hoàn thiện thành phần hồ sơ nộp trực tuyến
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    {
                      name: 'Mẫu 01 - Đơn đề nghị cấp Giấy phép tiếp nhận và xử lý chất thải rắn sinh hoạt',
                      type: 'DOCX',
                      size: '48 KB',
                      code: 'BM-MBS-01/2026',
                    },
                    {
                      name: 'Mẫu 02 - Bảng tổng hợp kê khai danh sách phương tiện cuốn ép rác chuyên dùng',
                      type: 'XLSX',
                      size: '62 KB',
                      code: 'BM-MBS-02/2026',
                    },
                    {
                      name: 'Mẫu 03 - Bản cam kết bảo đảm quy chuẩn xả thải và phòng ngừa sự cố môi trường',
                      type: 'DOCX',
                      size: '35 KB',
                      code: 'BM-MBS-03/2026',
                    },
                    {
                      name: 'Mẫu 04 - Đề án thử nghiệm công nghệ xử lý tái chế chất thải rắn công nghiệp',
                      type: 'PDF',
                      size: '120 KB',
                      code: 'BM-MBS-04/2026',
                    },
                  ].map((form, i) => (
                    <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{form.name}</h4>
                        </div>
                        <span className="text-xs text-slate-400 font-mono block">Mã biểu mẫu: {form.code} • Định dạng: {form.type}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showToast('Tải biểu mẫu', `Đang tải ${form.name}...`, 'success')}
                        className="shrink-0 gap-1.5 text-xs font-bold text-emerald-800 border-emerald-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải tệp ({form.size})</span>
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
