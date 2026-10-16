import http from 'http';
import handler from '../api/index.js';

process.env.VERCEL = "1";
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_K2bMsD7FSoxi@ep-summer-hall-b5y5cuvf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

const server = http.createServer((req, res) => {
  handler(req, res);
});

server.listen(4005, () => {
  console.log("Server listening on 4005. Testing GET /api/health...");
  http.get('http://localhost:4005/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[Status ${res.statusCode}] Response:`, data);
      server.close();
      process.exit(0);
    });
  });
});
