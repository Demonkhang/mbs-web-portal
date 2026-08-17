import {
  NewsItem,
  NewsCategory,
  LegalDocument,
  PublicService,
  ApplicationTracking,
  StaffMember,
  OrgNode,
  WorkScheduleItem,
  FeedbackReport,
  FAQItem,
  MediaItem,
  Facility
} from './types';

export const NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'cat-01', name: 'Hoạt động Ban Quản lý', slug: 'hoat-dong' },
  { id: 'cat-02', name: 'Môi trường & Giám sát', slug: 'moi-truong' },
  { id: 'cat-03', name: 'Chỉ đạo điều hành', slug: 'chi-dao-dieu-hanh' },
  { id: 'cat-04', name: 'Khoa học & Công nghệ', slug: 'khoa-hoc-cong-nghe' },
  { id: 'cat-05', name: 'Thông báo & Công khai', slug: 'thong-bao' },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'news-01',
    slug: 'trien-khai-he-thong-giam-sat-tu-dong-va-canh-bao-moi-truong',
    title: 'Triển khai hệ thống giám sát tự động và cảnh báo môi trường tại Khu liên hợp xử lý chất thải Đa Phước',
    summary: 'Nhằm nâng cao hiệu lực quản lý và minh bạch thông tin chỉ số môi trường, Ban Quản lý MBS đã hoàn tất lắp đặt hệ thống cảm biến quan trắc tự động truyền dữ liệu thời gian thực 24/7 về Trung tâm điều hành.',
    content: `
      <p class="lead text-lg font-medium text-slate-700 leading-relaxed mb-4">
        Nhằm nâng cao hiệu quả giám sát chất lượng môi trường không khí, nước thải sau xử lý và khí thải sinh học tại các khu xử lý rác thải tập trung, Ban Quản lý các Khu liên hợp xử lý chất thải TP.HCM (MBS) đã chính thức đưa vào vận hành hệ thống giám sát quan trắc môi trường tự động, liên tục.
      </p>
      
      <div class="my-6 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-lg">
        <h4 class="text-base font-bold text-emerald-900 mb-1">Mục tiêu trọng tâm</h4>
        <p class="text-sm text-emerald-800 leading-relaxed">
          100% dữ liệu từ các trạm quan trắc tự động về bụi mịn PM2.5, khí H2S, NH3, VOCs và COD, BOD nước rỉ rác được truyền liên tục về Sở TN&MT và công khai trên Cổng thông tin điện tử MBS để người dân theo dõi.
        </p>
      </div>

      <h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">Hiện đại hóa hạ tầng quan trắc theo tiêu chuẩn quốc tế</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Dự án được thực hiện với 18 trạm quan trắc cố định bố trí bao quanh vành đai vùng đệm cách ly sinh thái của Khu xử lý Đa Phước (Bình Chánh) và Khu xử lý Phước Hiệp (Củ Chi). Các chỉ số được lấy mẫu mỗi 5 phút một lần, tự động phân tích và kích hoạt cảnh báo màu đỏ nếu phát hiện nồng độ vượt ngưỡng quy chuẩn kỹ thuật quốc gia QCVN.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span class="text-3xl font-extrabold text-emerald-600">18 Trạm</span>
          <p class="text-sm font-semibold text-slate-800 mt-1">Cảm biến tự động đa tầng</p>
          <p class="text-xs text-slate-500 mt-0.5">Truyền tín hiệu qua mạng cáp quang chuyên dụng & vệ tinh</p>
        </div>
        <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span class="text-3xl font-extrabold text-blue-600">24/7</span>
          <p class="text-sm font-semibold text-slate-800 mt-1">Giám sát điều hành thời gian thực</p>
          <p class="text-xs text-slate-500 mt-0.5">Tự động kết nối với trung tâm điều hành đô thị thông minh TP.HCM</p>
        </div>
      </div>

      <h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">Tăng cường sự tham gia giám sát của cộng đồng</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Phát biểu tại lễ công bố, Lãnh đạo Ban Quản lý MBS nhấn mạnh: "Công tác bảo vệ môi trường chỉ đạt hiệu quả thực chất khi có sự minh bạch thông tin và giám sát của cộng đồng dân cư. Toàn bộ người dân khu vực giáp ranh có thể tra cứu nhanh chỉ số chất lượng không khí (AQI) và gửi phản ánh tức thì qua Cổng Dịch vụ công hoặc Tổng đài tiếp nhận ý kiến 1900 8888 68".
      </p>
    `,
    category: 'khoa-hoc-cong-nghe',
    categoryName: 'Khoa học & Công nghệ',
    publishedAt: '2026-02-15T08:30:00Z',
    author: 'Phòng Kỹ thuật & Công nghệ môi trường',
    views: 3420,
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Trung tâm điều hành và giám sát thông số môi trường tự động Ban Quản lý MBS',
    isFeatured: true,
    isSpotlight: true,
    tags: ['Quan trắc tự động', 'Môi trường Đa Phước', 'Công nghệ số', 'Xử lý rác thải'],
    readingTime: 4,
  },
  {
    id: 'news-02',
    slug: 'day-manh-chuyen-doi-cong-nghe-dot-rac-phat-dien-tai-tphcm',
    title: 'Đẩy mạnh chuyển đổi công nghệ đốt rác phát điện (Waste-to-Energy) hướng tới Net Zero 2050',
    summary: 'TP.HCM đang tập trung hoàn thành các thủ tục đầu tư và chuyển đổi công nghệ xử lý rác thải sinh hoạt từ chôn lấp hợp vệ sinh sang công nghệ đốt phát điện hiện đại với công suất trên 8.000 tấn/ngày.',
    content: `
      <p class="text-slate-700 leading-relaxed mb-4">
        Tại cuộc họp chuyên đề về quy hoạch xử lý chất thải rắn giai đoạn 2026-2030, Ban Quản lý MBS đã báo cáo tiến độ triển khai 5 dự án nhà máy đốt rác phát điện thế hệ mới tại Khu liên hợp xử lý chất thải Tây Bắc (huyện Củ Chi) và Khu Đa Phước (Bình Chánh).
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        Mục tiêu đặt ra đến cuối năm 2026 là giảm tỷ lệ chôn lấp rác thải sinh hoạt xuống dưới 20%, và đến năm 2030 đạt 100% rác sinh hoạt được tái chế và đốt phát điện tận thu năng lượng sạch.
      </p>
    `,
    category: 'hoat-dong',
    categoryName: 'Hoạt động Ban Quản lý',
    publishedAt: '2026-02-14T14:15:00Z',
    author: 'Ban Biên tập MBS',
    views: 2180,
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Mô hình nhà máy đốt rác phát điện công nghệ tái tạo năng lượng',
    isFeatured: true,
    tags: ['Đốt rác phát điện', 'Waste-to-Energy', 'Net Zero', 'Năng lượng xanh'],
    readingTime: 3,
  },
  {
    id: 'news-03',
    slug: 'kiem-tra-cong-tac-ve-sinh-moi-truong-va-phong-chong-su-co-mua-kho',
    title: 'Tăng cường kiểm tra công tác an toàn vệ sinh môi trường và phòng chống cháy nổ mùa khô 2026',
    summary: 'Đoàn kiểm tra liên ngành do Lãnh đạo Ban Quản lý MBS chủ trì đã tiến hành kiểm tra đột xuất tại các bãi chôn lấp và các nhà máy chế biến phân hữu cơ compost.',
    content: `
      <p class="text-slate-700 leading-relaxed mb-4">
        Trong đợt cao điểm nắng nóng mùa khô tại khu vực phía Nam, Ban Quản lý MBS yêu cầu các đơn vị vận hành xử lý chất thải duy trì nghiêm ngặt các biện pháp phun xịt chế phẩm sinh học khử mùi, phủ bạt HDPE chống thẩm thấu và duy trì hệ thống thu gom khí biogas an toàn.
      </p>
    `,
    category: 'moi-truong',
    categoryName: 'Môi trường & Xử lý rác',
    publishedAt: '2026-02-12T09:00:00Z',
    author: 'Phòng Quản lý Môi trường',
    views: 1540,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Kiểm tra hiện trường quy trình xử lý nước rỉ rác và lớp phủ bạt bảo vệ',
    isFeatured: false,
    tags: ['Kiểm tra giám sát', 'Mùa khô', 'Phòng chống cháy nổ', 'Khử mùi'],
    readingTime: 2,
  },
  {
    id: 'news-04',
    slug: 'thong-bao-ke-hoach-tiep-nhan-va-dieu-phoi-rac-thai-dip-le',
    title: 'Thông báo Kế hoạch tiếp nhận và điều phối rác thải sinh hoạt trong các dịp cao điểm Lễ hội 2026',
    summary: 'Ban Quản lý MBS ban hành phương án tiếp nhận và xử lý khối lượng rác thải dự kiến tăng 25-30% trên địa bàn toàn thành phố Hồ Chí Minh.',
    content: `
      <p class="text-slate-700 leading-relaxed mb-4">
        Để đảm bảo thành phố luôn sạch đẹp, Ban Quản lý MBS đã bố trí 100% quân số trực vận hành 24/24 tại 2 khu xử lý trọng điểm, mở rộng cửa tiếp nhận xe vận chuyển chuyên dụng và phân luồng giao thông chống ùn tắc bến bãi.
      </p>
    `,
    category: 'thong-bao',
    categoryName: 'Thông báo',
    publishedAt: '2026-02-10T11:20:00Z',
    author: 'Văn phòng Ban',
    views: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Hệ thống cân xe tải tự động và phân luồng tiếp nhận rác sinh hoạt',
    isFeatured: false,
    tags: ['Kế hoạch điều phối', 'Rác thải đô thị', 'Trực cao điểm'],
    readingTime: 3,
  },
  {
    id: 'news-05',
    slug: 'hoi-nghi-tap-huan-phan-loai-chat-thai-ran-tai-nguon-theo-luat-bao-ve-moi-truong',
    title: 'Hội nghị tập huấn phân loại chất thải rắn tại nguồn và hướng dẫn thủ tục cấp phép môi trường mới',
    summary: 'Hơn 200 đại biểu đại diện các doanh nghiệp thu gom vận chuyển chất thải, cơ sở y tế và ban quản lý chợ tham gia lớp tập huấn chuyên sâu.',
    content: `
      <p class="text-slate-700 leading-relaxed mb-4">
        Hội nghị đã phổ biến các quy định chi tiết về nhóm chất thải có thể tái chế, chất thải thực phẩm và chất thải nguy hại sinh hoạt, đồng thời giải đáp trực tiếp các vướng mắc trong việc kê khai trực tuyến hồ sơ môi trường.
      </p>
    `,
    category: 'hoat-dong',
    categoryName: 'Hoạt động Ban Quản lý',
    publishedAt: '2026-02-08T16:00:00Z',
    author: 'Phòng Hành chính - Tổng hợp',
    views: 1220,
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Toàn cảnh Hội nghị tập huấn phân loại chất thải rắn tại nguồn',
    isFeatured: false,
    tags: ['Tập huấn', 'Phân loại rác', 'Luật Môi trường', 'Thủ tục hành chính'],
    readingTime: 3,
  }
];

