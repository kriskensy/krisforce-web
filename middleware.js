import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

const PUBLIC_API_ROUTES = [
  '/auth/login',
  '/auth/sign-up',
  '/auth/update-password',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/confirm',
  '/auth/error',
  '/' 
]

function isPublicRoute(pathname) {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))
}

export async function middleware(request) {
  try{
    const response = await updateSession(request)

    if(request.nextUrl.pathname.startsWith('/auth')){
      if(!isPublicRoute(request.nextUrl.pathname)) {

        const authToken = request.cookies.get('sb-auth-token')?.value

        if(!authToken) {
          return NextResponse.json(
            {
              error: 'Unauthorized',
              message: 'Auth token missing. Please login first',
              code: 'AUTH_TOKEN_MISSING'
            },
            { status: 401 }
          )
        }
      }
    }

    if(!isPublicRoute(request.nextUrl.pathname)) {

      const authToken = request.cookies.get('sb-auth-token')?.value

      if(!authToken && request.nextUrl.pathname.startsWith('/')) {

        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)

        return NextResponse.redirect(loginUrl)
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error: ', error)

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)',
  ],
}