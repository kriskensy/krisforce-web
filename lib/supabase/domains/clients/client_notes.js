import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

// GET list for specific client
export async function getClientNotes(client_id, filters = {}) {
  try {
    if (!client_id) throw new Error('Client ID is required')
    await verifyAccessLevel(1)//support+

    const { 
      search, 
      user_id, 
      limit = 10, 
      offset = 0, 
      orderBy = 'created_at', 
      orderDir = 'desc' 
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('client_notes')
      .select('id, client_id, user_id, user_profiles (first_name, last_name), note_text, created_at, deleted_at', { count: 'exact' })
      .eq('client_id', client_id)
      .is('deleted_at', null)

    //search by note text
    if (search) {
      query = query.ilike('note_text', `%${search}%`)
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
    console.error('Error fetching client notes:', error)
    throw error
  }
}

export async function getClientNoteById(noteId, client_id) {
  try {
    if (!noteId || !client_id) throw new Error('Note ID and Client ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('client_notes')
      .select('id, client_id, user_id, user_profiles (first_name, last_name), note_text, created_at, deleted_at')
      .eq('id', noteId)
      .eq('client_id', client_id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Client note not found')

    return data
  } catch (error) {
    console.error('Error fetching client note:', error)
    throw error
  }
}

export async function createClientNote(client_id, noteData) {
  try {
    if (!client_id) throw new Error('Client ID is required')
    await verifyAccessLevel(2)//manager+

    const { note_text } = noteData

    if (!note_text || note_text.trim().length < 3)
      throw new Error('Note text must be at least 3 characters long')

    const supabase = await getServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

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

    const { data: newNote, error: insertError } = await supabase
      .from('client_notes')
      .insert({
        client_id: client_id,
        user_id: user.id,
        note_text: note_text.trim()
      })
      .select()
      .single()

    if (insertError) throw new Error(`Note creation error: ${insertError.message}`)

    return await getClientNoteById(newNote.id, client_id)
  } catch (error) {
    console.error('Error creating client note:', error)
    throw error
  }
}

export async function updateClientNote(noteId, client_id, noteData) {
  try {
    if (!noteId || !client_id) throw new Error('Note ID and Client ID are required')
    await verifyAccessLevel(2)//manager+

    const { note_text } = noteData
    if (!note_text || note_text.trim().length < 3) {
      throw new Error('Note text must be at least 3 characters long')
    }

    const supabase = await getServerClient()

    //check if note exists and belongs to client
    const { data: existing } = await supabase
      .from('client_notes')
      .select('id, user_id')
      .eq('id', noteId)
      .eq('client_id', client_id)
      .is('deleted_at', null)
      .single()

    if (!existing) throw new Error('Client note not found')

    const { error: updateError } = await supabase
      .from('client_notes')
      .update({
        note_text: note_text.trim()
      })
      .eq('id', noteId)
      .eq('client_id', client_id)

    if (updateError)
      throw new Error(`Note update error: ${updateError.message}`)

    return await getClientNoteById(noteId, client_id)
  } catch (error) {
    console.error('Error updating client note:', error)
    throw error
  }
}

export async function deactivateClientNote(noteId, client_id) {
  try {
    if (!noteId || !client_id) throw new Error('Note ID and Client ID are required')
    await verifyAccessLevel(2, 'manager')

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('client_notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('client_id', client_id)
    
    if (error) throw new Error(`Note deactivation error: ${error.message}`)

    return await getClientNoteById(noteId, client_id)
  } catch (error) {
    console.error('Error deactivating client note:', error)
    throw error
  }
}

export async function reactivateClientNote(noteId, client_id) {
  try {
    if (!noteId || !client_id) throw new Error('Note ID and Client ID are required')
    await verifyAccessLevel(2, 'manager')

    const supabase = await getServerClient()
    const { error } = await supabase
      .from('client_notes')
      .update({ deleted_at: null })
      .eq('id', noteId)
      .eq('client_id', client_id)
    
    if (error) throw new Error(`Note reactivation error: ${error.message}`)

    return await getClientNoteById(noteId, client_id)
  } catch (error) {
    console.error('Error reactivating client note:', error)
    throw error
  }
}