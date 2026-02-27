import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Routes that require authentication ───
const PROTECTED_ROUTES = [
  '/dashboard',
  '/my-courses',
  '/profile',
  '/orders',
  '/wishlist',
  '/watch',
];

// ─── Routes that require admin role ───
const ADMIN_ROUTES = ['/admin'];

// ─── Routes that require instructor role ───
const INSTRUCTOR_ROUTES = ['/dashboard/instructor'];

// ─── Auth pages (redirect to dashboard if already logged in) ───
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

/**
 * Reads the persisted Zustand auth-storage cookie/token.
 * The auth store persists to localStorage, but we also look for
 * the token in cookies set by the app (auth-token).
 */
function getAuthFromRequest(request: NextRequest) {
  // Read from cookie set by the app
  const tokenCookie = request.cookies.get('auth-token');
  const roleCookie = request.cookies.get('auth-role');

  return {
    token: tokenCookie?.value || null,
    role: roleCookie?.value || null,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { token, role } = getAuthFromRequest(request);
  const isAuthenticated = !!token;

  // ── Admin routes: require admin role ──
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // ── Instructor routes: require instructor or admin role ──
  if (INSTRUCTOR_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes: require authentication ──
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Auth routes: redirect to dashboard if already logged in ──
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, public files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public|api).*)',
  ],
};
