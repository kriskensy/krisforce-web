import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getClientContracts(client_id, filters) {
  try {
    if (!client_id) throw new Error('Client ID is required')
    await verifyAccessLevel(1)//support+

    const { 
      search,
      active,
      limit = 10, 
      offset = 0, 
      orderBy = 'start_date', 
      orderDir = 'desc' 
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('contracts')
      .select('id, client_id, number, start_date, end_date, value, deleted_at', { count: 'exact' })
      .eq('client_id', client_id)
      .is('deleted_at', null)

    //search by contract number
    if (search) {
      query = query.ilike('number', `%${search}%`)
    }

    //filter active contracts (end_date >= today)
      if (active === true)
        query = query.gte('end_date', new Date().toISOString().split('T')[0])

      if (active === false)
        query = query.lt('end_date', new Date().toISOString().split('T')[0])

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
    console.error('Error fetching client contracts:', error)
    throw error
  }
}

export async function getClientContractById(contractId, client_id) {
  try {
    if (!contractId || !client_id) throw new Error('Contract ID and Client ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('contracts')
      .select('id, client_id, number, start_date, end_date, value, deleted_at')
      .eq('id', contractId)
      .eq('client_id', client_id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Client contract not found')

    return data
  } catch (error) {
    console.error('Error fetching client contract:', error)
    throw error
  }
}

export async function createClientContract(client_id, contractData) {
  try {
    if (!client_id) throw new Error('Client ID is required')
    await verifyAccessLevel(2)//manager+

    const { number, start_date, end_date, value } = contractData
    
    if (!number || number.trim() === '') throw new Error('Contract number is required')
    if (!start_date) throw new Error('Start date is required')
    if (!end_date) throw new Error('End date is required')
    if (new Date(start_date) > new Date(end_date)) {
      throw new Error('Start date cannot be after end date')
    }
    if (!value || value < 0) throw new Error('Valid contract value is required')

    const supabase = await getServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user) throw new Error('Could not identify current user')

    //check if client exists
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .is('deleted_at', null)
      .single()
    
    if (!client) throw new Error('Client not found')

    //check if contract number is unique
    const { data: existingNumber } = await supabase
      .from('contracts')
      .select('id')
      .eq('number', number.trim())
      .is('deleted_at', null)
      .maybeSingle()
    
    if (existingNumber)
      throw new Error('Contract number already exists')

    const { data: newContract, error: insertError } = await supabase
      .from('contracts')
      .insert({
        client_id: client_id,
        number: number.trim(),
        start_date,
        end_date,
        value
      })
      .select()
      .single()

    if (insertError) throw new Error(`Contract creation error: ${insertError.message}`)

    return await getClientContractById(newContract.id, client_id)
  } catch (error) {
    console.error('Error creating client contract:', error)
    throw error
  }
}

export async function updateClientContract(contractId, client_id, contractData) {
  try {
    if (!contractId || !client_id) throw new Error('Contract ID and Client ID are required')
    await verifyAccessLevel(2)//manager+

    const { number, start_date, end_date, value } = contractData

    const supabase = await getServerClient()

    //check if contract exists and belongs to client
    const { data: existing } = await supabase
      .from('contracts')
      .select('id, number')
      .eq('id', contractId)
      .eq('client_id', client_id)
      .is('deleted_at', null)
      .single()

    if (!existing) throw new Error('Client contract not found')

    //validate dates
    if (start_date && end_date && new Date(start_date) > new Date(end_date))
      throw new Error('Start date cannot be after end date')

    if (value !== undefined && value < 0)
      throw new Error('Valid contract value is required')

    //check if number is unique
    if (number && number.trim() !== existing.number) {
      const { data: numberExists } = await supabase
        .from('contracts')
        .select('id')
        .eq('number', number.trim())
        .is('deleted_at', null)
        .neq('id', contractId)
        .maybeSingle()
      
      if (numberExists) throw new Error('Contract number already exists')
    }

    const updatePayload = {}
    if (number !== undefined) updatePayload.number = number.trim()
    if (start_date !== undefined) updatePayload.start_date = start_date
    if (end_date !== undefined) updatePayload.end_date = end_date
    if (value !== undefined) updatePayload.value = value

    const { error: updateError } = await supabase
      .from('contracts')
      .update(updatePayload)
      .eq('id', contractId)
      .eq('client_id', client_id)

    if (updateError) throw new Error(`Contract update error: ${updateError.message}`)

    return await getClientContractById(contractId, client_id)
  } catch (error) {
    console.error('Error updating client contract:', error)
    throw error
  }
}

//DELETE soft delete
export async function deactivateClientContract(contractId, client_id) {
  try {
    if (!contractId || !client_id) throw new Error('Contract ID and Client ID are required')
    await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('contracts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', contractId)
      .eq('client_id', client_id)
    
    if (error) throw new Error(`Contract deactivation error: ${error.message}`)

    return await getClientContractById(contractId, client_id)
  } catch (error) {
    console.error('Error deactivating client contract:', error)
    throw error
  }
}

//PATCH reactivate
export async function reactivateClientContract(contractId, client_id) {
  try {
    if (!contractId || !client_id) throw new Error('Contract ID and Client ID are required')
    await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('contracts')
      .update({ deleted_at: null })
      .eq('id', contractId)
      .eq('client_id', client_id)
    
    if (error) throw new Error(`Contract reactivation error: ${error.message}`)

    return await getClientContractById(contractId, client_id)
  } catch (error) {
    console.error('Error reactivating client contract:', error)
    throw error
  }
}