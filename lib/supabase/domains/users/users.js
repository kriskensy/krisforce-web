import { verifyAccessLevel } from "@/lib/utils/auth/verifyAccessLevel"
import { getServerClient } from "../../server";
import { verifyAuth } from "../../auth";
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyAdmin } from "@/lib/utils/auth/verifyAdmin";

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

    await verifyAccessLevel(1); //support +

    const supabase = await getServerClient()

    let query = supabase
    .from('users')
    .select('id, email, active, created_at, role_id, roles (name), user_profiles (first_name, last_name), client_id, clients (name)', { count: 'exact' })

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

      //client filter
      if(filters.client_id) {
        query = query.eq('client_id', filters.client_id)
      }

      //sort + pagination
      query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)

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

    await verifyAccessLevel(1); //support +

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, active, created_at, role_id, roles (name), user_profiles(first_name, last_name), client_id, clients (name)')
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
    const { email, password, role_id, active = true, user_profiles = {}, client_id } = userData;

    await verifyAdmin();

    if(!email) throw new Error('Email is required');
    if(!password) throw new Error('Password is required')
    if(password.length < 12) throw new Error('Password must be ay least 12 characters')

    //admin client
    if(!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is not configured');

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    const supabase = await getServerClient()

    //create/sync to supabase auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role_id: role_id || null,
        active: active
      }
    })

    //check if user already registered
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

    //role + client_it update in users table
    if (role_id || client_id) {
      const { error: userError } = await supabase
        .from('users')
        .update({
          role_id: role_id,
          client_id: client_id,
          active: active
        })
        .eq('id', userId)

      if (userError) {
        console.error('User role/client update error:', userError)
        throw new Error(`User role update error: ${userError.message}`)
      }
    }

    //update user
    if(Object.keys(user_profiles).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            first_name: user_profiles.first_name || '',
            last_name: user_profiles.last_name || '',
            phone: user_profiles.phone || ''
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Profile creation error: ${profileError.message}`)
      }
    }

    return await getUserById(userId)

  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

//PUT
export async function updateUser(id, updates) {
  try {
    if(!id) throw new Error('User ID is required')

    const { user_profiles = {}, email, password, ...userUpdates } = updates
    const supabase = await getServerClient()

    //admin client
    if(!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is not configured');

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    //user table
    const userUpdatePayload = { ...userUpdates }
    if(email) userUpdatePayload.email = email;
    if(Object.keys(userUpdatePayload).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update( userUpdatePayload )
        .eq('id', id)

      if(userError) throw new Error(userError.message)
    }

    //auth API email/password change for admin only!
    if(email || password) {

      const authUpdates = {}
      if (email) authUpdates.email = email
      if (password) authUpdates.password = password

      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, authUpdates)
      if (authError) throw new Error (`Auth update error: ${authError.message}`)
    }

    //update profile
    if (user_profiles  && Object.keys(user_profiles ).length > 0) {
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', id)
        .maybeSingle()

      if (selectError && selectError.code !== 'PGRST116') { //PGRST116 = no rows found
        console.warn('Profile select warning:', selectError.message);
      }

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            first_name: user_profiles.first_name ?? existingProfile.first_name,
            last_name: user_profiles.last_name ?? existingProfile.last_name,
            phone: user_profiles.phone ?? existingProfile.phone
          })
          .eq('user_id', id)

        if(profileError)
          console.warn('Profile update warning:', profileError.message)

      } else {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: id,
              first_name: user_profiles.first_name || '',
              last_name: user_profiles.last_name || '',
              phone: user_profiles.phone || ''
            }
          ])

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

    await verifyAdmin();

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
    
    await verifyAdmin();

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