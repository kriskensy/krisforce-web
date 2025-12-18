import { verifyAuth as getCallingUser } from '@/lib/supabase/auth.js'

export async function verifyAdmin() {
  const callingUser = await getCallingUser()
  if (!callingUser || callingUser.role_code !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return callingUser
}
