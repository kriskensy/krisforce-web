import { getServerClient, verifyAuth } from "../../server";
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyAccessLevel } from "@/lib/utils/auth/verifyAccessLevel";

//GET
export async function getClients(filters = {}) {
  try {
    const {
      search,
      limit = 10,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc'
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('clients')
      .select('id, code, name, nip, created_by, created_at, client_addresses (id, street, city, zip_code, address_types (code, name)), client_contacts (id, type, value), deleted_at', { count: 'exact' })

    //name, nip or code searching
    if(search) {
      query = query.or(
        `name.ilike.%${search}%,nip.ilike.%${search}%,code.ilike.%${search}%`
      )
    }

    //exclude soft deleted
    query = query.is('deleted_at', null)

    //sort + pagination
    query = query
      .order(orderBy, { ascending: order === 'asc'})
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
      .select('id, code, name, nip, created_by, created_at, client_addresses (id, street, city, zip_code, address_types (code, name)), client_contacts (id, type, value), deleted_at')
      .eq('id', id)
      .maybeSingle()

    if(error) throw new Error(error.message)

    return data

  } catch (error) {
    console.error('Error fetching client:', error)
    throw error
  }
}

//DELETE - soft delete / deactivate
export async function deactivateClient(id) {
  try {
    if(!id) throw new Error('Client ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if(error) throw new Error(error.message)

    return getClientById(id)

  } catch (error) {
    console.error('Error deactivating client:', error)
    throw error
  }
}

//PATCH - reactivate
export async function reactivateClient(id) {
  try {
    if(!id) throw new Error('Client ID is required')

    await verifyAccessLevel(2); //manager +
    
    const supabase = await getServerClient()

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: null })
      .eq('id', id)

    if(error) throw new Error(error.message)

    return getClientById(id)

  } catch (error) {
    console.error('Error reactivating client:', error.message)
    throw error
  }
}