/**
 * Client-side / Edge Route Protection Middleware Stub
 */
export function middleware(requestPath: string): { isAllowed: boolean; redirectUrl?: string } {
  if (requestPath.startsWith('/admin')) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mbs_access_token') : null;
    if (!token) {
      return { isAllowed: false, redirectUrl: '/login' };
    }
  }
  return { isAllowed: true };
}
