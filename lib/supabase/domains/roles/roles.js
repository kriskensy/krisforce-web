import { getServerClient } from '../server'
import { verifyAccessLevel } from '../../utils/auth/verifyAccessLevel'
//TODO uncomment access verify

//helper - check if role is admin role
async function isAdminRole(supabase, id) {
  const { data: role } = await supabase
    .from('roles')
    .select('code')
    .eq('id', id)
    .single()
  
  return role && role.code === 'admin'
}

export async function getRoles(filters) {
  try {
    const {
      search,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'code',
      orderDir = 'asc'
    } = filters

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('roles')
      .select('id, code, name, active', { count: 'exact' })

    //search name, code
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
    }

    //sort + pagination
    query = query
      .order(orderBy, { ascending: orderDir === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      data,
      total: count || 0,
      limit,
      offset
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    throw error
  }
}

export async function getRoleById(id) {
  try {
    if (!id) throw new Error('Role ID is required')

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    const { data, error } = await supabase
      .from('roles')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Role not found')

    return data
  } catch (error) {
    console.error('Error fetching role:', error)
    throw error
  }
}

// POST create
export async function createRole(roleData) {
  try {
    // await verifyAccessLevel(3)//admin
    const { code, name } = roleData

    if (!code || code.trim() === '') throw new Error('Role code is required')
    if (!name || name.trim() === '') throw new Error('Role name is required')

    const supabase = await getServerClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    // Check if code unique
    const { data: existingCode } = await supabase
      .from('roles')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Role code already exists')

    const { data: newRole, error: insertError } = await supabase
      .from('roles')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Role creation error: ${insertError.message}`)

    return await getRoleById(newRole.id)
  } catch (error) {
    console.error('Error creating role:', error)
    throw error
  }
}

// PUT update
export async function updateRole(id, roleData) {
  try {
    if (!id) throw new Error('Role ID is required')

    // await verifyAccessLevel(3)//admin

    const { code, name, active } = addressTypeData
    const supabase = await getServerClient()

    const { data: existing } = await supabase
      .from('roles')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existing) throw new Error('Role not found')

    //check if admin role
    const isAdmin = await isAdminRole(supabase, id)
    if(isAdmin)
      throw new Error ('Cannot modify the admin role')

    //check is code unique?
    const code = roleData.code
    if (code && code.trim().toLowerCase() !== existing.code) {
      const { data: codeExists } = await supabase
        .from('roles')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Role code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('roles')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Role update error: ${updateError.message}`)

    return await getRoleById(id)
  } catch (error) {
    console.error('Error updating role:', error)
    throw error
  }
}

export async function deleteRole(id) {
  try {
    if (!id) throw new Error('Role ID is required')

    // await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if admin role
    const isAdmin = await isAdminRole(supabase, id)
    if(isAdmin)
      throw new Error ('Cannot modify the admin role')

    //check if role is used by any users
    const { data: usersWithRole } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', id)

    if (usersWithRole && usersWithRole.length > 0)
      throw new Error('Cannot delete role that is assigned to users')

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Role deletion error: ${error.message}`)

    return { success: true, message: 'Role deleted successfully' }
  } catch (error) {
    console.error('Error deleting role:', error)
    throw error
  }
}

//PATCH soft delete
export async function deactivateRole(id) {
  try {
    if (!id) throw new Error('Role ID is required')

    // await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if admin role
    const isAdmin = await isAdminRole(supabase, id)
    if(isAdmin)
      throw new Error ('Cannot modify the admin role')

    const { error } = await supabase
      .from('roles')
      .update({ active: false })
      .eq('id', id)

    if (error) throw new Error(`Role deactivation error: ${error.message}`)

    return await getRoleById(id)
  } catch (error) {
    console.error('Error deactivating role:', error)
    throw error
  }
}

//PATCH reactivate
export async function reactivateRole(id) {
  try {
    if (!id) throw new Error('Role ID is required')

    // await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('roles')
      .update({ active: true })
      .eq('id', id)

    if (error) throw new Error(`Role reactivation error: ${error.message}`)

    return await getRoleById(id)
  } catch (error) {
    console.error('Error reactivating role:', error)
    throw error
  }
}
