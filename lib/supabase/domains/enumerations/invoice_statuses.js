import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getInvoiceStatuses(filters) {
  try {
    const {
      search,
      activeOnly,
      limit = 10,
      offset = 0,
      orderBy = 'code',
      orderDir = 'asc'
    } = filters

    await verifyAccessLevel(1) // support+

    const supabase = await getServerClient()
    let query = supabase
      .from('invoice_statuses')
      .select('id, code, name, active', { count: 'exact' })

    //filter active only
		if (activeOnly)
		  query = query.is('active', true)
    
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
    console.error('Error fetching invoice statuses:', error)
    throw error
  }
}

export async function getInvoiceStatusById(id) {
  try {
    if (!id) throw new Error('Invoice status ID is required')

    await verifyAccessLevel(1) // support+

    const supabase = await getServerClient()
    
    const { data, error } = await supabase
      .from('invoice_statuses')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Invoice status not found')

    return data
  } catch (error) {
    console.error('Error fetching invoice status:', error)
    throw error
  }
}

export async function createInvoiceStatus(statusData) {
  try {
    await verifyAccessLevel(3) // admin

    const { code, name } = statusData

    if (!code || code.trim() === '') throw new Error('Status code is required')
    if (!name || name.trim() === '') throw new Error('Status name is required')

    const supabase = await getServerClient()

    const { data: existingCode } = await supabase
      .from('invoice_statuses')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Invoice status code already exists')

    const { data: newStatus, error: insertError } = await supabase
      .from('invoice_statuses')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Invoice status creation error: ${insertError.message}`)

    return await getInvoiceStatusById(newStatus.id)
  } catch (error) {
    console.error('Error creating invoice status:', error)
    throw error
  }
}

export async function updateInvoiceStatus(id, statusData) {
  try {
    if (!id) throw new Error('Invoice status ID is required')

    await verifyAccessLevel(3) // admin

    const { code, name, active } = statusData
    const supabase = await getServerClient()

    const { data: existing } = await supabase
      .from('invoice_statuses')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existing) throw new Error('Invoice status not found')

    if (code && code.trim().toLowerCase() !== existing.code) {
      const { data: codeExists } = await supabase
        .from('invoice_statuses')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Invoice status code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('invoice_statuses')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Invoice status update error: ${updateError.message}`)

    return await getInvoiceStatusById(id)
  } catch (error) {
    console.error('Error updating invoice status:', error)
    throw error
  }
}


export async function deleteInvoiceStatus(id) {
  try {
    if (!id) throw new Error('Invoice status ID is required')

    await verifyAccessLevel(3) // admin

    const supabase = await getServerClient()

    const { count: usageCount, error: usageError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status_id', id)

    if (usageError)
      throw new Error(`Usage check error: ${usageError.message}`)

    if (usageCount > 0)
      throw new Error(`Cannot delete status that is used by ${usageCount} invoices. Deactivate it instead.`)

    const { error } = await supabase
      .from('invoice_statuses')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Invoice status deletion error: ${error.message}`)

    return { success: true, message: 'Invoice status deleted successfully' }
  } catch (error) {
    console.error('Error deleting invoice status:', error)
    throw error
  }
}