export const DOCUMENT_TYPES = [
  'Tất cả',
  'Nghị định',
  'Thông tư',
  'Quyết định',
  'Kế hoạch',
  'Thông báo',
  'Công văn'
];

export const ISSUING_AGENCIES = [
  'Tất cả',
  'Chính phủ',
  'Bộ Tài nguyên và Môi trường',
  'UBND TP. Hồ Chí Minh',
  'Sở Tài nguyên và Môi trường TP.HCM',
  'Ban Quản lý MBS'
];

export const MOCK_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-08-2022-nd-cp',
    code: '08/2022/NĐ-CP',
    title: 'Nghị định số 08/2022/NĐ-CP của Chính phủ quy định chi tiết một số điều của Luật Bảo vệ môi trường',
    docType: 'Nghị định',
    issuingAgency: 'Chính phủ',
    signer: 'Phó Thủ tướng Lê Văn Thành',
    issueDate: '2022-01-10',
    effectiveDate: '2022-01-10',
    status: 'con-hieu-luc',
    domain: 'Môi trường',
    fileSize: '3.4 MB',
    downloadsCount: 14520,
    viewsCount: 28900,
    relatedDocs: {
      basis: ['Luật Bảo vệ Môi trường số 72/2020/QH14'],
      guiding: ['Thông tư số 02/2022/TT-BTNMT của Bộ TN&MT'],
    },
    fullText: `
CHÍNH PHỦ
--------
Số: 08/2022/NĐ-CP

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---------------
Hà Nội, ngày 10 tháng 01 năm 2022

NGHỊ ĐỊNH
Quy định chi tiết một số điều của Luật Bảo vệ môi trường

Căn cứ Luật Tổ chức Chính phủ ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;
Căn cứ Luật Bảo vệ môi trường ngày 17 tháng 11 năm 2020;
Theo đề nghị của Bộ trưởng Bộ Tài nguyên và Môi trường;
Chính phủ ban hành Nghị định quy định chi tiết một số điều của Luật Bảo vệ môi trường.

Chương I: NHỮNG QUY ĐỊNH CHUNG
Điều 1. Phạm vi điều chỉnh
Nghị định này quy định chi tiết một số điều của Luật Bảo vệ môi trường về bảo vệ các thành phần môi trường; phân vùng môi trường; đánh giá môi trường chiến lược; đánh giá tác động môi trường; giấy phép môi trường, đăng ký môi trường; quản lý chất thải rắn sinh hoạt, chất thải rắn công nghiệp thông thường, chất thải nguy hại; quan trắc môi trường và hệ thống thông tin, dữ liệu môi trường.

Điều 2. Đối tượng áp dụng
Nghị định này áp dụng đối với cơ quan, tổ chức, cộng đồng dân cư, hộ gia đình và cá nhân có hoạt động trên lãnh thổ nước Cộng hòa xã hội chủ nghĩa Việt Nam.

Chương V: QUẢN LÝ CHẤT THẢI RẮN SINH HOẠT VÀ KHU XỬ LÝ TẬP TRUNG
Điều 58. Quy chuẩn kỹ thuật đối với bãi chôn lấp và nhà máy xử lý chất thải rắn
1. Các khu liên hợp và cơ sở xử lý chất thải rắn sinh hoạt phải đáp ứng đầy đủ khoảng cách an toàn môi trường, hệ thống thu gom và xử lý nước rỉ rác đạt QCVN 40:2011/BTNMT (Cột A) trước khi thải ra nguồn tiếp nhận.
2. Khí thải từ các lò đốt rác phát điện phải lắp đặt hệ thống quan trắc khí thải tự động liên tục đối với các thông số: bụi, SO2, NO2, CO, HCl, HF, O2 và nhiệt độ buồng đốt thứ cấp tối thiểu 1.050°C.
    `
  },
  {
    id: 'doc-02-2022-tt-btnmt',
    code: '02/2022/TT-BTNMT',
    title: 'Thông tư số 02/2022/TT-BTNMT của Bộ Tài nguyên và Môi trường quy định chi tiết thi hành một số điều của Luật Bảo vệ môi trường',
    docType: 'Thông tư',
    issuingAgency: 'Bộ Tài nguyên và Môi trường',
    signer: 'Bộ trưởng Trần Hồng Hà',
    issueDate: '2022-01-10',
    effectiveDate: '2022-01-10',
    status: 'con-hieu-luc',
    domain: 'Môi trường',
    fileSize: '4.8 MB',
    downloadsCount: 9820,
    viewsCount: 19450,
    relatedDocs: {
      basis: ['Nghị định số 08/2022/NĐ-CP'],
    },
    fullText: `
BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG
--------
Số: 02/2022/TT-BTNMT

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---------------
Hà Nội, ngày 10 tháng 01 năm 2022

THÔNG TƯ
Quy định chi tiết thi hành một số điều của Luật Bảo vệ môi trường

Ban hành biểu mẫu lập hồ sơ đề nghị cấp Giấy phép môi trường, báo cáo công tác bảo vệ môi trường định kỳ hàng năm và hướng dẫn kỹ thuật phân loại chất thải rắn sinh hoạt.
    `
  },
  {
    id: 'doc-2145-qd-ubnd',
    code: '2145/QĐ-UBND',
    title: 'Quyết định số 2145/QĐ-UBND của UBND TP.HCM ban hành Kế hoạch quản lý và xử lý chất thải rắn trên địa bàn TP.HCM đến năm 2030',
    docType: 'Quyết định',
    issuingAgency: 'Ủy ban nhân dân TP.HCM',
    signer: 'Chủ tịch UBND TP.HCM',
    issueDate: '2024-06-25',
    effectiveDate: '2024-07-01',
    status: 'con-hieu-luc',
    domain: 'Quản lý chất thải rắn',
    fileSize: '1.9 MB',
    downloadsCount: 5640,
    viewsCount: 11200,
    fullText: `
ỦY BAN NHÂN DÂN THÀNH PHỐ HỒ CHÍ MINH
Số: 2145/QĐ-UBND

QUYẾT ĐỊNH
Phê duyệt Kế hoạch chuyển đổi công nghệ xử lý chất thải rắn sinh hoạt sang công nghệ đốt phát điện và thu hồi năng lượng trên địa bàn Thành phố.
    `
  },
  {
    id: 'doc-53-2020-nd-cp',
    code: '53/2020/NĐ-CP',
    title: 'Nghị định số 53/2020/NĐ-CP quy định phí bảo vệ môi trường đối với nước thải',
    docType: 'Nghị định',
    issuingAgency: 'Chính phủ',
    signer: 'Thủ tướng Chính phủ',
    issueDate: '2020-05-05',
    effectiveDate: '2020-07-01',
    status: 'con-hieu-luc',
    domain: 'Tài chính - Đấu thầu',
    fileSize: '1.2 MB',
    downloadsCount: 3890,
    viewsCount: 7800,
    fullText: `Nghị định quy định mức thu, chế độ thu, nộp, quản lý và sử dụng phí bảo vệ môi trường đối với nước thải sinh hoạt và nước thải công nghiệp.`
  },
  {
    id: 'doc-38-2015-nd-cp',
    code: '38/2015/NĐ-CP',
    title: 'Nghị định số 38/2015/NĐ-CP về quản lý chất thải và phế liệu (đã được thay thế bởi Nghị định 08/2022/NĐ-CP)',
    docType: 'Nghị định',
    issuingAgency: 'Chính phủ',
    signer: 'Thủ tướng Nguyễn Tấn Dũng',
    issueDate: '2015-04-24',
    effectiveDate: '2015-06-15',
    status: 'het-hieu-luc',
    domain: 'Quản lý chất thải rắn',
    fileSize: '2.1 MB',
    downloadsCount: 8200,
    viewsCount: 16500,
    relatedDocs: {
      replacedBy: 'Nghị định 08/2022/NĐ-CP'
    },
    fullText: `Văn bản này đã hết hiệu lực và được thay thế toàn bộ bởi Nghị định số 08/2022/NĐ-CP.`
  }
];

