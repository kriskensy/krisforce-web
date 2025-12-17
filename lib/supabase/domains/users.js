import { getServerClient, verifyAuth } from "../server"
import { createClient as createAdminClient } from '@supabase/supabase-js'

//GET
export async function getUsers(filters = {}) {
  try {
    const {
      search,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc'
    } = filters

    const supabase = await getServerClient()

    let query = supabase
    .from('users')
    .select('id, email, active, created_at, role_id, roles(code, name, active), user_profiles(id, first_name, last_name, phone)', { count: 'exact' })

      //email or name searching
      if(search) {
        query = query.or(
          `email.ilike.%${search}%,user_profiles.first_name.ilike.%${search}%,user_profiles.last_name.ilike.%${search}%`
        )
      }

      //activity filter
      if(active !== undefined) {
        query = query.eq('active', active)
      }

      //sort + pagination
      query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)

        const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message)

        throw new Error(`Database error: ${error.message}`)
      }

      return {
        data: data || [],
        total: count || 0,
        limit,
        offset
      }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

//GET id
export async function getUserById(id) {
  try {
    if(!id) throw new Error('User ID is required')

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, active, created_at, role_id, roles(id, code, name, active), user_profiles(id, first_name, last_name, phone)')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data

  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

//POST (Admin only)
export async function createUser(userData) {
  try {
    const { email, password, role_id, active = true, profile = {} } = userData;

    if(!email) throw new Error('Email is require');
    //TODO how to handle PW creation??
    // if(!password) throw new Error('Password is require')
    // if(password.length < 8) throw new Error('Password must be ay least 8 characters')

    //admin role validation
    const callingUser = await verifyAuth();
    if(!callingUser || callingUser.role_code !== 'admin') {
      throw new Error ('Unauthorized: Admin access required');
    }

    //admin client
    if(!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is not configured');
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    const supabase = await getServerClient()

    //create/sync to supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role_id: role_id || null,
        active: active
      }
    })

    if (authError) {
      if (
        authError.message?.toLowerCase().includes('already registered') ||
        authError.status === 422
      ) {
        throw new Error('Email already registered')
      }
      throw new Error(`Auth error: ${authError.message}`)
    }

    const userId = authData.user.id

    //update user
    if(Object.keys(profile).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone: profile.phone || ''
          }
        ])

      if(profileError) console.warn('Profile creation warning:', profileError.message)
    }

    return await getUserById(userId)

  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

//PUT - email/password cannot be udpated
export async function updateUser(id, updates) {
  try {
    if(!id) throw new Error('User ID is required')

    const { profile, email, password, ...userUpdates } = updates

    //admin role validation
    const callingUser = await verifyAuth();
    if(!callingUser || callingUser.role_code !== 'admin') {
      throw new Error ('Unauthorized: Admin access required');
    }

    //admin client
    if(!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is not configured');
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    const supabase = await getServerClient()

    //user table
    if(Object.keys(userUpdates).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update({ ...userUpdates })
        .eq('id', id)

      if(userError) throw new Error(userError.message)
    }

    //auth API email/password change for admin
    if(email || password) {
      const authUpdates = {}
      if (email) authUpdates.email = email
      if (password) authUpdates.password = password

      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, authUpdates)
      if (authError) throw new Error (`Auth update error: ${authError.message}`)
    }

    //update profile
    if (profile && Object.keys(profile).length > 0) {
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', id)
        .maybeSingle()

      if (selectError && selectError.code !== 'PGRST116') { //PGRST116 means only one record
        console.warn('Profile select warning:', selectError.message);
      }

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ ...profile })
          .eq('user_id', id)

        if(profileError)
          console.warn('Profile update warning:', profileError.message)

      } else {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{ user_id: id, ...profile }])

        if (profileError)
          console.warn('Profile creation warning:', profileError.message)
      }
    }

    return getUserById(id)

  } catch (error) {
    console.error ('Error updating user:', error)
    throw error
  }
}

//DELETE - soft delete / deactivate
export async function deactivateUser(id) {
  try {
    if(!id) throw new Error('User ID is required')

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id)

    if(error) throw new Error(error.message)

    return getUserById(id)

  } catch (error) {
    console.error('Error deactivating user:' , error)
    throw error
  }
}

//PATCH - reactivate
export async function reactivateUser(id) { 
  try {
    if(!id) throw new Error('User ID is required')

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('users')
      .update({ active: true })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return getUserById(id)

  } catch (error) {
    console.error('Error reactivating user:', error.message)
    throw error
  }
}