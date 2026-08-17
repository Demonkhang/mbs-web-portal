import React, { useState } from 'react';
import { Activity, Wind, Droplets, Flame, CheckCircle, AlertTriangle, RefreshCw, BarChart2, ShieldCheck, MapPin } from 'lucide-react';
import { SITE_INFO } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';

export const EnvironmentalMonitoring: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeFacility, setActiveFacility] = useState<'da-phuoc' | 'phuoc-hiep'>('da-phuoc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Vừa xong (10 giây trước)');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated('Vừa cập nhật trực tiếp');
      showToast('Đã đồng bộ dữ liệu quan trắc', 'Dữ liệu cảm biến 18 trạm đo tự động đã được làm mới.', 'success');
    }, 800);
  };

  const stationsData = {
    'da-phuoc': {
      name: 'Khu Liên Hợp Xử Lý Chất Thải Đa Phước',
      location: 'Xã Đa Phước, Huyện Bình Chánh, TP.HCM',
      area: '128 ha',
      currentIntake: '6.480 / 6.500 tấn/ngày (99.7%)',
      sensors: [
        { name: 'Chỉ số AQI (Không khí)', value: '42', unit: 'AQI', status: 'Tốt', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN 05:2023 ≤ 100' },
        { name: 'Bụi mịn PM2.5', value: '18.4', unit: 'µg/m³', status: 'Đạt chuẩn', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN ≤ 50 µg/m³' },
        { name: 'Khí H2S (Mùi lưu huỳnh)', value: '0.012', unit: 'mg/m³', status: 'Rất thấp', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN ≤ 0.042 mg/m³' },
        { name: 'Khí NH3 (Amoniac)', value: '0.045', unit: 'mg/m³', status: 'Bình thường', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN ≤ 0.20 mg/m³' },
        { name: 'Nước xả thải COD', value: '48.2', unit: 'mg/L', status: 'Cột A', color: 'text-teal-600', bg: 'bg-teal-50', limit: 'QCVN 40:2011 ≤ 75 mg/L' },
        { name: 'Nước xả thải BOD5', value: '14.6', unit: 'mg/L', status: 'Cột A', color: 'text-teal-600', bg: 'bg-teal-50', limit: 'QCVN 40:2011 ≤ 30 mg/L' },
      ]
    },
    'phuoc-hiep': {
      name: 'Khu Liên Hợp Xử Lý Chất Thải Phước Hiệp (Tây Bắc)',
      location: 'Xã Phước Hiệp, Huyện Củ Chi, TP.HCM',
      area: '687 ha',
      currentIntake: '3.820 / 4.000 tấn/ngày (95.5%)',
      sensors: [
        { name: 'Chỉ số AQI (Không khí)', value: '38', unit: 'AQI', status: 'Tốt', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN 05:2023 ≤ 100' },
        { name: 'Bụi mịn PM2.5', value: '14.2', unit: 'µg/m³', status: 'Đạt chuẩn', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN ≤ 50 µg/m³' },
        { name: 'Khí H2S (Mùi lưu huỳnh)', value: '0.008', unit: 'mg/m³', status: 'Rất thấp', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN ≤ 0.042 mg/m³' },
        { name: 'Khí NH3 (Amoniac)', value: '0.032', unit: 'mg/m³', status: 'Bình thường', color: 'text-emerald-600', bg: 'bg-emerald-50', limit: 'QCVN ≤ 0.20 mg/m³' },
        { name: 'Nước xả thải COD', value: '39.5', unit: 'mg/L', status: 'Cột A', color: 'text-teal-600', bg: 'bg-teal-50', limit: 'QCVN 40:2011 ≤ 75 mg/L' },
        { name: 'Nhiệt độ lò đốt thử nghiệm', value: '1.085', unit: '°C', status: 'Chuẩn WtE', color: 'text-amber-600', bg: 'bg-amber-50', limit: 'QCVN 61-MT:2016 ≥ 1.050°C' },
      ]
    }
  };

  const current = stationsData[activeFacility];

  return (
    <section className="py-12 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                TRUNG TÂM GIÁM SÁT DỮ LIỆU THỜI GIAN THỰC
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              BẢNG ĐIỀU HÀNH & CHỈ SỐ QUAN TRẮC MÔI TRƯỜNG 24/7
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Dữ liệu được truyền tự động liên tục từ 18 trạm cảm biến môi trường kết nối trực tiếp Sở TN&MT TP.HCM
            </p>
          </div>

          {/* Controls: Switch Facility & Refresh */}
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex">
              <button
                onClick={() => setActiveFacility('da-phuoc')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                  activeFacility === 'da-phuoc'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Khu Đa Phước (Bình Chánh)
              </button>
              <button
                onClick={() => setActiveFacility('phuoc-hiep')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                  activeFacility === 'phuoc-hiep'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Khu Phước Hiệp (Củ Chi)
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              className="gap-1.5 bg-white"
              title="Làm mới dữ liệu cảm biến"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
        </div>

        {/* Facility Overview Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">{current.name}</h4>
                <Badge variant="success">Hoạt động bình thường</Badge>
              </div>
              <p className="text-xs text-slate-500">{current.location} • Quy mô: {current.area}</p>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 block">Khối lượng rác tiếp nhận hôm nay:</span>
                <strong className="text-slate-900 text-sm font-bold">{current.currentIntake}</strong>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block">Thời gian cập nhật:</span>
                <span className="text-emerald-700 font-semibold">{lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* 6 Sensor Data Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
            {current.sensors.map((s, idx) => (
              <div
                key={idx}
                className={cn('p-4 rounded-xl border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md', s.bg)}
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block line-clamp-1">{s.name}</span>
                  <div className="flex items-baseline gap-1 my-1.5">
                    <span className={cn('text-2xl font-black', s.color)}>{s.value}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{s.unit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                      {s.status}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1 leading-tight">{s.limit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Commitment & Transparency Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-900 text-white rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-300 shrink-0" />
            <div>
              <strong className="font-bold block text-sm">Tuân thủ Quy chuẩn Quốc gia</strong>
              <span className="text-emerald-200">100% dữ liệu đạt chuẩn QCVN 40:2011/BTNMT và QCVN 05:2023/BTNMT</span>
            </div>
          </div>

          <div className="p-4 bg-blue-900 text-white rounded-xl flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-300 shrink-0" />
            <div>
              <strong className="font-bold block text-sm">Cảnh báo vi phạm tự động</strong>
              <span className="text-blue-200">Kích hoạt thông báo tức thì tới Thanh tra Môi trường nếu vượt ngưỡng</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800 text-white rounded-xl flex items-center justify-between gap-3">
            <div>
              <strong className="font-bold block text-sm">Phát hiện mùi hôi / Ô nhiễm?</strong>
              <span className="text-slate-300">Gửi phản ánh trực tiếp tới Ban Quản lý MBS</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate && onNavigate('/phan-anh')}
              className="shrink-0 text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
            >
              Phản ánh
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
