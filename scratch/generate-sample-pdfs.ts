import fs from 'fs';
import path from 'path';

// Valid PDF-1.4 generator with calculated xref byte offsets
function createValidPdfContent(title: string, code: string, agency: string): Buffer {
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';

  const streamText = `BT\n/F1 18 Tf\n50 720 Td\n(${agency}) Tj\n0 -30 Td\n(SO: ${code}) Tj\n0 -40 Td\n(${title}) Tj\n0 -30 Td\n(VAN BAN QUY PHAM PHAP LUAT DANH CHO PORTAL MBS) Tj\nET\n`;
  const streamLen = Buffer.byteLength(streamText, 'utf-8');
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamText}endstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const objects = [obj1, obj2, obj3, obj4, obj5];
  
  let currentOffset = Buffer.byteLength(header, 'utf-8');
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += Buffer.byteLength(obj, 'utf-8');
  }

  const startXref = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  const fullPdf = header + objects.join('') + xref;
  return Buffer.from(fullPdf, 'utf-8');
}

const docsDir = path.join(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const samplePdfs = [
  { filename: 'van-ban-mbs-2026.pdf', title: 'VAN BAN PHAP QUY MBS 2026', code: '467/TB-VP', agency: 'VAN PHONG MBS' },
  { filename: '05-2024-QD-UBND.pdf', title: 'QUYET DINH QUAN LY CHAT THAI RAN', code: '05/2024/QD-UBND', agency: 'UBND TP.HCM' },
  { filename: '12-2025-TT-BTNMT.pdf', title: 'THONG TU HUONG DAN KY THUAT MOI TRUONG', code: '12/2025/TT-BTNMT', agency: 'BO TN&MT' },
  { filename: '467-TB-VP.pdf', title: 'THONG BAO UY QUYEN DIEU HANH VAN PHONG', code: '467/TB-VP', agency: 'MBS' },
];

for (const pdf of samplePdfs) {
  const filePath = path.join(docsDir, pdf.filename);
  fs.writeFileSync(filePath, createValidPdfContent(pdf.title, pdf.code, pdf.agency));
  console.log(`Generated valid PDF at: ${filePath}`);
}

console.log('✅ Sample PDF files generated successfully in uploads/documents/');
