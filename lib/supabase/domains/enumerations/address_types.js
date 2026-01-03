import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getAddressTypes(filters) {
  try {
    const {
      search,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'code',
      orderDir = 'asc'
    } = filters

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('address_types')
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
    console.error('Error fetching address types:', error)
    throw error
  }
}

export async function getAddressTypeById(id) {
  try {
    if (!id) throw new Error('Address type ID is required')

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('address_types')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') 
      throw new Error(error.message)

    if (!data) throw new Error('Address type not found')

    return data
  } catch (error) {
    console.error('Error fetching address type:', error)
    throw error
  }
}

export async function createAddressType(addressTypeData) {
  try {
    await verifyAccessLevel(3)//admin
    const { code, name } = addressTypeData

    if (!code || code.trim() === '') throw new Error('Address type code is required')
    if (!name || name.trim() === '') throw new Error('Address type name is required')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingCode } = await supabase
      .from('address_types')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Address type code already exists')

    const { data: newType, error: insertError } = await supabase
      .from('address_types')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Address type creation error: ${insertError.message}`)

    return await getAddressTypeById(newType.id)
  } catch (error) {
    console.error('Error creating address type:', error)
    throw error
  }
}

export async function updateAddressType(id, addressTypeData) {
  try {
    if (!id) throw new Error('Address type ID is required')

    await verifyAccessLevel(3)//admin

    const { code, name, active } = addressTypeData
    const supabase = await getServerClient()

    const { data: existingAddressType } = await supabase
      .from('address_types')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existingAddressType) throw new Error('Address type not found')

    //check is code unique?
    if (code && code.trim().toLowerCase() !== existingAddressType.code) {
      const { data: codeExists } = await supabase
        .from('address_types')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Address type code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('address_types')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Address type update error: ${updateError.message}`)

    return await getAddressTypeById(id)
  } catch (error) {
    console.error('Error updating address type:', error)
    throw error
  }
}

export async function deleteAddressType(id) {
  try {
    if (!id) throw new Error('Address type ID is required')

    await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if address type in use
    const { count: addressTypeUsageCount, error: usageError } = await supabase
      .from('client_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('address_type_id', id)

    if (usageError)
      throw new Error(`Usage check error: ${usageError.message}`)
    
    if (addressTypeUsageCount > 0)
      throw new Error(`Cannot delete address type used in ${addressTypeUsageCount} client addresses`)

    const { error } = await supabase
      .from('address_types')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Address type deletion error: ${error.message}`)

    return { success: true, message: 'Address type deleted successfully' }
  } catch (error) {
    console.error('Error deleting address type:', error)
    throw error
  }
}
