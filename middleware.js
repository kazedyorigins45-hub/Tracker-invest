import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/mindset', '/tracker', '/invest', '/portfolio'];
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) return NextResponse.next();

  const cookies = request.cookies.getAll();
  const hasSession = cookies.some((cookie) => cookie.name.startsWith('sb-'));

  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/dashboard/:path*', '/mindset/:path*', '/tracker/:path*', '/invest/:path*', '/portfolio/:path*'],
};
