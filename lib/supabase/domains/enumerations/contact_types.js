import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'

export async function getContactTypes(filters) {
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
      .from('contact_types')
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

export async function getContactTypeById(id) {
  try {
    if (!id) throw new Error('Contact type ID is required')

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('contact_types')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Contact type not found')

    return data
  } catch (error) {
    console.error('Error fetching contact type:', error)
    throw error
  }
}

export async function createContactType(contactTypeData) {
  try {
    await verifyAccessLevel(3)//admin
    const { code, name } = contactTypeData

    if (!code || code.trim() === '') throw new Error('Contact type code is required')
    if (!name || name.trim() === '') throw new Error('Contact type name is required')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingCode } = await supabase
      .from('contact_types')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Contact type code already exists')

    const { data: newContactType, error: insertError } = await supabase
      .from('contact_types')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Contact type creation error: ${insertError.message}`)

    return await getContactTypeById(newContactType.id)
  } catch (error) {
    console.error('Error creating contact type:', error)
    throw error
  }
}

export async function updateContactType(id, contactTypeData) {
  try {
    if (!id) throw new Error('Contact type ID is required')

    await verifyAccessLevel(3)//admin

    const { code, name, active } = contactTypeData
    const supabase = await getServerClient()

    const { data: existingContactType } = await supabase
      .from('contact_types')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existingContactType) throw new Error('Contact type not found')

    //check is code unique?
    if (code && code.trim().toLowerCase() !== existingContactType.code) {
      const { data: codeExists } = await supabase
        .from('contact_types')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Contact type code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('contact_types')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Contact type update error: ${updateError.message}`)

    return await getContactTypeById(id)
  } catch (error) {
    console.error('Error updating contact type:', error)
    throw error
  }
}

//DELETE
export async function deleteContactType(id) {
  try {
    if (!id) throw new Error('Contact type ID is required')

    await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if contact type in use
    const { count: contactsCount, error: contactsError } = await supabase
      .from('client_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('contact_type_id', id)

    if (contactsError)
      throw new Error(`Usage check error: ${contactsError.message}`)

    if (contactsCount > 0)
      throw new Error(`Cannot delete contact type used in ${contactsCount} client contacts`)

    const { error } = await supabase
      .from('contact_types')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Contact type deletion error: ${error.message}`)

    return { success: true, message: 'Contact type deleted successfully' }
  } catch (error) {
    console.error('Error deleting contact type:', error)
    throw error
  }
}