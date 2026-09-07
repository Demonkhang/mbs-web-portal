import fs from 'fs';
import path from 'path';

// Minimal valid PDF-1.4 content generator
function createDummyPdfContent(title: string, code: string, agency: string): Buffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kinds [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 18 Tf
50 720 Td
(${agency}) Tj
0 -30 Td
(SO: ${code}) Tj
0 -40 Td
(${title}) Tj
0 -30 Td
(VAN BAN QUY PHAM PHAP LUAT DANH CHO PORTAL MBS) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000494 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
563
%%EOF`;
  return Buffer.from(content, 'utf-8');
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
  fs.writeFileSync(filePath, createDummyPdfContent(pdf.title, pdf.code, pdf.agency));
  console.log(`Generated sample PDF at: ${filePath}`);
}

console.log('✅ Sample PDF files generated successfully in uploads/documents/');
