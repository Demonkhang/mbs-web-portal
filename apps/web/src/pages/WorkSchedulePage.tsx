import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, Printer, Download, UserCheck, Building2 } from 'lucide-react';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

export interface WorkSchedulePageProps {
  onNavigate: (path: string) => void;
}

export const WorkSchedulePage: React.FC<WorkSchedulePageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState('Tuần 08 (Từ 16/02/2026 đến 22/02/2026)');
  const [filterLeader, setFilterLeader] = useState('Tất cả');

  const scheduleDays = [
    {
      day: 'Thứ Hai (16/02/2026)',
      morning: [
        {
          time: '08:00',
          title: 'Họp giao ban Thường trực Ban Giám đốc và Trưởng các phòng chuyên môn',
          chair: 'Đ/c Nguyễn Văn Minh - Trưởng ban',
          attendees: 'Các Phó Trưởng ban, Trưởng các phòng chuyên môn, Trạm trưởng các trạm',
          location: 'Phòng họp số 1 - Trụ sở Ban Quản lý MBS',
        },
        {
          time: '10:00',
          title: 'Kiểm tra vận hành hệ thống phần mềm quan trắc môi trường thông minh phiên bản 2026',
          chair: 'Đ/c Lê Thị Thu Hằng - Phó Trưởng ban',
          attendees: 'Phòng Kỹ thuật & Công nghệ, Đơn vị phát triển phần mềm',
          location: 'Trung tâm Điều hành dữ liệu quan trắc',
        },
      ],
      afternoon: [
        {
          time: '14:00',
          title: 'Làm việc với Sở TN&MT về tiến độ cấp phép xây dựng Nhà máy đốt rác phát điện WtE',
          chair: 'Đ/c Nguyễn Văn Minh - Trưởng ban',
          attendees: 'Phòng Quản lý Kỹ thuật, Tổ chuyên gia thẩm định',
          location: 'Hội trường Sở Tài nguyên và Môi trường',
        },
      ],
    },
    {
      day: 'Thứ Ba (17/02/2026)',
      morning: [
        {
          time: '08:30',
          title: 'Kiểm tra hiện trường công tác tiếp nhận rác và phun xịt vi sinh khử mùi tại Khu LHXLCT Đa Phước',
          chair: 'Đ/c Lê Thị Thu Hằng - Phó Trưởng ban',
          attendees: 'Trạm Giám sát Đa Phước, Công ty TNHH Xử lý Chất thải Việt Nam (VWS)',
          location: 'Khu LHXLCT Đa Phước (Bình Chánh)',
        },
      ],
      afternoon: [
        {
          time: '14:00',
          title: 'Nghiệm thu khối lượng tiếp nhận và xử lý chất thải rắn sinh hoạt tháng 01/2026',
          chair: 'Đ/c Trần Đình Quân - Phó Trưởng ban',
          attendees: 'Phòng Kế hoạch - Tài chính, Phòng Quản lý Chất thải',
          location: 'Phòng họp số 2',
        },
      ],
    },
    {
      day: 'Thứ Tư (18/02/2026)',
      morning: [
        {
          time: '08:30',
          title: 'Dự Hội nghị trực tuyến của UBND TP.HCM về công tác bảo vệ môi trường và chuyển đổi xanh đô thị',
          chair: 'Đ/c Nguyễn Văn Minh - Trưởng ban',
          attendees: 'Đ/c Lê Thị Thu Hằng, Chánh Văn phòng',
          location: 'Phòng họp trực tuyến UBND Thành phố',
        },
      ],
      afternoon: [
        {
          time: '14:00',
          title: 'Tiếp công dân và giải quyết phản ánh mùi hôi, vệ sinh môi trường định kỳ',
          chair: 'Đ/c Lê Thị Thu Hằng - Phó Trưởng ban',
          attendees: 'Thường trực Văn phòng, Phòng Giám sát Môi trường',
          location: 'Phòng Tiếp dân - Ban Quản lý MBS',
        },
      ],
    },
    {
      day: 'Thứ Năm (19/02/2026)',
      morning: [
        {
          time: '09:00',
          title: 'Khảo sát công tác phòng chống cháy nổ và kiểm tra trạm xử lý nước rỉ rác tại Khu Phước Hiệp',
          chair: 'Đ/c Trần Đình Quân - Phó Trưởng ban',
          attendees: 'Trạm Giám sát Phước Hiệp, Cảnh sát PCCC huyện Củ Chi',
          location: 'Khu LHXLCT Phước Hiệp (Củ Chi)',
        },
      ],
      afternoon: [
        {
          time: '14:30',
          title: 'Thẩm định hồ sơ đề nghị cấp phép tiếp nhận rác công nghiệp của các doanh nghiệp',
          chair: 'Đ/c Lê Thị Thu Hằng - Phó Trưởng ban',
          attendees: 'Phòng Kỹ thuật, Tổ thụ lý Dịch vụ công',
          location: 'Phòng họp số 1',
        },
      ],
    },
    {
      day: 'Thứ Sáu (20/02/2026)',
      morning: [
        {
          time: '08:30',
          title: 'Họp rà soát tiến độ giải ngân vốn đầu tư công các dự án đê bao, đường nội bộ khu liên hợp',
          chair: 'Đ/c Nguyễn Văn Minh - Trưởng ban',
          attendees: 'Đ/c Trần Đình Quân, Phòng KHTC, Ban QLDA Công trình',
          location: 'Phòng họp số 1',
        },
      ],
      afternoon: [
        {
          time: '15:00',
          title: 'Họp tổng kết công tác tuần và triển khai nhiệm vụ trọng tâm tuần 09/2026',
          chair: 'Đ/c Nguyễn Văn Minh - Trưởng ban',
          attendees: 'Toàn thể Lãnh đạo Ban và cán bộ chủ chốt',
          location: 'Hội trường lớn Ban Quản lý MBS',
        },
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Lịch công tác tuần' },
          ]}
          onNavigate={onNavigate}
        />

        {/* Header */}
        <div className="border-b-2 border-emerald-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              LỊCH CÔNG TÁC LÃNH ĐẠO BAN
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Chương trình công tác của Thường trực Ban Giám đốc Ban Quản lý MBS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>In lịch tuần</span>
            </Button>
          </div>
        </div>

        {/* Week Selector Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="font-bold text-xs sm:text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option>Tuần 08 (Từ 16/02/2026 đến 22/02/2026) - Tuần hiện tại</option>
              <option>Tuần 07 (Từ 09/02/2026 đến 15/02/2026)</option>
              <option>Tuần 09 (Từ 23/02/2026 đến 01/03/2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Lãnh đạo chủ trì:</span>
            <select
              value={filterLeader}
              onChange={(e) => setFilterLeader(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
            >
              <option>Tất cả</option>
              <option>Đ/c Nguyễn Văn Minh</option>
              <option>Đ/c Lê Thị Thu Hằng</option>
              <option>Đ/c Trần Đình Quân</option>
            </select>
          </div>
        </div>

        {/* Daily Schedule List */}
        <div className="space-y-6">
          {scheduleDays.map((dayItem, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Day Header */}
              <div className="bg-emerald-800 text-white px-6 py-3 font-bold text-sm flex items-center justify-between">
                <span>{dayItem.day}</span>
                <span className="text-xs text-emerald-200 font-normal">Trực ban lãnh đạo Ban Quản lý MBS</span>
              </div>

              {/* Sessions Grid (Sáng / Chiều) */}
              <div className="divide-y divide-slate-100">
                {/* Morning */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    BUỔI SÁNG
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-amber-200">
                    {dayItem.morning.map((evt, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {evt.time}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{evt.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                          <div><strong>Chủ trì:</strong> <span className="text-emerald-800 font-semibold">{evt.chair}</span></div>
                          <div><strong>Thành phần:</strong> {evt.attendees}</div>
                          <div><strong>Địa điểm:</strong> <span className="text-slate-800">{evt.location}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="p-5 space-y-4 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    BUỔI CHIỀU
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                    {dayItem.afternoon.map((evt, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {evt.time}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{evt.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                          <div><strong>Chủ trì:</strong> <span className="text-emerald-800 font-semibold">{evt.chair}</span></div>
                          <div><strong>Thành phần:</strong> {evt.attendees}</div>
                          <div><strong>Địa điểm:</strong> <span className="text-slate-800">{evt.location}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