export const MOCK_SERVICES: PublicService[] = [
  {
    id: 'dvc-cap-phep-xu-ly-chat-thai',
    code: 'DVC-MBS-01',
    title: 'Cấp giấy phép tiếp nhận và xử lý chất thải rắn sinh hoạt và công nghiệp thông thường',
    level: 4,
    field: 'Quản lý chất thải rắn',
    targetAudience: 'Tổ chức, Doanh nghiệp hoạt động dịch vụ thu gom, vận chuyển và xử lý chất thải',
    duration: '25 ngày làm việc',
    fee: '1.500.000 VNĐ / Hồ sơ',
    result: 'Giấy phép điện tử có chữ ký số và Giấy phép bản cứng có dấu mộc đỏ',
    implementationAgency: 'Ban Quản lý các Khu liên hợp xử lý chất thải TP.HCM (MBS)',
    description: 'Thủ tục thẩm định năng lực phương tiện, quy trình kỹ thuật và cấp phép tiếp nhận chất thải rắn sinh hoạt vào các Khu liên hợp xử lý Đa Phước và Phước Hiệp.',
    requirements: [
      'Có Giấy chứng nhận đăng ký doanh nghiệp hoặc quyết định thành lập',
      'Có phương tiện vận chuyển chuyên dùng đạt chuẩn kỹ thuật môi trường đã được cấp phù hiệu',
      'Đã hoàn thành lắp đặt thiết bị giám sát hành trình (GPS) và camera truyền dữ liệu về Ban Quản lý MBS',
      'Có quy trình ứng phó sự cố môi trường và cam kết bảo hiểm trách nhiệm bồi thường thiệt hại',
    ],
    dossierComponents: [
      { name: 'Đơn đề nghị cấp phép tiếp nhận xử lý chất thải (Mẫu 01/MBS)', quantity: '01 bản chính', isOriginal: true, templateUrl: '#' },
      { name: 'Bản sao Giấy phép kinh doanh / Giấy chứng nhận đầu tư', quantity: '01 bản sao y chứng thực', isOriginal: false },
      { name: 'Danh sách phương tiện vận chuyển và bản sao kiểm định an toàn kỹ thuật', quantity: '01 bộ', isOriginal: true },
      { name: 'Phương án điều phối và ứng phó sự cố rò rỉ nước rác, rơi vãi mùi hôi', quantity: '01 bản chính', isOriginal: true },
    ],
    steps: [
      { order: 1, title: 'Nộp hồ sơ trực tuyến', description: 'Tổ chức nộp hồ sơ qua Cổng DVC trực tuyến MBS hoặc gửi trực tiếp tại Bộ phận Một cửa.', duration: '0.5 ngày', responsible: 'Doanh nghiệp / Bộ phận Một cửa' },
      { order: 2, title: 'Thẩm định hồ sơ & kiểm tra thực tế', description: 'Phòng Quản lý Môi trường thẩm tra tính hợp lệ và tổ chức kiểm định phương tiện thực tế.', duration: '15 ngày làm việc', responsible: 'Phòng Quản lý Môi trường MBS' },
      { order: 3, title: 'Trình phê duyệt & Ký số giấy phép', description: 'Lãnh đạo Ban Quản lý xem xét, ký duyệt quyết định và cấp mã định danh RFID xe vận chuyển.', duration: '05 ngày làm việc', responsible: 'Lãnh đạo Ban Quản lý MBS' },
      { order: 4, title: 'Trả kết quả & Cấp thẻ ra vào cổng', description: 'Gửi kết quả bản điện tử qua email/SMS và phát hành thẻ định danh điện tử tại Trung tâm điều hành.', duration: '04 ngày làm việc', responsible: 'Bộ phận Tiếp nhận & Trả kết quả' },
    ],
    faqs: [
      { question: 'Thời hạn của Giấy phép tiếp nhận xử lý rác là bao lâu?', answer: 'Giấy phép có thời hạn 36 tháng kể từ ngày ký. Doanh nghiệp cần nộp hồ sơ gia hạn trước 60 ngày trước khi hết hạn.' },
      { question: 'Lệ phí có thể thanh toán trực tuyến qua đâu?', answer: 'Quý đơn vị có thể thanh toán qua Cổng DVC Quốc gia, quét mã QR Napas247 hoặc chuyển khoản vào tài khoản Kho bạc Nhà nước của Ban Quản lý MBS.' }
    ]
  },
  {
    id: 'dvc-bao-cao-quan-trac-xa-thai',
    code: 'DVC-MBS-02',
    title: 'Kê khai và thẩm định Báo cáo quan trắc chất lượng nước xả thải định kỳ',
    level: 4,
    field: 'Quan trắc & Kiểm soát ô nhiễm',
    targetAudience: 'Các nhà máy, cơ sở chế biến hoạt động trong khuôn viên Khu liên hợp',
    duration: '10 ngày làm việc',
    fee: 'Miễn phí',
    result: 'Thông báo xác nhận kết quả quan trắc đạt quy chuẩn',
    implementationAgency: 'Phòng Kỹ thuật & Công nghệ môi trường - Ban Quản lý MBS',
    description: 'Thủ tục tiếp nhận dữ liệu quan trắc định kỳ hàng quý đối với nước thải công nghiệp và nước rỉ rác trước khi đấu nối vào hệ thống thu gom chung.',
    requirements: [
      'Kết quả phân tích mẫu nước được thực hiện bởi phòng thí nghiệm được Bộ TN&MT cấp chứng chỉ Vimcerts',
      'Nhật ký vận hành trạm xử lý nước thải nội bộ 90 ngày gần nhất',
    ],
    dossierComponents: [
      { name: 'Báo cáo quan trắc môi trường định kỳ (Mẫu số 03/QTMT)', quantity: '01 bản điện tử', isOriginal: true },
      { name: 'Phiếu kết quả phân tích chỉ tiêu nước (BOD, COD, Amoni, Kim loại nặng)', quantity: '01 bản gốc scan', isOriginal: true },
    ],
    steps: [
      { order: 1, title: 'Nộp báo cáo trực tuyến', description: 'Tải tệp PDF và dữ liệu số Excel lên hệ thống DVC MBS.', duration: 'Ngay tức thì', responsible: 'Cơ sở sản xuất' },
      { order: 2, title: 'Đối chiếu dữ liệu tự động & Đánh giá', description: 'Hệ thống AI tự động đối chiếu thông số với trạm quan trắc online và chuyên viên thẩm định.', duration: '07 ngày', responsible: 'Phòng Kỹ thuật & Công nghệ' },
      { order: 3, title: 'Ban hành kết luận thẩm định', description: 'Xuất văn bản xác nhận đạt chuẩn hoặc thông báo yêu cầu cải tạo nâng cấp.', duration: '03 ngày', responsible: 'Lãnh đạo Ban Quản lý' },
    ],
    faqs: [
      { question: 'Nếu chỉ tiêu vượt quy chuẩn xử lý như thế nào?', answer: 'Cơ sở sẽ nhận cảnh báo đỏ, phải tạm ngưng xả thải vào cống thu gom chung trong vòng 24 giờ và tiến hành xử lý khắc phục.' }
    ]
  },
  {
    id: 'dvc-dang-ky-tham-quan-hoc-tap',
    code: 'DVC-MBS-03',
    title: 'Đăng ký tham quan học tập, nghiên cứu khoa học tại Khu liên hợp xử lý chất thải',
    level: 3,
    field: 'Khoa học công nghệ & Đối ngoại',
    targetAudience: 'Các trường Đại học, Viện nghiên cứu, Đoàn thể, Chuyên gia môi trường trong và ngoài nước',
    duration: '05 ngày làm việc',
    fee: 'Miễn phí',
    result: 'Văn bản chấp thuận và Kế hoạch đón tiếp bảo đảm an toàn sinh học',
    implementationAgency: 'Văn phòng Ban Quản lý MBS',
    description: 'Tạo điều kiện cho sinh viên, giảng viên và các tổ chức nghiên cứu tiếp cận thực tế công nghệ xử lý rác, hệ sinh thái vùng đệm và nhà máy phát điện.',
    requirements: [
      'Công văn đề nghị của Trường Đại học / Tổ chức đại diện',
      'Danh sách thành viên đoàn kèm số CCCD/Hộ chiếu để cấp thẻ bảo hộ ra vào',
    ],
    dossierComponents: [
      { name: 'Công văn đề nghị tham quan, khảo sát', quantity: '01 bản scan', isOriginal: true },
      { name: 'Đề cương nghiên cứu (đối với đoàn nghiên cứu khoa học)', quantity: '01 bản', isOriginal: true },
    ],
    steps: [
      { order: 1, title: 'Gửi đăng ký trực tuyến', description: 'Điền thông tin đoàn và lịch trình đề xuất.', duration: '0.5 ngày', responsible: 'Trưởng đoàn' },
      { order: 2, title: 'Xem xét an toàn & Sắp xếp chuyên gia', description: 'Văn phòng phân công cán bộ kỹ thuật hướng dẫn thực địa.', duration: '03 ngày', responsible: 'Văn phòng Ban' },
      { order: 3, title: 'Thông báo lịch trình chi tiết', description: 'Gửi hướng dẫn an toàn lao động và thẻ QR vào cổng.', duration: '01 ngày', responsible: 'Ban Quản lý' },
    ],
    faqs: [
      { question: 'Có được quay phim, chụp ảnh tại hiện trường không?', answer: 'Đoàn được tác nghiệp tại các khu vực cho phép theo hướng dẫn của cán bộ kỹ thuật đi cùng.' }
    ]
  }
];

