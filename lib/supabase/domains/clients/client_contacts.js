import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getClientContacts(client_id, filters) {
  try {
    if (!client_id) throw new Error('Client ID is required')
    await verifyAccessLevel(1)//support+

    const {
      search,
      activeOnly,
      contact_type,
      limit = 10,
      offset = 0,
      orderBy = 'client_id',
      orderDir = 'desc'
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('client_contacts')
      .select('id, client_id, contact_type_id, contact_types (code, name), value, deleted_at', { count: 'exact' })
      .eq('client_id', client_id)

    //filter active only
		if (activeOnly)
		  query = query.is('deleted_at', null)
    
    //search by value
    if (search) {
      query = query.ilike('value', `%${search}%`)
    }

    //filter by contact type
    if (contact_type) {
      query = query.eq('contact_type_id', contact_type)
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
    console.error('Error fetching client contacts:', error)
    throw error
  }
}

export async function getClientContactById(contactId, client_id) {
  try {
    if (!contactId || !client_id) throw new Error('Contact ID and Client ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('client_contacts')
      .select('id, client_id, contact_type_id, contact_types (code, name), value, deleted_at')
      .eq('id', contactId)
      .eq('client_id', client_id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data)
      throw new Error('Client contact not found')

    return data
  } catch (error) {
    console.error('Error fetching client contact:', error)
    throw error
  }
}

export async function createClientContact(client_id, contactData) {
  try {
    if (!client_id) throw new Error('Client ID is required')
    await verifyAccessLevel(2)//manager+

    const { contact_type_id, value } = contactData

    if (!contact_type_id)
      throw new Error('Contact type ID is required')

    if (!value || value.trim() === '')
      throw new Error('Contact value is required')

    const supabase = await getServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    //check if client exists
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .is('deleted_at', null)
      .single()
    
    if (!client) throw new Error('Client not found')

    //check for duplicate contact type for this client
    const { data: existingContact } = await supabase
      .from('client_contacts')
      .select('id')
      .eq('client_id', client_id)
      .eq('contact_type_id', contact_type_id)
      .maybeSingle()
    
    if (existingContact)
      throw new Error('Contact type already exists for this client')

    const { data: newContact, error: insertError } = await supabase
      .from('client_contacts')
      .insert({
        client_id: client_id,
        contact_type_id,
        value: value.trim()
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Contact creation error: ${insertError.message}`)

    return await getClientContactById(newContact.id, client_id)
  } catch (error) {
    console.error('Error creating client contact:', error)
    throw error
  }
}

export async function updateClientContact(contactId, client_id, contactData) {
  try {
    if (!contactId || !client_id) throw new Error('Contact ID and Client ID are required')
    await verifyAccessLevel(2)//manager+

    const { contact_type_id, value } = contactData

    if (!contact_type_id)
      throw new Error('Contact type ID is required')

    if (!value || value.trim() === '')
      throw new Error('Contact value is required')

    const supabase = await getServerClient()

    //check if contact exists and belongs to client
    const { data: existing } = await supabase
      .from('client_contacts')
      .select('id, contact_type_id')
      .eq('id', contactId)
      .eq('client_id', client_id)
      .single()

    if (!existing) throw new Error('Client contact not found')

    //check for duplicate contact type
    if (contact_type_id && contact_type_id !== existing.contact_type_id) {
      const { data: duplicate } = await supabase
        .from('client_contacts')
        .select('id')
        .eq('client_id', client_id)
        .eq('contact_type_id', contact_type_id)
        .neq('id', contactId)
        .maybeSingle()
      
      if (duplicate) throw new Error('Contact type already exists for this client')
    }

    const { error: updateError } = await supabase
      .from('client_contacts')
      .update({
        contact_type_id,
        value: value.trim()
      })
      .eq('id', contactId)
      .eq('client_id', client_id)

    if (updateError) throw new Error(`Contact update error: ${updateError.message}`)

    return await getClientContactById(contactId, client_id)
  } catch (error) {
    console.error('Error updating client contact:', error)
    throw error
  }
}

export async function deleteClientContact(contactId, client_id) {
  try {
    if (!contactId || !client_id) throw new Error('Contact ID and Client ID are required')
    await verifyAccessLevel(2, 'manager')

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('client_contacts')
      .delete()
      .eq('id', contactId)
      .eq('client_id', client_id)

    if (error) throw new Error(`Contact deletion error: ${error.message}`)

    return { success: true, message: 'Contact deleted successfully' }
  } catch (error) {
    console.error('Error deleting client contact:', error)
    throw error
  }
}