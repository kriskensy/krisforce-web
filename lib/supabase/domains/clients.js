import { getServerClient, verifyAuth } from "../server";
import { createClient as createAdminClient } from '@supabase/supabase-js'

//GET
export async function getClients(filters = {}) {
  try {
    const {
      search,
      status,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc'
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('clients')
      .select('id, code, name, nip, status, created_by, created_at, client_addresses (id, street, city, zip_code, address_types (code, name)), client_contacts (id, type, value)', { count: 'exact' })

    //name or nip searching
    if(search) {
      query = query.or(
        `name.ilike.%${search}%,nip.ilike.%${search}%,code.ilike.%${search}%`
      )
    }

    //status filter
    if(status) {
      query = query.eq('status', status)
    }

    //exclude soft deleted
    query = query.is('deleted_at', null)

    //sort + pagination
    query = query
      .order(orderBy, { scending: order === 'asc'})
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if(error) {
      console.warn('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset
    }

  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

//GET id
export async function getClientById(id) {
  try{
    if(!id) throw new Error('Client ID is required')

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('clients')
      .select('id, code, name, nip, status, created_by, created_at, client_addresses (id, street, city, zip_code, address_types (code, name)), client_contacts (id, type, value)')
      .eq('id', id)
      .maybeSingle()

    if(error) throw new Error(error.message)

    return data

  } catch (error) {
    console.error('Error fetching client:', error)
    throw error
  }
}