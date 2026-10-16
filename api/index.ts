import app from '../apps/api/src/main';

/**
 * Vercel Serverless Function entry point for Express API
 */
export default function handler(req: any, res: any) {
  // Normalize req.url if rewritten by Vercel router
  const matchedPath = req.headers['x-matched-path'] as string | undefined;
  if (matchedPath && !req.url.startsWith('/api')) {
    req.url = matchedPath;
  }

  return app(req, res);
}
