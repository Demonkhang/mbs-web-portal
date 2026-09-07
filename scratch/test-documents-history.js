import http from 'http';

async function testWithLogin() {
  console.log('Testing with login token...');
  const postData = JSON.stringify({ username: 'admin', password: 'admin123' });

  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', async () => {
      console.log('Login response status:', res.statusCode);
      const data = JSON.parse(body);
      const token = data.data?.accessToken || data.data?.token || data.accessToken || data.token;
      console.log('Token received:', token ? token.substring(0, 35) + '...' : 'none');

      if (token) {
        // Fetch docs
        const resDocs = await fetchJson('http://localhost:4000/api/v1/documents', token);
        console.log('Docs count:', resDocs.data?.length);

        if (resDocs.data?.length > 0) {
          const docId = resDocs.data[0].id;
          const resHist = await fetchJson(`http://localhost:4000/api/v1/documents/${docId}/history`, token);
          console.log('History status:', resHist.status, 'History logs count:', resHist.data?.length);
          if (resHist.data?.length > 0) {
            console.log('Log entry 0:', resHist.data[0].action, 'By:', resHist.data[0].user?.fullName || resHist.data[0].user?.username);
          }
        }
      }
    });
  });

  req.write(postData);
  req.end();
}

function fetchJson(url, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    http.get({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json.data || json });
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

testWithLogin();
