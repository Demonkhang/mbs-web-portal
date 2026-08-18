import { prisma } from '@mbs/database';

async function main() {
  console.log('🌱 Starting full PostgreSQL DB seeding...');

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

  // 3. Posts
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
      currentStep: 2,
      status: 'DANG_XU_LY',
      statusText: 'Hồ sơ đang được phòng Thẩm định xem xét chuyên môn',
      assignedOfficer: 'Kỹ sư Nguyễn Hoàng Nam',
      department: 'Phòng Thẩm định & Cấp phép',
      notes: 'Đã nhận đủ hồ sơ bản cứng',
    },
  });

  // 6. Inquiries
  console.log(' Seeding environmental inquiries...');
  await prisma.inquiry.createMany({
    data: [
      {
        id: 'inq-01',
        title: 'Phản ánh tình trạng xả thải nước rỉ rác khu vực lân cận',
        content: 'Tôi muốn tìm hiểu thêm về lịch kiểm tra giám sát định kỳ chất lượng không khí xung quanh Khu xử lý Đa Phước.',
        fullName: 'Trần Văn Bình',
        email: 'tranbinh@gmail.com',
        phone: '0912345678',
        latitude: 10.6658,
        longitude: 106.6622,
        replyContent: 'Ban Quản lý MBS đã nhận được phản ánh và tổ chức quan trắc định kỳ hàng tuần. Kết quả kiểm tra đạt tiêu chuẩn.',
        repliedBy: 'TS. Nguyễn Văn Hùng',
        repliedAt: new Date(),
        isPublic: true,
        status: 'RESOLVED',
      },
    ],
    skipDuplicates: true,
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
