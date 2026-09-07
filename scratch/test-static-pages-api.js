import http from 'http';

async function testStaticPages() {
  console.log('Testing static pages API...');

  // Login to get token
  const postData = JSON.stringify({ username: 'admin', password: 'admin123' });
  const loginReq = http.request({
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
    res.on('data', c => body += c);
    res.on('end', async () => {
      const token = JSON.parse(body).data?.accessToken;
      console.log('Login token:', token ? token.substring(0, 20) + '...' : 'failed');

      if (token) {
        // 1. Get static pages list
        const pagesRes = await requestJson('http://localhost:4000/api/v1/pages', 'GET', null, token);
        console.log('GET /v1/pages status:', pagesRes.status, 'Total pages:', pagesRes.data?.length);

        if (pagesRes.data?.length > 0) {
          const testPage = pagesRes.data[0];
          console.log('Testing page:', testPage.title, 'Slug:', testPage.slug, 'isHidden:', testPage.isHidden);

          // 2. Toggle visibility
          const toggleRes = await requestJson(`http://localhost:4000/api/v1/pages/${testPage.slug}/toggle-visibility`, 'PATCH', null, token);
          console.log('PATCH toggle-visibility status:', toggleRes.status, 'New isHidden:', toggleRes.data?.isHidden);

          // 3. Toggle back
          const toggleBackRes = await requestJson(`http://localhost:4000/api/v1/pages/${testPage.slug}/toggle-visibility`, 'PATCH', null, token);
          console.log('PATCH toggle-visibility BACK status:', toggleBackRes.status, 'New isHidden:', toggleBackRes.data?.isHidden);
        }
      }
    });
  });

  loginReq.write(postData);
  loginReq.end();
}

function requestJson(url, method, payload, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = payload ? JSON.stringify(payload) : null;
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(postData ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {})
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
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

testStaticPages();