export const MOCK_TRACKING_DATABASE: Record<string, ApplicationTracking> = {
  'MBS-2026-A92B4': {
    trackingCode: 'MBS-2026-A92B4',
    serviceName: 'Cấp giấy phép tiếp nhận và xử lý chất thải rắn sinh hoạt và công nghiệp thông thường',
    applicantName: 'Công ty Cổ phần Môi trường Đô thị Sài Gòn Xanh',
    applicantPhone: '0908 123 456',
    applicantEmail: 'contact@saigonxanh-env.vn',
    submissionDate: '2026-02-05T09:15:00Z',
    expectedDate: '2026-03-02T17:00:00Z',
    currentStep: 2,
    status: 'tham-dinh',
    statusText: 'Đang thẩm định thực địa và kiểm định phương tiện',
    assignedOfficer: 'Kỹ sư Nguyễn Hoàng Nam',
    department: 'Phòng Quản lý Môi trường - Ban Quản lý MBS',
    history: [
      {
        time: '2026-02-05 09:15',
        title: 'Nộp hồ sơ thành công',
        description: 'Hồ sơ mã MBS-2026-A92B4 đã được gửi thành công qua Cổng Dịch vụ công trực tuyến.',
        officer: 'Hệ thống Một cửa điện tử',
        status: 'completed'
      },
      {
        time: '2026-02-06 14:00',
        title: 'Tiếp nhận & Kiểm tra tính hợp lệ',
        description: 'Hồ sơ đầy đủ các thành phần theo quy định. Đã chuyển hồ sơ sang Phòng Chuyên môn.',
        officer: 'Chuyên viên Trần Thị Mai (Bộ phận Một cửa)',
        status: 'completed'
      },
      {
        time: '2026-02-11 10:30',
        title: 'Thẩm định hồ sơ kỹ thuật',
        description: 'Đang tiến hành kiểm tra danh sách 15 xe cuốn ép rác chuyên dụng và đối soát tín hiệu GPS.',
        officer: 'Kỹ sư Nguyễn Hoàng Nam (Phòng QLMT)',
        status: 'in_progress'
      },
      {
        time: '2026-02-25 (Dự kiến)',
        title: 'Trình Lãnh đạo phê duyệt',
        description: 'Trình Trưởng Ban ký duyệt cấp Giấy phép chính thức và mã vạch RFID.',
        officer: 'Lãnh đạo Ban Quản lý MBS',
        status: 'pending'
      },
      {
        time: '2026-03-02 (Dự kiến)',
        title: 'Hoàn tất & Trả kết quả',
        description: 'Phát hành bản điện tử có ký số và trả kết quả tại Bộ phận Một cửa.',
        officer: 'Bộ phận Tiếp nhận & Trả kết quả',
        status: 'pending'
      }
    ]
  },
  'MBS-2026-B11C8': {
    trackingCode: 'MBS-2026-B11C8',
    serviceName: 'Kê khai và thẩm định Báo cáo quan trắc chất lượng nước xả thải định kỳ',
    applicantName: 'Công ty TNHH Tái chế Nhựa & Năng lượng Xanh',
    applicantPhone: '0912 345 678',
    applicantEmail: 'info@greenplastic.com.vn',
    submissionDate: '2026-02-12T10:00:00Z',
    expectedDate: '2026-02-22T17:00:00Z',
    currentStep: 1,
    status: 'tiep-nhan',
    statusText: 'Hồ sơ mới tiếp nhận, đang kiểm tra dữ liệu mẫu',
    assignedOfficer: 'ThS. Lê Văn Phúc',
    department: 'Phòng Kỹ thuật & Công nghệ',
    history: [
      {
        time: '2026-02-12 10:00',
        title: 'Tiếp nhận hồ sơ trực tuyến',
        description: 'Tiếp nhận báo cáo quan trắc Quý 4/2025 và file chứng chỉ Vimcerts.',
        officer: 'Bộ phận Một cửa',
        status: 'completed'
      },
      {
        time: '2026-02-14 09:00',
        title: 'Đối chiếu số liệu quan trắc',
        description: 'Đang chạy kiểm tra thuật toán đối chiếu nồng độ COD, BOD5 tự động.',
        officer: 'ThS. Lê Văn Phúc',
        status: 'in_progress'
      }
    ]
  },
  'MBS-2026-C88D2': {
    trackingCode: 'MBS-2026-C88D2',
    serviceName: 'Đăng ký tham quan học tập, nghiên cứu khoa học tại Khu liên hợp xử lý chất thải',
    applicantName: 'Trường Đại học Tài nguyên và Môi trường TP.HCM',
    applicantPhone: '028 3844 1234',
    applicantEmail: 'khoa.moitruong@hcmunre.edu.vn',
    submissionDate: '2026-02-01T08:00:00Z',
    expectedDate: '2026-02-06T17:00:00Z',
    currentStep: 4,
    status: 'hoan-tat',
    statusText: 'Hồ sơ đã được phê duyệt và cấp lịch đón tiếp',
    assignedOfficer: 'Văn phòng Ban Quản lý MBS',
    department: 'Văn phòng Ban',
    history: [
      {
        time: '2026-02-01 08:00',
        title: 'Nộp đăng ký',
        description: 'Đăng ký cho đoàn 45 sinh viên ngành Kỹ thuật Môi trường.',
        officer: 'Đoàn Trường',
        status: 'completed'
      },
      {
        time: '2026-02-04 16:30',
        title: 'Phê duyệt kế hoạch',
        description: 'Đã bố trí 02 xe trung chuyển nội bộ và cán bộ thuyết minh kỹ thuật.',
        officer: 'Chánh Văn phòng MBS',
        status: 'completed'
      },
      {
        time: '2026-02-05 09:00',
        title: 'Phát hành thông báo chấp thuận',
        description: 'Đã gửi Giấy chấp thuận có ký số qua email của Nhà trường.',
        officer: 'Bộ phận Tiếp nhận',
        status: 'completed'
      }
    ]
  }
};

