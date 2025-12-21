import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'
//TODO uncomment access verify
export async function getticket_priorities(filters) {
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
      .from('ticket_priorities')
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
    console.error('Error fetching ticket priorities:', error)
    throw error
  }
}

export async function getTicketPriorityById(id) {
  try {
    if (!id) throw new Error('Ticket priority ID is required')

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('ticket_priorities')
      .select('id, code, name, level, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') 
      throw new Error(error.message)

    if (!data) throw new Error('Ticket priority not found')

    return data
  } catch (error) {
    console.error('Error fetching ticket priority:', error)
    throw error
  }
}

export async function createTicketPriority(ticketPriorityData) {
  try {
    // await verifyAccessLevel(3)//admin
    const { code, name, level } = ticketPriorityData

    if (!code || code.trim() === '') throw new Error('Ticket priority code is required')
    if (!name || name.trim() === '') throw new Error('Ticket priority name is required')
    if (level === undefined || level < 1 || level > 10) throw new Error('Level must be between 1-10')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingCode } = await supabase
      .from('ticket_priorities')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Ticket priority code already exists')

    const { data: existingLevel } = await supabase
      .from('ticket_priorities')
      .select('id')
      .eq('level', level)
      .maybeSingle()

    if (existingLevel)
      throw new Error('Level already exists')

    const { data: newPriority, error: insertError } = await supabase
      .from('ticket_priorities')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        level,
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Ticket priority creation error: ${insertError.message}`)

    return await getTicketPriorityById(newPriority.id)
  } catch (error) {
    console.error('Error creating ticket priority:', error)
    throw error
  }
}

export async function updateTicketPriority(id, ticketPriorityData) {
  try {
    if (!id) throw new Error('Ticket priority ID is required')

    // await verifyAccessLevel(3)//admin

    const { code, name, level, active } = ticketPriorityData
    const supabase = await getServerClient()

    const { data: existingTicketPriority } = await supabase
      .from('ticket_priorities')
      .select('id, code, level')
      .eq('id', id)
      .single()

    if (!existingTicketPriority) throw new Error('Ticket priority not found')

    //check is code unique?
    if (code && code.trim().toLowerCase() !== existingTicketPriority.code) {
      const { data: codeExists } = await supabase
        .from('ticket_priorities')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Ticket priority code already exists')
    }

    //check is level unique?
    if (level !== undefined && level !== existingTicketPriority.level) {
      if (level < 1 || level > 10)
        throw new Error('Level must be between 1-10')

      const { data: levelExists } = await supabase
        .from('ticket_priorities')
        .select('id')
        .eq('level', level)
        .neq('id', id)
        .maybeSingle()

      if (levelExists)
        throw new Error('Level already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (level !== undefined) updatePayload.level = level
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('ticket_priorities')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Ticket priority update error: ${updateError.message}`)

    return await getTicketPriorityById(id)
  } catch (error) {
    console.error('Error updating ticket priority:', error)
    throw error
  }
}

export async function deleteTicketPriority(id) {
  try {
    if (!id) throw new Error('Ticket priority ID is required')

    // await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if ticket priority in use
    const { count: ticketsCount, error: ticketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('priority_id', id)
      .is('deleted_at', null)

    if (ticketsError)
      throw new Error(`Usage check error: ${ticketsError.message}`)

    if (ticketsCount > 0)
      throw new Error(`Cannot delete ticket priority used in ${ticketsCount} tickets`)

    const { error } = await supabase
      .from('ticket_priorities')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Ticket priority deletion error: ${error.message}`)

    return { success: true, message: 'Ticket priority deleted successfully' }
  } catch (error) {
    console.error('Error deleting ticket priority:', error)
    throw error
  }
}
