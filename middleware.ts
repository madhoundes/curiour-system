import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/dashboard', '/shipments', '/create-shipment', '/analytics', '/billing', '/profile', '/support', '/notifications', '/claims', '/courier'];
const publicRoutes = ['/login', '/courier-login', '/', '/test-camera', '/courier-test', '/verify-email'];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Enhanced cookie checking for LAN network compatibility
  const hasMockAuth = req.cookies.get('mock-auth')?.value === 'true';
  const hasCourierAuth = req.cookies.get('courier_authenticated')?.value === 'true';
  
  // Fallback authentication for LAN networks using URL parameters
  const url = new URL(req.url);
  const hasTempAuth = url.searchParams.get('auth') === 'temp';
  const hasCourierEmail = url.searchParams.get('email');
  const authTime = url.searchParams.get('time');
  
  // Check if temp auth is recent (within 5 minutes)
  const isRecentAuth = authTime && (Date.now() - parseInt(authTime)) < 300000; // 5 minutes
  const hasValidTempAuth = hasTempAuth && hasCourierEmail && isRecentAuth;
  
  // Debug logging for LAN troubleshooting
  console.log('Middleware - Pathname:', pathname);
  console.log('Middleware - Has Mock Auth:', hasMockAuth);
  console.log('Middleware - Has Courier Auth:', hasCourierAuth);
  console.log('Middleware - Has Valid Temp Auth:', hasValidTempAuth);
  console.log('Middleware - All Cookies:', req.cookies.getAll().map(c => `${c.name}=${c.value}`));
  console.log('Middleware - User Agent:', req.headers.get('user-agent'));
  console.log('Middleware - Host:', req.headers.get('host'));
  console.log('Middleware - URL Params:', url.searchParams.toString());
  
  // If someone tries to access protected routes directly, redirect to login
  if (isProtectedRoute && pathname !== '/login' && pathname !== '/courier-login') {
    // For courier routes, check courier authentication
    if (pathname.startsWith('/courier')) {
      // Only redirect if there's NO courier authentication at all
      // Let client-side handle localStorage validation
      if (!hasCourierAuth && !hasValidTempAuth) {
        console.log('No courier authentication found, redirecting to login');
        const response = NextResponse.redirect(new URL('/courier-login', req.url));
        // Set a temporary courier auth cookie for HTTPS testing
        if (req.url.includes('https://')) {
          response.cookies.set('courier_authenticated', 'true', {
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
          });
          console.log('Set temporary courier auth cookie for HTTPS testing');
        }
        return response;
      } else {
        console.log('Courier cookie exists, allowing access - client-side will validate localStorage');
      }
    } else {
      // For other protected routes, check regular authentication
      if (!hasMockAuth) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }
  
  // If someone tries to access login while authenticated, redirect to dashboard
  // BUT only if they have BOTH cookie AND localStorage (to prevent redirect loops)
  if (isPublicRoute && (pathname === '/login' || pathname === '/courier-login')) {
    if (pathname === '/courier-login' && hasCourierAuth) {
      // Don't redirect if localStorage might be empty (let client-side handle it)
      console.log('Courier cookie exists, but letting client-side handle localStorage check');
      // Remove the automatic redirect to prevent loops
      // return NextResponse.redirect(new URL('/courier', req.url));
    } else if (pathname === '/login' && hasMockAuth) {
      console.log('User already authenticated, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
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
