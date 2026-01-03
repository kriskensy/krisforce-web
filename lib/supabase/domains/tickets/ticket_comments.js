import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getTicketComments(ticket_id, filters) {
  try {
    if (!ticket_id) throw new Error('Ticket ID is required')
    await verifyAccessLevel(1)//support+

    const { 
      search, 
      user_id, 
      limit = 20, 
      offset = 0, 
      orderBy = 'created_at', 
      orderDir = 'asc' 
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('ticket_comments')
      .select('id, ticket_id, user_id, user_profiles (first_name, last_name),     message, created_at', { count: 'exact' })
      .eq('ticket_id', ticket_id)

    //message content searching
    if (search) {
      query = query.ilike('message', `%${search}%`)
    }

    //filter by user
    if (user_id) {
      query = query.eq('user_id', user_id)
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
    console.error('Error fetching ticket comments:', error)
    throw error
  }
}

export async function getTicketCommentById(commentId, ticket_id) {
  try {
    if (!commentId || !ticket_id) throw new Error('Comment ID and Ticket ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('ticket_comments')
      .select('id, ticket_id, user_id, user_profiles (first_name, last_name),     message, created_at')
      .eq('id', commentId)
      .eq('ticket_id', ticket_id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Ticket comment not found')

    return data
  } catch (error) {
    console.error('Error fetching ticket comment:', error)
    throw error
  }
}

export async function createTicketComment(ticket_id, commentData) {
  try {
    if (!ticket_id) throw new Error('Ticket ID is required')
    await verifyAccessLevel(1)//support+

    const { message } = commentData
    
    if (!message || message.trim().length < 8)
      throw new Error('Comment must be at least 8 characters long')

    const supabase = await getServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    //check if ticket exists
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', ticket_id)
      .is('deleted_at', null)
      .single()
    
    if (!ticket) throw new Error('Ticket not found')

    const { data: newComment, error: insertError } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticket_id,
        user_id: user.id,
        message: message.trim()
      })
      .select()
      .single()

    if (insertError) throw new Error(`Comment creation error: ${insertError.message}`)

    return await getTicketCommentById(newComment.id, ticket_id)
  } catch (error) {
    console.error('Error creating ticket comment:', error)
    throw error
  }
}

export async function updateTicketComment(commentId, ticket_id, commentData) {
  try {
    if (!commentId || !ticket_id) throw new Error('Comment ID and Ticket ID are required')
    await verifyAccessLevel(3)//admin

    const { message } = commentData
    if (!message || message.trim().length < 8) {
      throw new Error('Comment must be at least 8 characters long')
    }

    const supabase = await getServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    //check if comment exists, belongs to ticket, and user is admin
    const { data: existing } = await supabase
      .from('ticket_comments')
      .select('id, user_id, created_at')
      .eq('id', commentId)
      .eq('ticket_id', ticket_id)
      .single()

    if (!existing) throw new Error('Ticket comment not found')

    const { error: updateError } = await supabase
      .from('ticket_comments')
      .update({
        message: message.trim()
      })
      .eq('id', commentId)
      .eq('ticket_id', ticket_id)

    if (updateError) throw new Error(`Comment update error: ${updateError.message}`)

    return await getTicketCommentById(commentId, ticket_id)
  } catch (error) {
    console.error('Error updating ticket comment:', error)
    throw error
  }
}

export async function deleteTicketComment(commentId, ticket_id) {
  try {
    if (!commentId || !ticket_id) throw new Error('Comment ID and Ticket ID are required')
    await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    const { data: existing } = await supabase
      .from('ticket_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .eq('ticket_id', ticket_id)
      .single()

    if (!existing) throw new Error('Ticket comment not found')

    const { error: deleteError } = await supabase
      .from('ticket_comments')
      .delete()
      .eq('id', commentId)
      .eq('ticket_id', ticket_id)

    if (deleteError) throw new Error(`Comment deletion error: ${deleteError.message}`)

    return { success: true, message: 'Ticket comment deleted successfully' }
  } catch (error) {
    console.error('Error deleting ticket comment:', error)
    throw error
  }
}