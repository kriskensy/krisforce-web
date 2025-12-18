import { verifyAuth as getCallingUser } from '@/lib/supabase/auth.js'

export async function verifySupport() {
  const callingUser = await getCallingUser()
  if (!callingUser || callingUser.role_code !== 'support') {
    throw new Error('Unauthorized: Support access required')
  }
  return callingUser
}
