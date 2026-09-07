import http from 'http';

async function testGetDoc() {
  console.log('Testing GET /v1/documents/:id...');
  
  // 1. Fetch all docs first
  http.get('http://localhost:4000/api/v1/documents', (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const docs = JSON.parse(body).data;
      console.log('Total docs found:', docs?.length);
      if (docs?.length > 0) {
        const targetDoc = docs[0];
        console.log('Testing target doc ID:', targetDoc.id, 'Code:', targetDoc.code, 'Title:', targetDoc.title);

        // 2. Fetch specific doc by ID
        http.get(`http://localhost:4000/api/v1/documents/${targetDoc.id}`, (res2) => {
          let body2 = '';
          res2.on('data', c => body2 += c);
          res2.on('end', () => {
            console.log('GET /v1/documents/:id STATUS:', res2.statusCode);
            const detail = JSON.parse(body2).data;
            console.log('Retrieved document:', detail.code, detail.title);
          });
        });
      }
    });
  });
}

testGetDoc();
