export const SITE_INFO = {
  name: 'Ban Quản lý MBS',
  fullName: 'Ban Quản lý các Khu liên hợp xử lý chất thải thành phố Hồ Chí Minh',
  shortName: 'MBS',
  slogan: 'Vì một Thành phố Hồ Chí Minh Xanh - Sạch - Hiện đại',
  address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
  subAddress: 'Số 24 Kỳ Đồng, Phường 9, Quận 3, TP. Hồ Chí Minh',
  branchAddress: 'Khu liên hợp xử lý chất thải Đa Phước, Xã Đa Phước, Huyện Bình Chánh, TP.HCM',
  hotline: '(028) 3822 1234',
  emergencyHotline: '1900 8888 68',
  email: 'bql.mbs@tphcm.gov.vn',
  website: 'https://mbs.tphcm.gov.vn',
  workingHours: 'Thứ Hai - Thứ Sáu: 07:30 - 17:00 (Trừ ngày lễ)',
  operatingUnits: [
    { name: 'Khu LHXLCT Đa Phước (Bình Chánh)', capacity: '6.500 tấn/ngày', area: '128 ha' },
    { name: 'Khu LHXLCT Phước Hiệp (Củ Chi)', capacity: '4.000 tấn/ngày', area: '687 ha' },
  ],
  stats: {
    todayVisitors: 1245,
    totalVisitors: 8542103,
    onlineNow: 128,
    dailyWasteProcessed: '10.500+ tấn/ngày',
    complianceRate: '99.4%',
    autoMonitoringStations: 18,
  }
};

export const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Giới thiệu',
    href: '/so-do-to-chuc',
    children: [
      { label: 'Chức năng - Nhiệm vụ', href: '/so-do-to-chuc?tab=functions' },
      { label: 'Cơ cấu & Sơ đồ tổ chức', href: '/so-do-to-chuc?tab=org' },
      { label: 'Ban Lãnh đạo', href: '/so-do-to-chuc?tab=leaders' },
      { label: 'Danh bạ cán bộ', href: '/so-do-to-chuc?tab=directory' },
    ]
  },
  {
    label: 'Tin tức & Hoạt động',
    href: '/tin-tuc',
    children: [
      { label: 'Hoạt động Ban Quản lý', href: '/tin-tuc?cat=hoat-dong' },
      { label: 'Quản lý & Bảo vệ Môi trường', href: '/tin-tuc?cat=moi-truong' },
      { label: 'Chỉ đạo điều hành', href: '/tin-tuc?cat=chi-dao-dieu-hanh' },
      { label: 'Khoa học & Công nghệ xanh', href: '/tin-tuc?cat=khoa-hoc-cong-nghe' },
      { label: 'Thông báo & Công khai', href: '/tin-tuc?cat=thong-bao' },
    ]
  },
  { label: 'Văn bản pháp quy', href: '/van-ban' },
  // {
  //   label: 'Dịch vụ công',
  //   href: '/dich-vu-cong',
  //   children: [
  //     { label: 'Dịch vụ công trực tuyến', href: '/dich-vu-cong' },
  //     { label: 'Tra cứu tiến độ hồ sơ', href: '/dich-vu-cong#tra-cuu' },
  //     { label: 'Hướng dẫn nộp hồ sơ', href: '/dich-vu-cong#huong-dan' },
  //     { label: 'Biểu mẫu hành chính', href: '/dich-vu-cong#bieu-mau' },
  //   ]
  // },
  { label: 'Lịch công tác', href: '/lich-cong-tac' },
  // { label: 'Phản ánh môi trường', href: '/phan-anh' },
  // { label: 'Hỏi đáp & FAQ', href: '/hoi-dap' },
  { label: 'Thư viện ảnh', href: '/thu-vien-anh' },
  { label: 'Liên hệ', href: '/lien-he' },
];

export const USEFUL_LINKS = [
  { name: 'Cổng Thông tin điện tử Chính phủ', url: 'http://chinhphu.vn', logo: '🏛️' },
  { name: 'Bộ Tài nguyên và Môi trường', url: 'https://monre.gov.vn', logo: '🌱' },
  { name: 'Ủy ban nhân dân TP. Hồ Chí Minh', url: 'https://tphcm.gov.vn', logo: '🏙️' },
  { name: 'Sở Tài nguyên và Môi trường TP.HCM', url: 'https://donre.tphcm.gov.vn', logo: '📊' },
  { name: 'Cổng Dịch vụ công Quốc gia', url: 'https://dichvucong.gov.vn', logo: '📜' },
  { name: 'Cục Kiểm soát ô nhiễm môi trường', url: 'https://vea.gov.vn', logo: '🛡️' },
];

export const BREAKING_NEWS = [
  'Đẩy nhanh tiến độ dự án nhà máy đốt rác phát điện 4.000 tấn/ngày tại Khu liên hợp Tây Bắc - Củ Chi.',
  'Thông báo công khai chỉ số quan trắc môi trường không khí và nước ngầm tháng 02/2026 tại Khu xử lý Đa Phước.',
  'UBND TP.HCM ban hành Quyết định phê duyệt Đề án giảm thiểu rác thải nhựa và phân loại rác tại nguồn.',
  'Ban Quản lý MBS công bố đường dây nóng tiếp nhận phản ánh vi phạm môi trường 24/7 qua đầu số 1900 8888 68.',
];
