import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'
//TODO uncomment access verify
export async function getticket_statuses(filters) {
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
      .from('ticket_statuses')
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
    console.error('Error fetching ticket statuses:', error)
    throw error
  }
}

export async function getTicketStatusById(id) {
  try {
    if (!id) throw new Error('Ticket status ID is required')

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('ticket_statuses')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Ticket status not found')

    return data
  } catch (error) {
    console.error('Error fetching ticket status:', error)
    throw error
  }
}

export async function createTicketStatus(ticketStatusData) {
  try {
    // await verifyAccessLevel(3)//admin
    const { code, name } = ticketStatusData

    if (!code || code.trim() === '') throw new Error('Ticket status code is required')
    if (!name || name.trim() === '') throw new Error('Ticket status name is required')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingCode } = await supabase
      .from('ticket_statuses')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Ticket status code already exists')

    const { data: newStatus, error: insertError } = await supabase
      .from('ticket_statuses')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Ticket status creation error: ${insertError.message}`)

    return await getTicketStatusById(newStatus.id)
  } catch (error) {
    console.error('Error creating ticket status:', error)
    throw error
  }
}

export async function updateTicketStatus(id, ticketStatusData) {
  try {
    if (!id) throw new Error('Ticket status ID is required')

    // await verifyAccessLevel(3)//admin

    const { code, name, active } = ticketStatusData
    const supabase = await getServerClient()

    const { data: existingTicketStatus } = await supabase
      .from('ticket_statuses')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existingTicketStatus) throw new Error('Ticket status not found')

    //check is code unique?
    if (code && code.trim().toLowerCase() !== existingTicketStatus.code) {
      const { data: codeExists } = await supabase
        .from('ticket_statuses')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle
      if (codeExists) throw new Error('Ticket status code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('ticket_statuses')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Ticket status update error: ${updateError.message}`)

    return await getTicketStatusById(id)
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}

export async function deleteTicketStatus(id) {
  try {
    if (!id) throw new Error('Ticket status ID is required')

    // await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if ticket status in us
    const { count: ticketsCount, error: ticketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status_id', id)
      .is('deleted_at', null)

    if (ticketsError)
      throw new Error(`Usage check error: ${ticketsError.message}`)

    if (ticketsCount > 0)
      throw new Error(`Cannot delete ticket status used in ${ticketsCount} tickets`)

    const { error } = await supabase
      .from('ticket_statuses')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Ticket status deletion error: ${error.message}`)

    return { success: true, message: 'Ticket status deleted successfully' }
  } catch (error) {
    console.error('Error deleting ticket status:', error)
    throw error
  }
}