export const MOCK_APPLICATIONS: ApplicationTracking[] = Object.values(MOCK_TRACKING_DATABASE);

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-01',
    name: 'TS. Nguyễn Văn Hùng',
    position: 'Trưởng Ban Quản lý MBS',
    department: 'Ban Giám đốc',
    email: 'hungnv.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 101',
    room: 'Phòng 401 - Tầng 4, Trụ sở chính',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    isLeader: true,
  },
  {
    id: 'staff-02',
    name: 'ThS. Trần Thị Kim Oanh',
    position: 'Phó Trưởng Ban Thường trực',
    department: 'Ban Giám đốc',
    email: 'oanhttk.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 102',
    room: 'Phòng 402 - Tầng 4, Trụ sở chính',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    isLeader: true,
  },
  {
    id: 'staff-03',
    name: 'KS. Lê Hoàng Long',
    position: 'Phó Trưởng Ban (Phụ trách Kỹ thuật & Dự án)',
    department: 'Ban Giám đốc',
    email: 'longlh.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 103',
    room: 'Phòng 403 - Tầng 4, Trụ sở chính',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    isLeader: true,
  },
  {
    id: 'staff-04',
    name: 'ThS. Vũ Đình Tuấn',
    position: 'Chánh Văn phòng',
    department: 'Văn phòng Ban',
    email: 'tuanvd.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 201',
    room: 'Phòng 201 - Tầng 2',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'staff-05',
    name: 'Kỹ sư Phạm Hải Đăng',
    position: 'Trưởng phòng Quản lý Môi trường',
    department: 'Phòng Quản lý Môi trường',
    email: 'dangph.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 301',
    room: 'Phòng 301 - Tầng 3',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'staff-06',
    name: 'ThS. Nguyễn Thị Thu Trang',
    position: 'Trưởng phòng Kỹ thuật & Công nghệ',
    department: 'Phòng Kỹ thuật & Công nghệ',
    email: 'trangntt.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 302',
    room: 'Phòng 302 - Tầng 3',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'staff-07',
    name: 'Cử nhân Đỗ Quốc Huy',
    position: 'Trưởng phòng Kế hoạch - Tài chính',
    department: 'Phòng Kế hoạch - Tài chính',
    email: 'huydq.mbs@tphcm.gov.vn',
    phone: '(028) 3822 1234 - Máy lẻ 205',
    room: 'Phòng 205 - Tầng 2',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'staff-08',
    name: 'Kỹ sư Trương Vĩnh Phúc',
    position: 'Giám đốc Chi nhánh Điều hành Khu XLCT Đa Phước',
    department: 'Đơn vị trực thuộc',
    email: 'phuctv.mbs@tphcm.gov.vn',
    phone: '(028) 3761 9999',
    room: 'Nhà Điều hành Đa Phước, Bình Chánh',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  }
];

