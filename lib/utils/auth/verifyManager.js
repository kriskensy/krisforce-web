import { verifyAuth as getCallingUser } from '@/lib/supabase/auth.js'

export async function verifyManager() {
  const callingUser = await getCallingUser()
  if (!callingUser || callingUser.role_code !== 'manager') {
    throw new Error('Unauthorized: Manager access required')
  }
  return callingUser
}
