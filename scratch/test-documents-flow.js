import http from 'http';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testFlow() {
  console.log('Testing document flow...');
  try {
    const resAll = await getJson('http://localhost:4000/api/v1/documents');
    console.log('GET /v1/documents status:', resAll.status, 'Total docs:', resAll.data.data?.length);

    if (resAll.data.data?.length > 0) {
      const doc = resAll.data.data[0];
      console.log('Testing doc:', doc.id, doc.code);

      const resHist = await getJson(`http://localhost:4000/api/v1/documents/${doc.id}/history`);
      console.log('GET /v1/documents/:id/history status:', resHist.status, 'Total logs:', resHist.data.data?.length);
      if (resHist.data.data?.length > 0) {
        console.log('Sample log action:', resHist.data.data[0].action);
        console.log('Sample log user:', resHist.data.data[0].user?.name);
      }
    }
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

testFlow();
