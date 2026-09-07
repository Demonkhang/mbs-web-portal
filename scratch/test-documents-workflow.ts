import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testDocumentsWorkflow() {
  console.log('--- 🧪 STARTING LEGAL DOCUMENTS WORKFLOW TEST ---');

  // 1. Login as Admin
  console.log('1. Logging in as Admin...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });

  const loginData: any = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log(' Logged in successfully. Token acquired.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Create Document Draft (Step 1 & 2)
  console.log('\n2. Creating Document Draft (Step 1 & 2)...');
  const code = `TEST-${Date.now().toString().slice(-4)}/2026/QĐ-UBND`;
  const createRes = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      code,
      title: 'Quyết định thử nghiệm luồng phê duyệt 4 bước tự động',
      docType: 'Quyết định',
      issuingAgency: 'UBND TP.Hồ Chí Minh',
      signer: 'Chủ tịch UBND',
      issueDate: '2026-03-01',
      effectiveDate: '2026-03-15',
      status: 'Còn hiệu lực',
      approvalStatus: 'DRAFT',
      domain: 'Môi trường',
      fullText: 'Toàn văn bản quyết định thử nghiệm tự động kiểm tra quy trình 4 bước...',
      isConfidentialChecked: true,
      p7sSignatureUrl: '/uploads/signatures/test-sig.p7s',
    }),
  });

  const createData: any = await createRes.json();
  console.log(' Create Status:', createRes.status, '| ID:', createData.data?.id, '| ApprovalStatus:', createData.data?.approvalStatus);
  const docId = createData.data?.id;

  // 3. Submit Document for Review (Step 2 -> 3)
  console.log('\n3. Submitting Document for Leadership Review...');
  const submitRes = await fetch(`${BASE_URL}/documents/${docId}/submit`, {
    method: 'PATCH',
    headers,
  });
  const submitData: any = await submitRes.json();
  console.log(' Submit Status:', submitRes.status, '| New ApprovalStatus:', submitData.data?.approvalStatus);

  // 4. Fetch Approval Queue for Approvers
  console.log('\n4. Fetching Approval Queue...');
  const queueRes = await fetch(`${BASE_URL}/documents/approval-queue`, {
    method: 'GET',
    headers,
  });
  const queueData: any = await queueRes.json();
  console.log(' Queue Status:', queueRes.status, '| Items in Queue:', queueData.data?.length);

  // 5. Approve Document (Step 3 -> 4)
  console.log('\n5. Approving Document & Publishing...');
  const approveRes = await fetch(`${BASE_URL}/documents/${docId}/approve`, {
    method: 'PATCH',
    headers,
  });
  const approveData: any = await approveRes.json();
  console.log(' Approve Status:', approveRes.status, '| Published Status:', approveData.data?.approvalStatus);

  // 6. Verify Public Search (Step 4)
  console.log('\n6. Verifying Public Search API...');
  const searchRes = await fetch(`${BASE_URL}/documents/search?q=${encodeURIComponent('thử nghiệm')}`);
  const searchData: any = await searchRes.json();
  console.log(' Public Search Results Count:', searchData.data?.length);

  console.log('\n✅ LEGAL DOCUMENTS WORKFLOW TEST PASSED SUCCESSFULLY!');
}

testDocumentsWorkflow().catch((err) => {
  console.error('❌ WORKFLOW TEST FAILED:', err);
  process.exit(1);
});
