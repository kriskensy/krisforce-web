import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            console.error('Error setting server cookie:', error);
          }
        },
      },
    },
  );
}

export async function verifyAuth() {
  try {
    const supabase = await getServerClient();
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth verification error:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('verifyAuth error:', error);
    return null;
  }
}

export async function getSessionWithUser() {
  try {
    const supabase = await getServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('getSessionWithUser error:', error);
      return null;
    }

    return session;
    
  } catch (error) {
    console.error('getSessionWithUser error:', error);
    return null;
  }
}