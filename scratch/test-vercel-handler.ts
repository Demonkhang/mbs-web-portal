import handler from '../api/index.js';
import { EventEmitter } from 'events';

class MockResponse extends EventEmitter {
  statusCode = 200;
  headers = {};
  body = '';

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
    return this;
  }
  header(name, value) {
    return this.setHeader(name, value);
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(data) {
    this.body = JSON.stringify(data);
    console.log(`[MockResponse] Status ${this.statusCode}:`, this.body);
    return this;
  }
  send(data) {
    this.body = data;
    console.log(`[MockResponse] Status ${this.statusCode}:`, this.body);
    return this;
  }
  sendStatus(code) {
    this.statusCode = code;
    console.log(`[MockResponse] SendStatus ${code}`);
    return this;
  }
}

async function testVercelInvocation() {
  process.env.VERCEL = "1";
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_K2bMsD7FSoxi@ep-summer-hall-b5y5cuvf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

  console.log("🚀 Testing Vercel handler invocation with /api/health...");
  const req = {
    method: 'GET',
    url: '/api/health',
    headers: {
      'x-matched-path': '/api/health',
    },
  };
  const res = new MockResponse();

  try {
    const result = await handler(req, res);
    console.log("Handler finished. Result:", typeof result);
  } catch (err) {
    console.error("❌ Handler crashed:", err);
  }
}

testVercelInvocation();
