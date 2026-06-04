import { NextRequest, NextResponse } from 'next/server';

// Protected routes are any prefix that requires authentication. The
// middleware doesn't try to encode role-based access here – it just
// gates on "are you logged in". Role checks happen client-side in each
// section (e.g. /admin pages do their own role guard) so we only need
// one cookie scheme.
const protectedRoutes = [
  '/dashboard',
  '/shipments',
  '/create-shipment',
  '/analytics',
  '/billing',
  '/profile',
  '/support',
  '/notifications',
  '/claims',
  '/courier',
  '/admin',
];

// Public routes that should never bounce, even if the user is logged
// out. `/admin-login` and `/courier-login` are intentionally absent –
// those now 307-redirect to `/login` at the route level, so the
// middleware doesn't need to special-case them.
const publicRoutes = [
  '/',
  '/login',
  '/test-camera',
  '/courier-test',
  '/verify-email',
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = new URL(req.url);

  // We accept either the unified `mock-auth` cookie or the legacy
  // `courier_authenticated` cookie. The legacy cookie is still written
  // for couriers (so existing courier-app code that reads it keeps
  // working) but new logins also set `mock-auth`, so either is enough
  // to satisfy the gate.
  const hasMockAuth = req.cookies.get('mock-auth')?.value === 'true';
  const hasCourierAuth = req.cookies.get('courier_authenticated')?.value === 'true';
  const isAuthenticated = hasMockAuth || hasCourierAuth;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  // Gate protected routes. If unauthenticated, bounce to `/login` and
  // preserve the originally-requested path so the user lands back where
  // they tried to go after signing in.
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/login') {
      loginUrl.searchParams.set('redirect', pathname + url.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If an already-authenticated user lands on `/login`, send them on to
  // a sensible default. We *don't* know their role from cookies alone,
  // so we pick the merchant dashboard – role-aware routing happens on
  // login submit, not here.
  //
  // Important exception: if Shopify OAuth params are in the URL we let
  // the page render so the client can pick up `?shop=…` and kick off
  // the OAuth handoff.
  if (isPublicRoute && pathname === '/login' && isAuthenticated) {
    const hasShopifyParams = !!(
      url.searchParams.get('shop') ||
      url.searchParams.get('hmac') ||
      url.searchParams.get('host') ||
      url.searchParams.get('timestamp')
    );
    if (!hasShopifyParams) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Always disable caching on the login page so Shopify OAuth query
  // params are visible to the client on every render.
  if (pathname === '/login') {
    const next = NextResponse.next();
    next.headers.set('Cache-Control', 'no-store, max-age=0');
    return next;
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
