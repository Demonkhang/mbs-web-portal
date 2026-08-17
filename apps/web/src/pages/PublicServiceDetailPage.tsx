import React, { useState } from 'react';
import { ArrowLeft, FilePlus2, Download, Clock, ShieldCheck, Building2, CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { MOCK_SERVICES } from '../lib/mock-data';
import { PublicService } from '../lib/types';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { OnlineSubmissionWizard } from '../components/shared/OnlineSubmissionWizard';
import { useToast } from '../components/ui/toast';

export interface PublicServiceDetailPageProps {
  id: string;
  onNavigate: (path: string) => void;
}

export const PublicServiceDetailPage: React.FC<PublicServiceDetailPageProps> = ({ id, onNavigate }) => {
  const { showToast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const service = MOCK_SERVICES.find((s) => s.id === id) || MOCK_SERVICES[0];

  const handleWizardSuccess = (code: string) => {
    setIsWizardOpen(false);
    onNavigate('/dich-vu-cong#tracking');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Dịch vụ công', href: '/dich-vu-cong' },
            { label: service.code },
          ]}
          onNavigate={onNavigate}
        />

        {/* Back Link */}
        <div>
          <button
            onClick={() => onNavigate('/dich-vu-cong')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách dịch vụ công</span>
          </button>
        </div>

        {isWizardOpen ? (
          <OnlineSubmissionWizard
            service={service}
            onSuccess={handleWizardSuccess}
            onCancel={() => setIsWizardOpen(false)}
          />
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="gov">DỊCH VỤ CÔNG MỨC ĐỘ {service.level}</Badge>
                  <span className="font-mono text-xs font-black px-3 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                    {service.code}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {service.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="shrink-0 pt-2 md:pt-0">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsWizardOpen(true)}
                  className="w-full sm:w-auto font-bold gap-2 shadow-lg"
                >
                  <FilePlus2 className="w-5 h-5" />
                  <span>Nộp hồ sơ trực tuyến</span>
                </Button>
              </div>
            </div>

            {/* Quick Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Thời hạn giải quyết:</span>
                <strong className="text-emerald-700 font-bold text-sm">{service.duration}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Phí / Lệ phí:</span>
                <strong className="text-slate-900 font-bold text-sm">{service.fee}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Cơ quan thực hiện:</span>
                <strong className="text-slate-900 font-bold">{service.implementationAgency}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Đối tượng thực hiện:</span>
                <strong className="text-slate-900 font-bold">{service.targetAudience}</strong>
              </div>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-700 rounded-xs"></span>
                Trình tự các bước thực hiện
              </h3>

              <div className="space-y-3">
                {service.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                    <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">
                      <strong className="font-bold text-slate-900 block">{typeof step === 'string' ? step : step.title}</strong>
                      {typeof step !== 'string' && <span className="text-slate-600 block mt-0.5">{step.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dossier Components Table */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-700 rounded-xs"></span>
                Thành phần hồ sơ yêu cầu
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-12 text-center">STT</th>
                      <th className="p-3.5">Tên thành phần hồ sơ</th>
                      <th className="p-3.5 w-32 text-center">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {service.dossierComponents.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5 font-medium text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{comp.name}</span>
                        </td>
                        <td className="p-3.5 text-center text-slate-600">{comp.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legal Foundation */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-700 rounded-xs"></span>
                Căn cứ pháp lý
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 pl-2">
                <li>Luật Bảo vệ môi trường số 72/2020/QH14 ngày 17/11/2020 của Quốc hội.</li>
                <li>Nghị định số 08/2022/NĐ-CP ngày 10/01/2022 của Chính phủ quy định chi tiết một số điều của Luật BVMT.</li>
                <li>Quyết định của Ủy ban nhân dân TP. Hồ Chí Minh ban hành Quy chế quản lý chất thải rắn trên địa bàn thành phố.</li>
              </ul>
            </div>

            {/* Bottom Floating CTA */}
            <div className="p-6 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold">Nộp hồ sơ trực tuyến thuận tiện 24/7</h4>
                <p className="text-xs text-emerald-200 mt-0.5">Tiết kiệm thời gian, theo dõi tiến độ qua tin nhắn và email tự động</p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsWizardOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shrink-0"
              >
                Bắt đầu kê khai hồ sơ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
