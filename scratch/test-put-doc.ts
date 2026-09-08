import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { prisma } from '@mbs/database';

async function testPut() {
  const id = 'c53de544-ec78-4fdd-87bf-2b9a359aa3f4';
  const doc = await prisma.legalDocument.findUnique({ where: { id } });
  console.log('Found doc:', doc);
  if (!doc) return;

  const updateFields: any = {
    code: doc.code,
    title: doc.title,
    docType: doc.docType,
    issuingAgency: doc.issuingAgency,
    signer: doc.signer,
    issueDate: new Date('2026-09-08'),
    effectiveDate: new Date('2026-09-08'),
    status: 'Còn hiệu lực',
    approvalStatus: 'PUBLISHED',
    domain: doc.domain || 'Môi trường',
    fileSize: doc.fileSize || '2.5 MB',
    fileUrl: doc.fileUrl || '/uploads/documents/van-ban-mbs-2026.pdf',
    p7sSignatureUrl: null,
    htmlContent: '<p>test</p>',
    isConfidentialChecked: true,
    fullText: doc.title,
  };

  try {
    const updated = await prisma.legalDocument.update({
      where: { id },
      data: updateFields,
    });
    console.log('Update Success:', updated);
  } catch (err) {
    console.error('PRISMA UPDATE ERROR:', err);
  }
}

testPut().finally(async () => {
  await prisma.$disconnect();
});
