import { getClientNotes, createClientNote } from '../../../../../lib/supabase/domains/clients/client_notes'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      userid: searchParams.get('user_id'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'created_at',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getClientNotes(id, filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/clients/[id]/notes error:', error)
    return Response.json(
      { error: 'Failed to fetch client notes', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
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

    const note = await createClientNote(id, data)
    return Response.json(note, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients/[id]/notes error:', error)
    return Response.json(
      { error: 'Failed to create client note', message: error.message },
      { status: 500 }
    )
  }
}