export const MOCK_ORG_TREE: OrgNode = {
  id: 'org-root',
  title: 'UBND THÀNH PHỐ HỒ CHÍ MINH',
  description: 'Cơ quan chủ quản cấp trên trực tiếp',
  children: [
    {
      id: 'org-board',
      title: 'BAN QUẢN LÝ CÁC KHU LIÊN HỢP XỬ LÝ CHẤT THẢI (MBS)',
      leaderName: 'TS. Nguyễn Văn Hùng',
      leaderTitle: 'Trưởng Ban',
      description: 'Lãnh đạo toàn diện mọi hoạt động điều hành, quy hoạch và bảo vệ môi trường',
      phone: '(028) 3822 1234',
      email: 'bql.mbs@tphcm.gov.vn',
      children: [
        {
          id: 'org-vice-1',
          title: 'Phó Trưởng Ban Thường Trực',
          leaderName: 'ThS. Trần Thị Kim Oanh',
          description: 'Phụ trách công tác Hành chính, Tổ chức cán bộ, Kế hoạch tài chính & Dịch vụ công',
          children: [
            {
              id: 'org-dept-vp',
              title: 'Văn phòng Ban',
              leaderName: 'ThS. Vũ Đình Tuấn',
              leaderTitle: 'Chánh Văn phòng',
              memberCount: 16,
              phone: 'Ext: 201',
              description: 'Tổng hợp, tiếp nhận một cửa, thủ tục hành chính, truyền thông và CNTT'
            },
            {
              id: 'org-dept-khtc',
              title: 'Phòng Kế hoạch - Tài chính',
              leaderName: 'CN. Đỗ Quốc Huy',
              leaderTitle: 'Trưởng phòng',
              memberCount: 12,
              phone: 'Ext: 205',
              description: 'Quản lý ngân sách nhà nước, thẩm định dự toán, đấu thầu dịch vụ công ích'
            }
          ]
        },
        {
          id: 'org-vice-2',
          title: 'Phó Trưởng Ban Kỹ Thuật & Môi Trường',
          leaderName: 'KS. Lê Hoàng Long',
          description: 'Phụ trách chuyên môn Kỹ thuật công nghệ, Giám sát quan trắc môi trường & Dự án Đốt rác phát điện',
          children: [
            {
              id: 'org-dept-qlmt',
              title: 'Phòng Quản lý Môi trường',
              leaderName: 'KS. Phạm Hải Đăng',
              leaderTitle: 'Trưởng phòng',
              memberCount: 22,
              phone: 'Ext: 301',
              description: 'Giám sát chỉ số môi trường khí thải, nước thải, vành đai cây xanh và thanh tra sự cố'
            },
            {
              id: 'org-dept-ktcn',
              title: 'Phòng Kỹ thuật & Công nghệ',
              leaderName: 'ThS. Nguyễn Thị Thu Trang',
              leaderTitle: 'Trưởng phòng',
              memberCount: 18,
              phone: 'Ext: 302',
              description: 'Thẩm định hồ sơ công nghệ, vận hành hệ thống SCADA tự động và nghiên cứu Waste-to-Energy'
            }
          ]
        },
        {
          id: 'org-units',
          title: 'CÁC ĐƠN VỊ VẬN HÀNH THỰC ĐỊA',
          leaderName: 'Trực thuộc Ban Quản lý MBS',
          description: 'Quản lý, vận hành và giám sát trực tiếp tại các vùng liên hợp',
          children: [
            {
              id: 'org-unit-daphuoc',
              title: 'Trung tâm Điều hành Khu LHXLCT Đa Phước',
              leaderName: 'KS. Trương Vĩnh Phúc',
              leaderTitle: 'Giám đốc Chi nhánh',
              memberCount: 65,
              phone: '(028) 3761 9999',
              description: 'Bình Chánh - Tiếp nhận xử lý 6.500 tấn/ngày, trạm quan trắc tự động và bãi chôn lấp hợp vệ sinh'
            },
            {
              id: 'org-unit-phuochiep',
              title: 'Trung tâm Điều hành Khu LHXLCT Phước Hiệp',
              leaderName: 'KS. Hoàng Minh Đức',
              leaderTitle: 'Giám đốc Chi nhánh',
              memberCount: 45,
              phone: '(028) 3795 8888',
              description: 'Củ Chi - Khu liên hợp quy mô 687 ha, triển khai dự án đốt rác phát điện và phân bón hữu cơ'
            }
          ]
        }
      ]
    }
  ]
};

