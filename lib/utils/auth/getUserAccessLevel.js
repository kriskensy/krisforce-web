import { verifyAuth as getCallingUser } from '@/lib/supabase/auth.js'

export async function getUserAccessLevel() {
  const callingUser = await getCallingUser()
  if (!callingUser) {
    throw new Error('Unauthorized: Authentication required')
  }

  const accessLevels = {
    'user': 0,
    'support': 1,
    'manager': 2,
    'admin': 3
  }

  return {
    level: accessLevels[callingUser.role_code] || 0,
    role: callingUser.role_code,
    userId: callingUser.id,
    clientId: callingUser.client_id,
    email: callingUser.email
  }
}
