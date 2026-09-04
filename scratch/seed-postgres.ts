import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { prisma } from '@mbs/database';

async function main() {
  // 0. System Role Definitions & Permissions Matrix
  console.log(' Seeding system Role Definitions & Permission Matrix...');
  const ALL_PERMISSIONS = [
    'users:view', 'users:create', 'users:update', 'users:toggle_status', 'users:delete', 'roles:manage', 'audit:view',
    'posts:view', 'posts:create', 'posts:update_own', 'posts:update_all', 'posts:review', 'posts:approve', 'posts:delete', 'categories:manage', 'media:upload',
    'documents:view', 'documents:create', 'documents:update', 'documents:delete',
    'submissions:view', 'submissions:process', 'submissions:assign', 'forms:manage',
    'inquiries:view', 'inquiries:reply', 'inquiries:publish',
    'schedules:manage', 'polls:manage', 'faqs:manage'
  ];

  await prisma.roleDefinition.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: { permissions: ALL_PERMISSIONS },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Quản trị tối cao (Super Admin)',
      description: 'Toàn quyền điều hành toàn bộ hệ thống, quản lý tài khoản, phân quyền và audit log.',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
      isSystem: true,
      permissions: ALL_PERMISSIONS,
    },
  });

  await prisma.roleDefinition.upsert({
    where: { code: 'ADMIN' },
    update: { permissions: ALL_PERMISSIONS },
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên Hệ thống',
      description: 'Quản lý cán bộ, chuyên mục, biểu mẫu dịch vụ công và phân quyền.',
      badgeClass: 'bg-purple-950 text-purple-300 border-purple-800',
      isSystem: true,
      permissions: ALL_PERMISSIONS.filter((p) => p !== 'roles:manage'),
    },
  });

  await prisma.roleDefinition.upsert({
    where: { code: 'APPROVER' },
    update: {
      permissions: [
        'posts:view', 'posts:approve_leadership', 'posts:publish', 'posts:unpublish', 'posts:update_all',
        'documents:view', 'audit:view'
      ],
    },
    create: {
      code: 'APPROVER',
      name: 'Lãnh đạo Phê duyệt (Approver)',
      description: 'Lãnh đạo Ban biên tập trực tiếp đọc duyệt, chấm điểm nhuận bút và phê duyệt bài viết.',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
      isSystem: true,
      permissions: [
        'posts:view', 'posts:approve_leadership', 'posts:publish', 'posts:unpublish', 'posts:update_all',
        'documents:view', 'audit:view'
      ],
    },
  });

  await prisma.roleDefinition.upsert({
    where: { code: 'EDITOR_LEAD' },
    update: {
      permissions: [
        'posts:view', 'posts:create', 'posts:edit_technical', 'posts:approve_leadership', 'posts:publish', 'posts:unpublish', 'posts:update_own', 'posts:update_all', 'posts:review', 'posts:approve', 'posts:delete',
        'categories:manage', 'media:upload', 'documents:view', 'documents:create', 'documents:update', 'schedules:manage', 'faqs:manage'
      ],
    },
    create: {
      code: 'EDITOR_LEAD',
      name: 'Thư ký / Trưởng Ban Biên tập',
      description: 'Biên tập, hiệu đính kỹ thuật bài viết, trình duyệt và xuất bản tin bài.',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      isSystem: true,
      permissions: [
        'posts:view', 'posts:create', 'posts:edit_technical', 'posts:approve_leadership', 'posts:publish', 'posts:unpublish', 'posts:update_own', 'posts:update_all', 'posts:review', 'posts:approve', 'posts:delete',
        'categories:manage', 'media:upload', 'documents:view', 'documents:create', 'documents:update', 'schedules:manage', 'faqs:manage'
      ],
    },
  });

  await prisma.roleDefinition.upsert({
    where: { code: 'EDITOR' },
    update: {},
    create: {
      code: 'EDITOR',
      name: 'Biên tập viên Tin bài',
      description: 'Soạn thảo tin bài, trình duyệt nội dung bài viết và xem văn bản.',
      badgeClass: 'bg-sky-950 text-sky-300 border-sky-800',
      isSystem: true,
      permissions: ['posts:view', 'posts:create', 'posts:update_own', 'media:upload', 'documents:view'],
    },
  });

  await prisma.roleDefinition.upsert({
    where: { code: 'OFFICER' },
    update: {},
    create: {
      code: 'OFFICER',
      name: 'Chuyên viên Thụ lý Hồ sơ',
      description: 'Tiếp nhận, thẩm định hồ sơ Dịch vụ công và phản ánh môi trường của người dân.',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
      isSystem: true,
      permissions: ['submissions:view', 'submissions:process', 'inquiries:view', 'inquiries:reply', 'documents:view', 'schedules:manage'],
    },
  });

  // 1. Users
  console.log(' Seeding users...');
  await prisma.user.createMany({
    data: [
      {
        id: 'usr-khang-01',
        username: 'khang.tt',
        email: 'khang.tt@mbs.hochiminhcity.gov.vn',
        passwordHash: 'admin123',
        fullName: 'Lưu Chử Khang',
        role: 'SUPER_ADMIN',
        department: 'Ban Giám đốc',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        isActive: true,
      },
      {
        id: 'usr-admin-00',
        username: 'admin',
        email: 'admin@mbs.hochiminhcity.gov.vn',
        passwordHash: 'admin123',
        fullName: 'Quản trị viên Hệ thống (Admin)',
        role: 'SUPER_ADMIN',
        department: 'Ban Giám đốc',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        isActive: true,
      },
      {
        id: 'usr-hung-02',
        username: 'hung.nv',
        email: 'hung.nv@mbs.hochiminhcity.gov.vn',
        passwordHash: 'admin123',
        fullName: 'TS. Nguyễn Văn Hùng',
        role: 'SUPER_ADMIN',
        department: 'Ban Giám đốc',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
        isActive: true,
      },
      {
        id: 'usr-nam-03',
        username: 'nam.nh',
        email: 'nam.nh@mbs.hochiminhcity.gov.vn',
        passwordHash: 'admin123',
        fullName: 'Kỹ sư Nguyễn Hoàng Nam',
        role: 'EDITOR_LEAD',
        department: 'Ban Biên tập',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        isActive: true,
      },
      {
        id: 'usr-lan-04',
        username: 'lan.hth',
        email: 'lan.hth@mbs.hochiminhcity.gov.vn',
        passwordHash: 'admin123',
        fullName: 'Hoàng Thị Hương Lan',
        role: 'EDITOR',
        department: 'Ban Biên tập',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
        isActive: true,
      },
      {
        id: 'usr-tuan-05',
        username: 'tuan.ph',
        email: 'tuan.ph@mbs.hochiminhcity.gov.vn',
        passwordHash: 'admin123',
        fullName: 'Phạm Hoàng Tuấn',
        role: 'OFFICER',
        department: 'Phòng Thẩm định & Thụ lý',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 2. Categories
  console.log(' Seeding categories...');
  const cat01 = await prisma.category.upsert({
    where: { slug: 'khoa-hoc-cong-nghe' },
    update: { name: 'Khoa học Công nghệ' },
    create: { id: 'cat-01', name: 'Khoa học Công nghệ', slug: 'khoa-hoc-cong-nghe' },
  });

  const cat02 = await prisma.category.upsert({
    where: { slug: 'hoat-dong-ban' },
    update: { name: 'Hoạt động Ban' },
    create: { id: 'cat-02', name: 'Hoạt động Ban', slug: 'hoat-dong-ban' },
  });

  const cat03 = await prisma.category.upsert({
    where: { slug: 'moi-truong-do-thi' },
    update: { name: 'Môi trường & Đô thị' },
    create: { id: 'cat-03', name: 'Môi trường & Đô thị', slug: 'moi-truong-do-thi' },
  });

  // 3. Posts (Include PENDING_REVIEW & DRAFT for testing approval queue)
  console.log(' Seeding posts...');
  await prisma.post.upsert({
    where: { slug: 'trien-khai-cong-nghe-dot-rac-phat-dien-hien-dai-tai-khu-lhxlct-da-phuoc' },
    update: {},
    create: {
      id: 'post-01',
      slug: 'trien-khai-cong-nghe-dot-rac-phat-dien-hien-dai-tai-khu-lhxlct-da-phuoc',
      title: 'MBS triển khai dự án công nghệ Đốt rác phát điện hiện đại tại Khu LHXLCT Đa Phước',
      summary: 'Dự án có công suất xử lý 2.000 tấn/ngày đêm, góp phần giảm tỷ lệ chôn lấp rác thải của TP.HCM xuống dưới 20%.',
      content: '<p>Ban Quản lý các Khu liên hợp xử lý chất thải TP.HCM (MBS) vừa chính thức khởi công dự án Đốt rác phát điện hiện đại tại Khu liên hợp xử lý chất thải Đa Phước, huyện Bình Chánh.</p>',
      categoryId: cat01.id,
      authorId: 'usr-hung-02',
      views: 1250,
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      isSpotlight: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  await prisma.post.upsert({
    where: { slug: 'tang-cuong-giam-sat-chat-luong-moi-truong-tai-khu-lhxlct-phuoc-hiep' },
    update: {},
    create: {
      id: 'post-02',
      slug: 'tang-cuong-giam-sat-chat-luong-moi-truong-tai-khu-lhxlct-phuoc-hiep',
      title: 'Tăng cường công tác giám sát chất lượng môi trường định kỳ tại Khu LHXLCT Phước Hiệp',
      summary: 'Đoàn kiểm tra liên ngành Sở TN&MT kiểm tra hệ thống thu gom và xử lý nước rỉ rác đạt chuẩn cột A.',
      content: '<p>Thực hiện chỉ đạo của UBND TP.HCM, Ban Quản lý MBS phối hợp cùng các đơn vị chuyên môn tổ chức quan trắc tự động 24/7 đối với khí thải, nước thải đầu ra tại Khu liên hợp Phước Hiệp, Củ Chi.</p>',
      categoryId: cat02.id,
      authorId: 'usr-khang-01',
      views: 890,
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      isFeatured: false,
      isSpotlight: false,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // Pending Review Posts (Hàng đợi Phê duyệt)
  await prisma.post.upsert({
    where: { slug: 'ke-hoach-phan-loai-rac-tai-nguon-tren-dia-ban-tp-hcm-nam-2026' },
    update: {},
    create: {
      id: 'post-03',
      slug: 'ke-hoach-phan-loai-rac-tai-nguon-tren-dia-ban-tp-hcm-nam-2026',
      title: 'Kế hoạch mở rộng mô hình phân loại chất thải rắn sinh hoạt tại nguồn năm 2026',
      summary: 'Tập trung hướng dẫn phân loại 3 nhóm rác chính tại các hộ gia đình và khu dân cư tập trung.',
      content: '<p>Ban Quản lý MBS phối hợp cùng UBND các quận huyện đẩy mạnh công tác tuyên truyền và cấp phát thùng rác phân loại 3 màu chuẩn quy định.</p>',
      categoryId: cat03.id,
      authorId: 'usr-lan-04',
      views: 120,
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      isFeatured: false,
      isSpotlight: false,
      status: 'PENDING_REVIEW',
      publishedAt: null,
    },
  });

  await prisma.post.upsert({
    where: { slug: 'ung-dung-he-thong-thong-tin-dia-ly-gis-quan-ly-khu-lien-hop-rac-thai' },
    update: {},
    create: {
      id: 'post-04',
      slug: 'ung-dung-he-thong-thong-tin-dia-ly-gis-quan-ly-khu-lien-hop-rac-thai',
      title: 'Ứng dụng hệ thống thông tin địa lý GIS trong quản lý hạ tầng các Khu liên hợp xử lý chất thải',
      summary: 'Số hóa toàn bộ sơ đồ hạ tầng thu gom, xử lý nước thải và ô cống chôn lấp rác trên bản đồ số GIS.',
      content: '<p>Trung tâm Công nghệ thông tin MBS nghiệm thu giai đoạn 1 dự án bản đồ số môi trường chuyên ngành.</p>',
      categoryId: cat01.id,
      authorId: 'usr-nam-03',
      views: 310,
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      isFeatured: false,
      isSpotlight: false,
      status: 'PENDING_REVIEW',
      publishedAt: null,
    },
  });

  // 4. Legal Documents
  console.log(' Seeding legal documents...');
  await prisma.legalDocument.upsert({
    where: { code: '05/2024/QĐ-UBND' },
    update: {},
    create: {
      id: 'doc-01',
      code: '05/2024/QĐ-UBND',
      title: 'Quyết định về ban hành Quy định quản lý chất thải rắn sinh hoạt trên địa bàn TP.HCM',
      docType: 'Quyết định',
      issuingAgency: 'UBND TP.Hồ Chí Minh',
      signer: 'Phan Văn Mãi',
      issueDate: new Date('2024-02-15'),
      effectiveDate: new Date('2024-03-01'),
      status: 'Còn hiệu lực',
      domain: 'Quản lý chất thải rắn',
      fileSize: '3.2 MB',
      fileUrl: '/uploads/documents/05-2024-QD-UBND.pdf',
      downloadsCount: 1450,
      viewsCount: 3200,
      fullText: 'Quy định này quy định về phân loại rác tại nguồn, công tác thu gom, vận chuyển và xử lý chất thải rắn sinh hoạt trên địa bàn TP.HCM...',
    },
  });

  await prisma.legalDocument.upsert({
    where: { code: '12/2025/TT-BTNMT' },
    update: {},
    create: {
      id: 'doc-02',
      code: '12/2025/TT-BTNMT',
      title: 'Thông tư Hướng dẫn kỹ thuật lựa chọn công nghệ xử lý chất thải rắn sinh hoạt',
      docType: 'Thông tư',
      issuingAgency: 'Bộ Tài nguyên và Môi trường',
      signer: 'Đỗ Đức Duy',
      issueDate: new Date('2025-05-10'),
      effectiveDate: new Date('2025-07-01'),
      status: 'Còn hiệu lực',
      domain: 'Môi trường',
      fileSize: '4.8 MB',
      fileUrl: '/uploads/documents/12-2025-TT-BTNMT.pdf',
      downloadsCount: 980,
      viewsCount: 2100,
      fullText: 'Ưu tiên các công nghệ hiện đại, đốt rác phát điện (Waste-to-Energy), giảm thiểu chôn lấp hợp vệ sinh...',
    },
  });

  // 5. Forms & Submissions
  console.log(' Seeding forms and public service submissions...');
  await prisma.form.upsert({
    where: { code: 'FORM_CAP_PHEP_MT' },
    update: {},
    create: {
      id: 'form-01',
      code: 'FORM_CAP_PHEP_MT',
      title: 'Đơn đăng ký Cấp phép Môi trường',
      description: 'Dành cho các cơ sở kinh doanh, dự án đầu tư trên địa bàn TP.HCM',
      schemaJson: JSON.stringify({
        type: 'object',
        properties: {
          projectName: { type: 'string', title: 'Tên dự án/cơ sở' },
          capacity: { type: 'string', title: 'Công suất thiết kế' },
          address: { type: 'string', title: 'Địa điểm thực hiện' },
        },
      }),
      isActive: true,
    },
  });

  await prisma.publicServiceSubmission.upsert({
    where: { trackingCode: 'MBS-2026-00001' },
    update: {},
    create: {
      id: 'sub-01',
      trackingCode: 'MBS-2026-00001',
      serviceName: 'Cấp phép môi trường cho cơ sở xử lý rác thải',
      applicantName: 'Công ty TNHH Môi trường Xanh TP.HCM',
      applicantPhone: '0908123456',
      applicantEmail: 'contact@moitruongxanh.com.vn',
      expectedDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      currentStep: 1,
      status: 'TIEP_NHAN',
      statusText: 'Đã tiếp nhận hồ sơ trực tuyến thành công',
      assignedOfficer: 'Phạm Hoàng Tuấn',
      department: 'Bộ phận Một cửa MBS',
      notes: 'Hồ sơ mới tiếp nhận trực tuyến',
    },
  });

  await prisma.publicServiceSubmission.upsert({
    where: { trackingCode: 'MBS-2026-00002' },
    update: {},
    create: {
      id: 'sub-02',
      trackingCode: 'MBS-2026-00002',
      serviceName: 'Đăng ký kiểm tra định kỳ hệ thống xử lý nước thải',
      applicantName: 'Công ty Cổ phần Năng lượng Tái tạo Sài Gòn',
      applicantPhone: '0918999888',
      applicantEmail: 'info@sg-energy.vn',
      expectedDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      currentStep: 2,
      status: 'DANG_XU_LY',
      statusText: 'Hồ sơ đang được thẩm định báo cáo đánh giá tác động',
      assignedOfficer: 'Kỹ sư Nguyễn Hoàng Nam',
      department: 'Phòng Thẩm định & Cấp phép',
      notes: 'Đã hoàn thành kiểm tra thực địa',
    },
  });

  // 6. Environmental Feedback
  console.log(' Seeding environmental inquiries & feedbacks...');
  await prisma.environmentalFeedback.upsert({
    where: { ticketCode: 'MBS-FB-2026-001' },
    update: {},
    create: {
      id: 'fb-01',
      ticketCode: 'MBS-FB-2026-001',
      title: 'Phản ánh tình trạng xe chở rác rơi vãi nước rỉ trên đường Huỳnh Tấn Phát',
      senderName: 'Trần Văn Bình',
      senderPhone: '0912345678',
      location: 'Quận 7, TP.Hồ Chí Minh',
      status: 'da-tiep-nhan',
      statusText: 'Đã tiếp nhận phản ánh và chuyển Tổ kiểm tra giao thông vận chuyển rác',
    },
  });

  await prisma.environmentalFeedback.upsert({
    where: { ticketCode: 'MBS-FB-2026-002' },
    update: {},
    create: {
      id: 'fb-02',
      ticketCode: 'MBS-FB-2026-002',
      title: 'Kiểm tra mùi hôi phát sinh vào ban đêm khu vực lân cận Đa Phước',
      senderName: 'Lê Thị Mai',
      senderPhone: '0987654321',
      location: 'Huyện Bình Chánh, TP.Hồ Chí Minh',
      status: 'da-tiep-nhan',
      statusText: 'Chờ kết quả quan trắc không khí tự động',
    },
  });

  // 7. FAQs, Polls, Weekly Schedules
  console.log(' Seeding FAQs, Polls & Weekly Schedules...');
  await prisma.faq.createMany({
    data: [
      {
        id: 'faq-01',
        question: 'Quy trình nộp hồ sơ xin cấp phép môi trường như thế nào?',
        answer: 'Doanh nghiệp thực hiện kê khai trên Cổng dịch vụ công MBS, đính kèm file scan hồ sơ và nộp trực tuyến.',
        category: 'Dịch vụ công',
        order: 1,
        isPublished: true,
      },
      {
        id: 'faq-02',
        question: 'Thời gian giải quyết hồ sơ thủ tục hành chính là bao lâu?',
        answer: 'Thời hạn giải quyết từ 05 đến 15 ngày làm việc tùy thuộc vào quy mô dự án.',
        category: 'Dịch vụ công',
        order: 2,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.weeklySchedule.createMany({
    data: [
      {
        id: 'sched-01',
        weekNumber: 34,
        year: 2026,
        dayOfWeek: 'Thứ Hai',
        date: new Date(),
        timeSlot: '08:00 - 11:30',
        eventTitle: 'Họp Giao ban Ban Giám đốc Ban Quản lý MBS',
        leaderName: 'Lưu Chử Khang - Trưởng Ban',
        location: 'Phòng họp số 1 - Trụ sở Ban Quản lý MBS',
        attendees: 'Lãnh đạo các Phòng/Đơn vị',
        isPublic: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ PostgreSQL DB seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding PostgreSQL DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
