import app from './main';

/**
 * Production Vercel Serverless Function entry point for Express API
 */
export default function handler(req: any, res: any) {
  // Normalize req.url when rewritten by Vercel edge router
  const matchedPath = req.headers['x-matched-path'] as string | undefined;
  if (matchedPath) {
    const queryIndex = req.url.indexOf('?');
    if (queryIndex !== -1 && !matchedPath.includes('?')) {
      req.url = matchedPath + req.url.substring(queryIndex);
    } else {
      req.url = matchedPath;
    }
  }

  return app(req, res);
}
