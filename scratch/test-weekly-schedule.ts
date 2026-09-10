import { prisma } from '@mbs/database';
import { parseWeeklyScheduleExcel } from '../apps/api/src/modules/utilities/weekly-schedule-parser.service';
import * as XLSX from 'xlsx';

async function testWeeklySchedule() {
  console.log('--- Testing Weekly Schedule Database & Excel Service ---');

  // 1. Create a dummy workbook in memory
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['LỊCH TUẦN - BAN QUẢN LÝ CÁC KHU LIÊN HỢP XỬ LÝ CHẤT THẢI THÀNH PHỐ (MBS)'],
    ['(31/08/2026-06/09/2026)'],
    ['Thời gian', '', 'Nội dung', 'Chủ trì', 'Thành phần', 'Địa điểm', 'Ghi chú'],
    ['Thứ 2, 31/08/2026'],
    ['Cả ngày', '07:30 - 17:00', 'NGHỈ LỄ 2/9 (Theo TB số 1841/TB-BQLKLH-VP)', '', '', '-', ''],
    ['Thứ 5, 03/09/2026'],
    ['', '08:00 - 11:30', 'Hội nghị toàn quốc nghiên cứu, học tập, quán triệt chỉ thị', 'PGĐ Lê Thị Thanh Thảo', 'Các Chi bộ', 'Phòng họp trực tuyến', 'TTHC'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  // 2. Parse Excel buffer
  const batch = parseWeeklyScheduleExcel(buf);
  console.log('Parsed Batch Metadata:', {
    weekNumber: batch.weekNumber,
    year: batch.year,
    itemCount: batch.items.length,
  });

  console.log('Parsed Items:', JSON.stringify(batch.items, null, 2));

  // 3. Test Database Insertion
  await prisma.weeklySchedule.deleteMany({
    where: { weekNumber: batch.weekNumber, year: batch.year },
  });

  const created = await Promise.all(
    batch.items.map((item) =>
      prisma.weeklySchedule.create({
        data: {
          weekNumber: batch.weekNumber,
          year: batch.year,
          startDate: batch.startDate,
          endDate: batch.endDate,
          dayOfWeek: item.dayOfWeek,
          date: item.date,
          timeSlot: item.timeSlot,
          isAllDay: item.isAllDay,
          eventTitle: item.eventTitle,
          leaderName: item.leaderName || null,
          attendees: item.attendees || null,
          location: item.location || null,
          notes: item.notes || null,
          isPublic: true,
        },
      })
    )
  );

  console.log(`✅ Successfully seeded ${created.length} records into PostgreSQL DB!`);
}

testWeeklySchedule()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