export const MOCK_WORK_SCHEDULE: WorkScheduleItem[] = [
  {
    id: 'ws-mon',
    dayOfWeek: 'Thứ Hai',
    date: '16/02/2026',
    morning: [
      {
        time: '08:00',
        content: 'Họp Giao ban Thường trực Ban Quản lý MBS đầu tuần',
        host: 'TS. Nguyễn Văn Hùng - Trưởng Ban',
        participants: 'Ban Giám đốc, Trưởng/Phó các Phòng ban và Giám đốc 2 Chi nhánh Đa Phước, Phước Hiệp',
        location: 'Phòng Họp số 1 - Trụ sở chính'
      },
      {
        time: '10:00',
        content: 'Làm việc với Sở Tài nguyên & Môi trường về báo cáo tiến độ chỉ tiêu giảm chôn lấp rác',
        host: 'ThS. Trần Thị Kim Oanh - Phó Trưởng Ban',
        participants: 'Phòng Quản lý Môi trường, Phòng KHTC',
        location: 'Hội trường Sở TN&MT TP.HCM'
      }
    ],
    afternoon: [
      {
        time: '14:00',
        content: 'Kiểm tra hiện trường lắp đặt cảm biến quan trắc khí thải tại Khu xử lý Đa Phước',
        host: 'KS. Lê Hoàng Long - Phó Trưởng Ban',
        participants: 'Phòng Kỹ thuật & Công nghệ, Nhà thầu thiết bị',
        location: 'Khu LHXLCT Đa Phước, Bình Chánh'
      }
    ]
  },
  {
    id: 'ws-tue',
    dayOfWeek: 'Thứ Ba',
    date: '17/02/2026',
    morning: [
      {
        time: '08:30',
        content: 'Dự họp UBND TP.HCM về giải phóng mặt bằng vùng đệm cách ly sinh thái Phước Hiệp',
        host: 'TS. Nguyễn Văn Hùng - Trưởng Ban',
        participants: 'UBND Huyện Củ Chi, Sở Quy hoạch Kiến trúc',
        location: 'Văn phòng UBND TP.HCM'
      }
    ],
    afternoon: [
      {
        time: '14:00',
        content: 'Thẩm định hồ sơ cấp phép tiếp nhận xử lý rác thải sinh hoạt đợt 1 năm 2026',
        host: 'ThS. Trần Thị Kim Oanh - Phó Trưởng Ban',
        participants: 'Hội đồng thẩm định Một cửa MBS',
        location: 'Phòng Họp số 2'
      }
    ]
  },
  {
    id: 'ws-wed',
    dayOfWeek: 'Thứ Tư',
    date: '18/02/2026',
    morning: [
      {
        time: '09:00',
        content: 'Tiếp và làm việc với Đoàn Chuyên gia Môi trường JICA (Nhật Bản) về công nghệ xử lý tro xỉ phát điện',
        host: 'TS. Nguyễn Văn Hùng - Trưởng Ban',
        participants: 'Phòng Kỹ thuật & Công nghệ, Văn phòng Ban',
        location: 'Phòng Khánh tiết quốc tế'
      }
    ],
    afternoon: [
      {
        time: '14:30',
        content: 'Kiểm tra công tác an toàn phòng cháy chữa cháy và phun xịt vi sinh khử mùi',
        host: 'KS. Lê Hoàng Long - Phó Trưởng Ban',
        participants: 'Chi nhánh Phước Hiệp',
        location: 'Khu liên hợp Phước Hiệp'
      }
    ]
  },
  {
    id: 'ws-thu',
    dayOfWeek: 'Thứ Năm',
    date: '19/02/2026',
    morning: [
      {
        time: '08:00',
        content: 'Tiếp công dân định kỳ và giải quyết các phản ánh môi trường tuần qua',
        host: 'Ban Giám đốc MBS',
        participants: 'Văn phòng, Phòng Quản lý Môi trường, Bộ phận Pháp chế',
        location: 'Phòng Tiếp công dân - Trụ sở MBS'
      }
    ],
    afternoon: [
      {
        time: '14:00',
        content: 'Hội thảo chuyên đề: "Chuyển đổi số trong giám sát phương tiện vận chuyển rác thải đô thị qua RFID & GPS"',
        host: 'KS. Lê Hoàng Long - Phó Trưởng Ban',
        participants: 'Toàn thể kỹ sư công nghệ và đại diện 24 doanh nghiệp thu gom',
        location: 'Hội trường Tầng 5'
      }
    ]
  },
  {
    id: 'ws-fri',
    dayOfWeek: 'Thứ Sáu',
    date: '20/02/2026',
    morning: [
      {
        time: '08:30',
        content: 'Họp rà soát tiến độ giải ngân vốn đầu tư công các dự án bảo vệ môi trường',
        host: 'TS. Nguyễn Văn Hùng - Trưởng Ban',
        participants: 'Phòng KHTC, Ban Quản lý dự án',
        location: 'Phòng Họp số 1'
      }
    ],
    afternoon: [
      {
        time: '15:00',
        content: 'Họp tổng kết tuần và phân công trực cuối tuần 24/24',
        host: 'Ban Giám đốc MBS',
        participants: 'Trưởng các bộ phận',
        location: 'Phòng Họp số 1'
      }
    ]
  }
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-01',
    category: 'Thủ tục & Dịch vụ công',
    question: 'Hồ sơ xin cấp Giấy phép tiếp nhận rác thải gồm những giấy tờ gì?',
    answer: 'Hồ sơ bao gồm: Đơn đề nghị cấp phép (Mẫu 01/MBS), bản sao Giấy phép kinh doanh, danh sách phương tiện đạt chuẩn có kiểm định kèm thiết bị GPS hợp chuẩn, và phương án phòng ngừa ứng phó sự cố môi trường theo quy định của Bộ TN&MT.',
    views: 4120
  },
  {
    id: 'faq-02',
    category: 'Môi trường & Giám sát',
    question: 'Người dân muốn phản ánh về mùi hôi hoặc ô nhiễm xe chở rác thì gửi qua kênh nào nhanh nhất?',
    answer: 'Người dân có thể phản ánh trực tiếp qua Cổng thông tin điện tử MBS tại mục "Phản ánh môi trường", gọi Tổng đài trực 24/7: 1900 8888 68 hoặc qua Cổng 1022 của TP.HCM. Mọi thông tin phản ánh đều được cấp mã tra cứu theo dõi kết quả xử lý.',
    views: 6540
  },
  {
    id: 'faq-03',
    category: 'Quy hoạch & Công nghệ',
    question: 'Tiến độ dự án Nhà máy Đốt rác phát điện tại TP.HCM hiện nay như thế nào?',
    answer: 'Hiện nay TP.HCM đang triển khai đồng loạt các nhà máy đốt phát điện tại Khu Đa Phước và Tây Bắc Củ Chi với công nghệ lò ghi cơ học hiện đại của châu Âu và Nhật Bản, dự kiến hoàn thành giai đoạn 1 với công suất 4.000 tấn/ngày trong năm 2026.',
    views: 3280
  },
  {
    id: 'faq-04',
    category: 'Tham quan & Học tập',
    question: 'Quy trình đăng ký tham quan thực tế Khu liên hợp xử lý rác dành cho sinh viên trường Đại học?',
    answer: 'Đại diện nhà trường hoặc khoa chỉ cần nộp Công văn đề nghị và danh sách thành viên trên Cổng DVC MBS mục "Đăng ký tham quan học tập". Ban Quản lý MBS sẽ phê duyệt và gửi hướng dẫn đón tiếp trong vòng 03 đến 05 ngày làm việc hoàn toàn miễn phí.',
    views: 1920
  }
];

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: 'media-01',
    title: 'Toàn cảnh Khu liên hợp xử lý chất thải Đa Phước từ trên cao',
    category: 'Khu liên hợp Đa Phước',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    date: '10/02/2026',
    description: 'Hệ thống hồ sinh học xử lý nước rỉ rác công nghệ màng MBR và vành đai cây xanh cách ly sinh thái rộng 128 ha.',
    mediaCount: 12
  },
  {
    id: 'media-02',
    title: 'Quy trình vận hành trạm cân điện tử tự động nhận diện biển số xe',
    category: 'Công nghệ xử lý rác',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    date: '08/02/2026',
    description: 'Tự động hóa hoàn toàn việc cân khối lượng, đối chiếu định mức và cấp chứng từ điện tử trong 30 giây.',
    mediaCount: 8
  },
  {
    id: 'media-03',
    title: 'Phóng sự: Hành trình chuyển đổi xanh của ngành xử lý rác TP.HCM',
    category: 'Hoạt động đoàn thể',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
    type: 'video',
    date: '05/02/2026',
    description: 'Video phóng sự tài liệu ghi nhận sự nỗ lực của tập thể cán bộ công nhân viên Ban Quản lý MBS hướng tới đô thị không rác thải.',
    videoDuration: '08:45'
  },
  {
    id: 'media-04',
    title: 'Hệ thống pin năng lượng mặt trời áp mái tại nhà điều hành Phước Hiệp',
    category: 'Khu liên hợp Phước Hiệp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    date: '02/02/2026',
    description: 'Ứng dụng năng lượng sạch tự cung cấp 100% điện năng cho khu nhà điều hành và trạm giám sát.',
    mediaCount: 6
  }
];

