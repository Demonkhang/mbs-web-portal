import fs from 'fs';
import path from 'path';

async function testUploadAndRichContent() {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  }).then(r => r.json());
  const token = loginRes.data.accessToken;

  // Create temporary image file
  const testImagePath = path.join(process.cwd(), 'scratch', 'test_sample.jpg');
  const dummyBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
  fs.writeFileSync(testImagePath, dummyBuffer);

  const formData = new FormData();
  const fileBlob = new Blob([dummyBuffer], { type: 'image/jpeg' });
  formData.append('files', fileBlob, 'sample_quan_trac.jpg');

  const uploadRes = await fetch('http://localhost:4000/api/v1/media/upload', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    body: formData
  }).then(r => r.json());

  console.log('Upload response status:', uploadRes.statusCode, '| Count:', uploadRes.data?.length);
  const uploadedItem = uploadRes.data?.[0];
  console.log('Uploaded File URL:', uploadedItem?.url);

  if (uploadedItem?.url) {
    const staticCheck = await fetch(uploadedItem.url);
    console.log('Static asset check status:', staticCheck.status, '(Expected 200)');
  }

  // Clean up temp file
  if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
}

testUploadAndRichContent();
