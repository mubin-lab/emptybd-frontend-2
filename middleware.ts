import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Protect only /profile routes
  if (request.nextUrl.pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Home should be public, so no redirect
  // if (request.nextUrl.pathname === '/') { ... } REMOVE

  return NextResponse.next()
}

export const config = {
  matcher: ['/pr/:path*'] // only /profile protected
  // matcher: ['/profile/:path*'] // only /profile protected
}
