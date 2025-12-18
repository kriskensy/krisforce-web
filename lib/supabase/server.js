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

// export async function verifyAuth() {
//   try {
//     const supabase = await getServerClient();
    
//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.getUser();

//     if (error || !user) {
//       console.error('Auth verification error:', error);
//       return null;
//     }

//     //add data from table 'users'
//     const { data: userData, error: userError } = await supabase
//       .from('users')
//       .select('*, roles(code, name)')
//       .eq('id', id)
//       .single();

//     if(userError || !userData) {
//       console.warn('User found in Auth, but not in public.users table', user.id, userError);

//       return user;
//     }

//     //add data to basic user
//     const extendedUser ={
//       ...user,
//       ...userData, //add role_id etc
//       role_code: userData.roles?.code
//     };

//     console.log('extended user role code: ', extendedUser.role_code);//TODO debug
//     return extendedUser;

//   } catch (error) {
//     console.error('verifyAuth error:', error);
//     return null;
//   }
// }

// export async function getSessionWithUser() {
//   try {
//     const supabase = await getServerClient();
//     const {
//       data: { session },
//       error,
//     } = await supabase.auth.getSession();

//     if (error) {
//       console.error('getSessionWithUser error:', error);
//       return null;
//     }

//     return session;
    
//   } catch (error) {
//     console.error('getSessionWithUser error:', error);
//     return null;
//   }
// }