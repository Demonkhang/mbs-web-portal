import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, DollarSign, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TopBarProps {
  fontSizeLevel?: number;
  onFontSizeChange?: (delta: number) => void;
  onResetFontSize?: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontSize?: 'normal' | 'large' | 'xlarge';
  onChangeFontSize?: (size: 'normal' | 'large' | 'xlarge') => void;
  onNavigate?: (path: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  fontSizeLevel = 0,
  onFontSizeChange,
  onResetFontSize,
  isHighContrast,
  onToggleHighContrast,
  fontSize = 'normal',
  onChangeFontSize,
  onNavigate,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentDateTime(`${dayName}, ${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFontSelect = (size: 'normal' | 'large' | 'xlarge') => {
    if (onChangeFontSize) onChangeFontSize(size);
  };

  return (
    <div className={cn(
      'w-full text-xs transition-colors duration-200 border-b',
      isHighContrast
        ? 'bg-black text-yellow-300 border-yellow-500'
        : 'bg-emerald-950 text-emerald-100/90 border-emerald-900'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-y-2">
        {/* Left: Date Time & Weather, AQI */}
        <div className="flex items-center space-x-3 sm:space-x-5 overflow-x-auto scrollbar-none py-0.5">
          <span className="font-medium whitespace-nowrap text-emerald-200 hidden sm:inline">
            {currentDateTime || 'Đang cập nhật...'}
          </span>

          <div className="h-3 w-px bg-emerald-800 hidden sm:block"></div>

          {/* Weather */}
          <div className="flex items-center gap-1.5 whitespace-nowrap text-emerald-100 hover:text-white transition-colors" title="Thời tiết TP.HCM">
            <CloudSun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>TP.HCM: <strong className="text-white font-semibold">28°C</strong></span>
          </div>

          <div className="h-3 w-px bg-emerald-800"></div>

          {/* AQI */}
          <div className="flex items-center gap-1.5 whitespace-nowrap" title="Chỉ số chất lượng không khí (AQI) tại Khu LHXLCT Đa Phước">
            <Wind className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>AQI:</span>
            <span className="px-1.5 py-0.2 rounded-xs bg-emerald-700/80 text-emerald-100 font-bold text-[11px]">
              42 (Tốt)
            </span>
          </div>

          <div className="h-3 w-px bg-emerald-800 hidden md:block"></div>


        </div>

        {/* Right: Accessibility Controls & Language */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {/* Text Size Adjuster */}
          <div className="flex items-center bg-emerald-900/60 rounded-md p-0.5 border border-emerald-800/80">
            <button
              onClick={() => handleFontSelect('normal')}
              className={cn(
                "px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors",
                fontSize === 'normal' ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800'
              )}
              title="Cỡ chữ bình thường"
            >
              A
            </button>
            <button
              onClick={() => handleFontSelect('large')}
              className={cn(
                "px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors",
                fontSize === 'large' ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800'
              )}
              title="Cỡ chữ lớn"
            >
              A+
            </button>
            <button
              onClick={() => handleFontSelect('xlarge')}
              className={cn(
                "px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors",
                fontSize === 'xlarge' ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800'
              )}
              title="Cỡ chữ rất lớn"
            >
              A++
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors cursor-pointer',
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-emerald-900/60 text-emerald-200 border-emerald-800 hover:bg-emerald-800 hover:text-white'
            )}
            title="Bật/Tắt chế độ tương phản cao"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Tương phản</span>
          </button>

          {/* Language Switch */}
          <div className="flex items-center text-[11px] font-semibold">
            <button
              onClick={() => setCurrentLang('vi')}
              className={cn(
                'px-1.5 py-0.5 rounded-l transition-colors cursor-pointer',
                currentLang === 'vi' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
              )}
            >
              VN
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              className={cn(
                'px-1.5 py-0.5 rounded-r transition-colors cursor-pointer',
                currentLang === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
              )}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
