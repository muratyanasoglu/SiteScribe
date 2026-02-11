import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { isAuthRateLimited } from '@/lib/rate-limit';

const authMiddleware = withAuth({
  pages: { signIn: '/login' },
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    if (isAuthRateLimited(req.headers)) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin.' }, { status: 429 });
    }
    return NextResponse.next();
  }
  return authMiddleware(req as NextRequestWithAuth, event);
}

export const config = {
  matcher: ['/org/:path*', '/projects/:path*', '/notifications', '/chat', '/friends', '/api/auth/:path*'],
};
