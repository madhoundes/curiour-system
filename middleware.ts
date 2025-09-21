import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `export default` or `export { GET, POST }` instead of `export default function`
export function middleware(request: NextRequest) {
  // Add your middleware logic here
  const response = NextResponse.next()
 
  // Example: Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
 
  return response
}
 
// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}