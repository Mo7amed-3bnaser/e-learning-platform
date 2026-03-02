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
 * Decode the JWT payload WITHOUT verification.
 * This runs in Edge middleware for routing decisions only.
 * Actual authorization is enforced by the backend’s protect middleware.
 */
function decodeJwtPayload(token: string): { role?: string; id?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // JWT uses base64url encoding — convert to standard base64 for atob
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Read auth info from the HttpOnly access_token cookie (set by server).
 * The role is extracted by decoding the JWT payload.
 * This replaces the old spoofable auth-role cookie.
 */
function getAuthFromRequest(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const token = tokenCookie?.value || null;

  let role: string | null = null;
  if (token) {
    const payload = decodeJwtPayload(token);
    role = payload?.role || null;
  }

  return {
    token,
    role,
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

  // ── Protected routes ──
  // Auth check is handled CLIENT-SIDE by the <ProtectedRoute> wrapper.
  // The middleware no longer redirects here because the HttpOnly cookie
  // lives on the API domain and is invisible to Edge middleware.
  // This prevents false redirects to /login for authenticated users.

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
