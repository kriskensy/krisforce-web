import { verifyAuth as getCallingUser } from '@/lib/supabase/auth.js'

export async function verifyAuthenticated() {
  const callingUser = await getCallingUser()
  if (!callingUser) {
    throw new Error('Unauthorized: Authentication required')
  }
  return callingUser
}
