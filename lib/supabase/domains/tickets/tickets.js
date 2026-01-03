import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'
import { verifyAuthenticated } from '@/lib/utils/auth/verifyAuthenticated'

export async function getTickets(filters) {
  try {
    await verifyAccessLevel(1)//support+

    const { 
      search, 
      status, 
      priority, 
      client, 
      assigned_to, 
      limit = 10, 
      offset = 0, 
      orderBy = 'created_at', 
      orderDir = 'desc' 
    } = filters


    const supabase = await getServerClient()

    let query = supabase
      .from('tickets')
      .select('id, client_id, subject, description, priority_id, ticket_priorities(name, level), status_id, ticket_statuses (name), clients (name), assigned_to, created_by, created_at, deleted_at', { count: 'exact' })
      .is('deleted_at', null)

    // subject, client name, description searching
    if (search) {
      query = query.or(
        `subject.ilike.%${search}%,clients.name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    //filters
    if (status) query.eq('status_id', status)
    if (priority) query.eq('priority_id', priority)
    if (client) query.eq('clientid', client)
    if (assigned_to) query.eq('assigned_to', assigned_to)

    //sort + pagination
    query = query
      .order(orderBy, { ascending: orderDir === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    //user names (created_by, assigned_to)
    const tickets = data
    const userIds = [...new Set([
      ...tickets.map(ticket => ticket.created_by).filter(Boolean),
      ...tickets.map(ticket => ticket.assigned_to).filter(Boolean)
    ])]
    
    let profilesByUserId = {}
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds)

      if (profilesError && profilesError.code !== 'PGRST116')
        throw new Error(profilesError.message)

      profiles?.forEach(profile => {
        const fullName = profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`.trim() 
          : null

        profilesByUserId[profile.user_id] = fullName
      })
    }

    const extended = tickets.map(ticket => ({
      ...ticket,
      created_byname: profilesByUserId[ticket.created_by] || null,
      assigned_toname: profilesByUserId[ticket.assigned_to] || null
    }))

    return { 
      data: extended, 
      total: count || 0, 
      limit, 
      offset 
    }
  } catch (error) {
    console.error('Error fetching tickets:', error)
    throw error
  }
}

export async function getTicketById(id) {
  try {
    if (!id) throw new Error('Ticket ID is required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, client_id, subject, description, priority_id, ticket_priorities(name, level), status_id, ticket_statuses (name), clients (name), assigned_to, created_by, created_at, deleted_at')
      .eq('id', id)
      .maybeSingle()

    if (ticketError && ticketError.code !== 'PGRST116')
      throw new Error(ticketError.message)

    if (!ticket) throw new Error('Ticket not found')

    //comments
    const { data: comments, error: commentsError } = await supabase
      .from('ticket_comments')
      .select('id, ticket_id, message, created_at, user_id, user_profiles (first_name, last_name)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    //attachments
    const { data: attachments, error: attachmentsError } = await supabase
      .from('ticket_attachments')
      .select('id, ticket_id, filename, filepath, uploaded_by')
      .eq('ticket_id', id)

    if (commentsError)
      console.warn('Comments fetch warning:', commentsError.message)

    if (attachmentsError)
      console.warn('Attachments fetch warning:', attachmentsError.message)

    //user names
    let created_byName = null, assigned_toName = null
    if (ticket.created_by || ticket.assigned_to) {
      const userIds = [ticket.created_by, ticket.assigned_to].filter(Boolean)
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds)
      
      profiles?.forEach(profile => {
        const fullName = profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`.trim() 
          : null
        if (profile.user_id === ticket.created_by) created_byName = fullName
        if (profile.user_id === ticket.assigned_to) assigned_toName = fullName
      })
    }

    return { 
      ...ticket, 
      created_byname: created_byName,
      assigned_toname: assigned_toName,
      comments: comments || [],
      attachments: attachments || []
    }
  } catch (error) {
    console.error('Error fetching ticket:', error)
    throw error
  }
}

//only for clients
export async function createTicket(ticketData) {
  try {
    await verifyAuthenticated()//client+

    const {
      subject,
      description,
      priority_id,
      status_id,
      client_id,
      assigned_to
    } = ticketData

    if (!subject) throw new Error('Ticket subject is required')
    if (!client_id) throw new Error('Client ID is required')

    const supabase = await getServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    const { data: userData } = await supabase
      .from('users')
      .select('roles(code)')
      .eq('id', user.id)
      .single()

    //only client can create ticket
    if (userData?.roles?.code !== 'user')
      throw new Error('Only clients can create tickets')

    const { data: newTicket, error: insertError } = await supabase
      .from('tickets')
      .insert({
        subject,
        description,
        priority_id,
        status_id: await getDefaultstatusId(supabase),
        client_id,
        created_by: user.id,
        assigned_to: null
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Ticket creation error: ${insertError.message}`)

    return await getTicketById(newTicket.id)
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

//helper function default status by creation
async function getDefaultstatusId(supabase) {
  const { data } = await supabase
    .from('ticket_statuses')
    .select('id')
    .eq('code', 'open')
    .single()
  return data?.id
}

export async function updateTicket(ticketId, ticketData) {
  try {
    if (!ticketId) throw new Error('Ticket ID is required')
    await verifyAuthenticated() //client+

    const supabase = await getServerClient()
    
    const [{ data: { user } }, { data: ticket }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('tickets')
        .select('*, roles:users(role_id)')
        .eq('id', ticketId)
        .single()
    ])

    const { data: currentUser } = await supabase
      .from('users')
      .select('roles(code)')
      .eq('id', user.id)
      .single()

    const role = currentUser?.roles?.code
    const updatePayload = {}

    //only support/manager/admin can change ticket status
    if (ticketData.status_id) {
      if (['support', 'manager', 'admin'].includes(role)) {
        updatePayload.status_id = ticketData.status_id
      } else {
        throw new Error('Only staff can change ticket status')
      }
    }

    //assigne only to support or ticket creator
    if (ticketData.assigned_to) {
      const { data: assignee } = await supabase
        .from('users')
        .select('id, roles(code)')
        .eq('id', ticketData.assigned_to)
        .single()

      const isSupport = ['support'].includes(assignee?.roles?.code)
      const isCreator = assignee?.id === ticket.created_by

      if (isSupport || isCreator) {
        updatePayload.assigned_to = ticketData.assigned_to
      } else {
        throw new Error('Ticket can only be assigned to staff or the creator')
      }
    }

    if (ticketData.subject) updatePayload.subject = ticketData.subject
    if (ticketData.description) updatePayload.description = ticketData.description

    const { error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', ticketId)

    if (error) throw error
    return await getTicketById(ticketId)
  } catch (error) {
    console.error('Error updating ticket:', error)
    throw error
  }
}

//DELETE soft delete
export async function deactivateTicket(id) {
  try {
    if (!id) throw new Error('Ticket ID is required')
    await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('tickets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getTicketById(id)
  } catch (error) {
    console.error('Error deactivating ticket:', error)
    throw error
  }
}

//PATCH reactivate
export async function reactivateTicket(id) {
  try {
    if (!id) throw new Error('Ticket ID is required')
    await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('tickets')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getTicketById(id)
  } catch (error) {
    console.error('Error reactivating ticket:', error)
    throw error
  }
}