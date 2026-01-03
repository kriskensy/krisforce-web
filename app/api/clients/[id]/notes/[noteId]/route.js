import { getClientNoteById, updateClientNote, deactivateClientNote, reactivateClientNote } from '@/lib/supabase/domains/clients/client_notes'

export async function GET(request, { params }) {
  try {
    const { id, noteId } = await params
    const note = await getClientNoteById(noteId, id)

    return Response.json(note, { status: 200 })
  } catch (error) {
    console.error('GET /api/clients/[id]/notes/[noteId] error:', error)
    return Response.json(
      { error: 'Failed to fetch client note', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, noteId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.note_text) {
      return Response.json(
        { error: 'Validation error', message: 'Note text required' },
        { status: 400 }
      )
    }

    const note = await updateClientNote(noteId, id, data)
    return Response.json(note, { status: 200 })
  } catch (error) {
    console.error('PUT /api/clients/[id]/notes/[noteId] error:', error)
    return Response.json(
      { error: 'Failed to update client note', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, noteId } = await params
    const note = await deactivateClientNote(noteId, id)

    return Response.json(note, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/clients/[id]/notes/[noteId] error:', error)
    return Response.json(
      { error: 'Failed to deactivate client note', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id, noteId } = await params
    const note = await reactivateClientNote(noteId, id)
    
    return Response.json(note, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/clients/[id]/notes/[noteId] error:', error)
    return Response.json(
      { error: 'Failed to reactivate client note', message: error.message },
      { status: 500 }
    )
  }
}
