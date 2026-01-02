import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { response, user } = await updateSession(request)
  const path = request.nextUrl.pathname

  const isProtectedRoute = path.startsWith('/protected') || path.startsWith('/api')
  const isAdminRoute = path.startsWith('/protected/admin') || path.startsWith('/api')
  
  //redirect to dashboard if logged in
  if (user && (path === '/auth/login' || path === '/auth/sign-up')) {
    const url = request.nextUrl.clone()
    url.pathname = '/protected/dashboard'
    return NextResponse.redirect(url)
  }

  if (!user && isProtectedRoute) {
    if (path.startsWith('/api/')) {
       return NextResponse.json(
          { error: 'Unauthorized', message: 'Please login first' }, 
          { status: 401 }
       )
    } else {
       const url = request.nextUrl.clone()
       url.pathname = '/auth/login'
       url.searchParams.set('redirectTo', path)
       return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}