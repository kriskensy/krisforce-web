import { headers } from '@/node_modules/next/headers'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


//update session
export async function updateSession(request) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          //get all cookies
          getAll() {
            return cookieStore.getAll()
          },
          //set cookies
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
        },
      }
    )

    //refresh session
    const { data, error } = await supabase.auth.getSession()

    if(error) {
      console.warn('Session refresh warning:', error.message)
    }

    return response
  } catch (error) {
    console.error('updateSession error:', error)

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

//create supabase client for server-side use
export async function getServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        //get all cookies
        getAll() {
          return cookieStore.getAll()
        },
        //set cookies
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
      },
    }
  )
}

//verify user is authenticated
export async function verifyAuth() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if(error) {
      console.error('Auth verification error:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('verifyAuth error:', error)
    return null
  }
}

//get current session
export async function getSessionWithUser() {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if(error) {
      console.error('getSessionWithUser error:', error)
      return null
    }

    return session
    
  }catch (error) {
    console.error('getSessionWithUser error:', error)
    return null
  }
}