export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'fac-01',
    name: 'Khu Liên Hợp Xử Lý Chất Thải Đa Phước',
    location: 'Xã Đa Phước, Huyện Bình Chánh, TP. Hồ Chí Minh',
    status: 'Đang vận hành',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    area: '128 Hécta',
    capacity: '6.500 tấn/ngày',
    technologies: ['Chôn lấp hợp vệ sinh', 'Xử lý nước rỉ rác MBR/RO', 'Thu hồi Biogas phát điện', 'Sản xuất Compost']
  },
  {
    id: 'fac-02',
    name: 'Khu Liên Hợp Xử Lý Chất Thải Phước Hiệp (Tây Bắc)',
    location: 'Xã Phước Hiệp, Huyện Củ Chi, TP. Hồ Chí Minh',
    status: 'Đang vận hành & Chuyển đổi công nghệ',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
    area: '687 Hécta',
    capacity: '4.000 tấn/ngày',
    technologies: ['Đốt rác phát điện (WTE)', 'Tái chế nhựa & cao su', 'Sản xuất phân bón hữu cơ', 'Chôn lấp trơ an toàn']
  }
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'stf-01', name: 'TS. Nguyễn Văn Hùng', title: 'Trưởng Ban Quản lý', position: 'Trưởng Ban Quản lý', department: 'Ban Giám đốc', phone: '028 3822 1234', room: '101', extension: '101', email: 'hung.nv@mbs.hochiminhcity.gov.vn', avatarUrl: '' },
  { id: 'stf-02', name: 'ThS. Trần Thị Mai', title: 'Phó Trưởng ban', position: 'Phó Trưởng ban', department: 'Ban Giám đốc', phone: '028 3822 1234', room: '102', extension: '102', email: 'mai.tt@mbs.hochiminhcity.gov.vn', avatarUrl: '' },
  { id: 'stf-03', name: 'Kỹ sư Nguyễn Hoàng Nam', title: 'Trưởng phòng QLMT', position: 'Trưởng phòng QLMT', department: 'Phòng Quản lý Môi trường', phone: '028 3822 1234', room: '201', extension: '201', email: 'nam.nh@mbs.hochiminhcity.gov.vn', avatarUrl: '' },
  { id: 'stf-04', name: 'ThS. Lê Văn Phúc', title: 'Trưởng phòng Kỹ thuật', position: 'Trưởng phòng Kỹ thuật', department: 'Phòng Kỹ thuật & Công nghệ', phone: '028 3822 1234', room: '301', extension: '301', email: 'phuc.lv@mbs.hochiminhcity.gov.vn', avatarUrl: '' }
];

export const MOCK_POLLS = [
  {
    id: 'poll-01',
    question: 'Đánh giá mức độ hài lòng về chất lượng Dịch vụ công trực tuyến của Ban Quản lý MBS năm 2026?',
    status: 'ACTIVE',
    totalVotes: 1420,
    options: [
      { text: 'Rất hài lòng (Thủ tục nhanh gọn, minh bạch)', votes: 980 },
      { text: 'Hài lòng (Đạt yêu cầu)', votes: 340 },
      { text: 'Bình thường (Cần cải thiện tốc độ trả kết quả)', votes: 80 },
      { text: 'Chưa hài lòng', votes: 20 }
    ]
  }
];

export const MOCK_AUDIT_LOGS = [
  { id: 'aud-01', timestamp: '17/02/2026 14:35:12', actor: 'admin@mbs.hochiminhcity.gov.vn', ip: '14.241.120.88', action: 'APPROVE_POST', target: 'Triển khai hệ thống quan trắc tự động #news-01' },
  { id: 'aud-02', timestamp: '17/02/2026 11:20:05', actor: 'nam.nh@mbs.hochiminhcity.gov.vn', ip: '14.241.120.90', action: 'ASSIGN_OFFICER', target: 'Phân công thụ lý hồ sơ DVC #MBS-2026-8891' },
  { id: 'aud-03', timestamp: '17/02/2026 09:15:40', actor: 'mai.tt@mbs.hochiminhcity.gov.vn', ip: '14.241.120.92', action: 'PUBLISH_FEEDBACK', target: 'Duyệt công khai phản ánh vi phạm #FB-2026-9804' }
];


