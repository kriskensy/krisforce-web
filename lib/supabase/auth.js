import { getServerClient } from "./server";

export async function verifyAuth() {
  try {
    const supabase = await getServerClient();
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Auth verification error:', error);
      return null;
    }

    //add data from table 'users'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, roles(code, name)')
      .eq('id', user.id)
      .single();

    if(userError || !userData) {
      console.warn('User found in Auth, but not in public.users table', user.id, userError);

      return user;
    }

    //check if user is activ
    if(!userData.active) {
      console.warn('User is deactivated:', user.id)
      return null
    }

    //add data to basic user
    const extendedUser ={
      ...user,
      ...userData, //add role_id etc
      role_code: userData.roles?.code
    };

    return extendedUser;

  } catch (error) {
    console.error('verifyAuth error:', error);
    return null;
  }
}