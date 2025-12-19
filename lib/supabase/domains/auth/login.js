import { getBrowserClient } from '@/lib/supabase/client'

export async function loginUser(email, password) {
  const supabase = getBrowserClient()

  //auth login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) throw signInError

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  //check if user is active
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('active')
    .eq('id', user.id)
    .single()

  if (userError) {
    throw new Error('Could not verify user status')
  }

  if (!userData.active) {
    await supabase.auth.signOut()
    throw new Error('Your account has been deactivated. Please contact support.')
  }

  return user
}
