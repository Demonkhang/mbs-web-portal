import express from 'express';
import { utilitiesRouter } from '../apps/api/src/modules/utilities/utilities.router';
import * as XLSX from 'xlsx';

async function testEndpoint() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/schedules', utilitiesRouter);
  app.use('/api/v1/utilities', utilitiesRouter);

  // Test creating dummy excel
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['LỊCH TUẦN - BAN QUẢN LÝ CÁC KHU LIÊN HỢP XỬ LÝ CHẤT THẢI THÀNH PHỐ (MBS)'],
    ['(31/08/2026-06/09/2026)'],
    ['Thời gian', '', 'Nội dung', 'Chủ trì', 'Thành phần', 'Địa điểm', 'Ghi chú'],
    ['Thứ 2, 31/08/2026'],
    ['Cả ngày', '07:30 - 17:00', 'NGHỈ LỄ 2/9 (Theo TB số 1841/TB-BQLKLH-VP)', '', '', '-', ''],
    ['Thứ 6, 04/09/2026'],
    ['Sáng', '08:30 - 11:30', 'Họp về phần mềm quản lý công việc hiệu quả', 'PGĐ Sở Nguyễn Hồng Nguyên', 'BGĐ; Cán bộ chủ chốt', 'Hội trường Sở (KV1)', 'Các Phòng chuẩn bị'],
    ['', '09:00 - 10:00', 'Họp trao đổi nội dung về rà soát, phân bổ nhân sự', 'Hoàng Văn Dương - CVP', 'P.GSKL; P.GSKLH', 'Phòng Tiếp công dân', 'P.GSKL chuẩn bị'],
    ['Chiều', '14:00 - 16:00', 'Họp nghiệm thu phần mềm cân tự động', 'PGĐ Sở Nguyễn Hồng Nguyên', 'PGĐ Nguyễn Trí Bửu...', 'Hội trường Sở (KV1)', 'VP chuẩn bị'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const server = app.listen(0, async () => {
    const address = server.address() as any;
    const port = address.port;
    console.log(`Test Express server running on port ${port}`);

    try {
      const formData = new FormData();
      formData.append('file', new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'test.xlsx');

      const res = await fetch(`http://localhost:${port}/api/v1/schedules/import`, {
        method: 'POST',
        body: formData,
      });

      console.log('HTTP Status:', res.status);
      const json = await res.json();
      console.log('Response Message:', json.message);
      console.log('Parsed Items Count:', json.data?.items?.length);
      console.log('Items parsed:', JSON.stringify(json.data?.items, null, 2));

      if (res.status === 200 && json.data?.items?.length === 4) {
        console.log('✅ EXCEL IMPORT ENDPOINT TEST PASSED PERFECTLY!');
      } else {
        console.error('❌ EXCEL IMPORT TEST UNEXPECTED RESULT');
      }
    } catch (err) {
      console.error('Error during test fetch:', err);
    } finally {
      server.close();
    }
  });
}

testEndpoint();
