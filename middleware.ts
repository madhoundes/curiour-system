import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/dashboard', '/shipments', '/create-shipment', '/analytics', '/billing', '/profile', '/support', '/notifications', '/claims', '/courier'];
const publicRoutes = ['/login', '/'];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For now, we'll use a simple approach since we don't have actual authentication
  // In a real app, you would check for valid session tokens here
  
  // If someone tries to access protected routes directly, redirect to login
  if (isProtectedRoute && pathname !== '/login') {
    // Check if there's a mock authentication cookie or if we're in development
    const hasMockAuth = req.cookies.get('mock-auth')?.value === 'true';
    
    if (!hasMockAuth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  // If someone tries to access login while authenticated, redirect to dashboard
  if (isPublicRoute && pathname === '/login') {
    const hasMockAuth = req.cookies.get('mock-auth')?.value === 'true';
    
    if (hasMockAuth) {
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
